import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Bed, Bath, Square, Heart, DollarSign, ArrowUpDown } from "lucide-react";
import { US_STATES, COUNTRIES } from "@/lib/locations";

interface Property {
  id: string;
  title: string;
  street_address: string | null;
  city: string;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  rent_total: number | null;
  rent_amount: number;
  total_bedrooms: number;
  total_bathrooms: number | null;
  square_feet: number | null;
  photos: string[] | null;
  amenities: string[] | null;
  available_from: string | null;
  listing_source: string | null;
  created_at: string;
}

const Properties = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set());
  
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [state, setState] = useState(searchParams.get("state") || "");
  const [country, setCountry] = useState(searchParams.get("country") || "US");
  const [minRent, setMinRent] = useState(searchParams.get("minRent") || "");
  const [maxRent, setMaxRent] = useState(searchParams.get("maxRent") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    loadUserPreferences();
    loadSavedListings();
  }, []);

  useEffect(() => {
    loadProperties();
  }, [city, state, country, minRent, maxRent, bedrooms, sortBy]);

  const loadUserPreferences = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      loadProperties();
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("preferred_cities, preferred_state")
      .eq("id", session.user.id)
      .single();

    if (profile) {
      if (!searchParams.get("city") && profile.preferred_cities && Array.isArray(profile.preferred_cities) && profile.preferred_cities.length > 0) {
        setCity(profile.preferred_cities[0]);
      }
      if (!searchParams.get("state") && profile.preferred_state) {
        setState(profile.preferred_state);
      }
    }
    
    loadProperties();
  };

  const loadSavedListings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("saved_listings")
      .select("property_id")
      .eq("user_id", session.user.id);

    if (data) {
      setSavedListings(new Set(data.map(item => item.property_id)));
    }
  };

  const loadProperties = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("properties")
        .select("*")
        .eq("is_active", true);

      if (city) {
        query = query.ilike("city", `%${city}%`);
      }
      if (state && state !== "any") {
        query = query.eq("state", state);
      }
      if (country && country !== "any") {
        query = query.eq("country", country);
      }
      if (minRent) {
        query = query.gte("rent_amount", parseInt(minRent));
      }
      if (maxRent) {
        query = query.lte("rent_amount", parseInt(maxRent));
      }
      if (bedrooms && bedrooms !== "any") {
        query = query.gte("total_bedrooms", parseInt(bedrooms));
      }

      // Apply sorting
      switch (sortBy) {
        case "price-asc":
          query = query.order("rent_amount", { ascending: true });
          break;
        case "price-desc":
          query = query.order("rent_amount", { ascending: false });
          break;
        case "newest":
          query = query.order("created_at", { ascending: false });
          break;
        default:
          query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      if (error) throw error;
      setProperties(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadProperties();
  };

  const toggleSave = async (propertyId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    try {
      if (savedListings.has(propertyId)) {
        await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", session.user.id)
          .eq("property_id", propertyId);
        
        setSavedListings(prev => {
          const next = new Set(prev);
          next.delete(propertyId);
          return next;
        });
        
        toast({
          title: "Removed from saved",
          description: "Property removed from your saved listings",
        });
      } else {
        await supabase
          .from("saved_listings")
          .insert({ user_id: session.user.id, property_id: propertyId });
        
        setSavedListings(prev => new Set(prev).add(propertyId));
        
        toast({
          title: "Saved",
          description: "Property added to your saved listings",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <SubscriptionBanner />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full rounded-t-lg" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <SubscriptionBanner />
      
      {/* Header with gradient */}
      <div className="bg-gradient-primary bg-grain py-12 px-4">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-white animate-fade-up">Find a place to live bigger with less.</h1>
          <p className="text-white/90 animate-fade-in">Browse verified rentals in your preferred location and budget.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Bar with gradient border */}
        <Card className="mb-8 shadow-hover border-2 border-transparent bg-gradient-to-r from-primary/10 to-accent/10 animate-scale-in">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City
                </label>
                <Input
                  placeholder="New Haven"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="transition-fast hover:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Country</label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    <SelectItem value="any">Any Country</SelectItem>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Select value={state} onValueChange={setState} disabled={country !== "US"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] overflow-y-auto">
                    <SelectItem value="any">Any State</SelectItem>
                    {US_STATES.map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Min Rent
                </label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={minRent}
                  onChange={(e) => setMinRent(e.target.value)}
                  className="transition-fast hover:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Rent</label>
                <Input
                  type="number"
                  placeholder="3500"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
                  className="transition-fast hover:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Bed className="h-4 w-4" />
                  Bedrooms
                </label>
                <Select value={bedrooms} onValueChange={setBedrooms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-4">
              <div className="flex-1">
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="mt-6 px-8 shadow-glow hover:shadow-hover transition-smooth bg-gradient-primary" onClick={handleSearch}>
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Grid */}
        {properties.length === 0 ? (
          <div className="text-center py-16 animate-fade-in">
            <p className="text-xl text-muted-foreground mb-4">No properties found matching your criteria.</p>
            <p className="text-muted-foreground">Try adjusting your filters or check back later for new listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, idx) => (
              <Card 
                key={property.id} 
                className="overflow-hidden hover:shadow-glow transition-smooth cursor-pointer group animate-fade-up border-2 hover:border-primary/30"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={property.photos?.[0] || "https://placehold.co/400x300/e5e5e5/666666?text=No+Image"}
                    alt={property.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white backdrop-blur-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSave(property.id);
                    }}
                  >
                    <Heart className={`h-5 w-5 transition-fast ${savedListings.has(property.id) ? "fill-primary text-primary" : ""}`} />
                  </Button>
                </div>
                <CardHeader>
                  <h3 className="text-xl font-semibold line-clamp-1 group-hover:text-primary transition-fast">{property.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {property.city}{property.state ? `, ${property.state}` : ""}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
                    ${(property.rent_total || property.rent_amount).toLocaleString()} / month
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {property.total_bedrooms} bed
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-4 w-4" />
                      {property.total_bathrooms || 1} bath
                    </span>
                    {property.square_feet && (
                      <span className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        {property.square_feet.toLocaleString()} sqft
                      </span>
                    )}
                  </div>
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="text-xs bg-muted px-2 py-1 rounded hover:bg-primary/10 transition-fast">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full bg-gradient-accent hover:shadow-glow transition-smooth"
                    onClick={() => navigate(`/properties/${property.id}`)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
