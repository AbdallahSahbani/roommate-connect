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
import { MapPin, Bed, Bath, Square, Heart, DollarSign } from "lucide-react";

interface Property {
  id: string;
  title: string;
  street_address: string | null;
  city: string;
  state: string | null;
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
  const [minRent, setMinRent] = useState(searchParams.get("minRent") || "");
  const [maxRent, setMaxRent] = useState(searchParams.get("maxRent") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");

  useEffect(() => {
    loadProperties();
    loadSavedListings();
  }, []);

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
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (city) {
        query = query.ilike("city", `%${city}%`);
      }
      if (state && state !== "any") {
        query = query.eq("state", state);
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
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Find a place to live bigger with less.</h1>
          <p className="text-muted-foreground">Browse verified rentals in your preferred location and budget.</p>
        </div>

        {/* Filter Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  City
                </label>
                <Input
                  placeholder="New Haven"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="CT">Connecticut</SelectItem>
                    <SelectItem value="NY">New York</SelectItem>
                    <SelectItem value="MA">Massachusetts</SelectItem>
                    <SelectItem value="RI">Rhode Island</SelectItem>
                    <SelectItem value="NJ">New Jersey</SelectItem>
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
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Rent</label>
                <Input
                  type="number"
                  placeholder="3500"
                  value={maxRent}
                  onChange={(e) => setMaxRent(e.target.value)}
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
            <Button className="w-full mt-4" onClick={handleSearch}>
              Search
            </Button>
          </CardContent>
        </Card>

        {/* Results Grid */}
        {properties.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground mb-4">No properties found matching your criteria.</p>
            <p className="text-muted-foreground">Try adjusting your filters or check back later for new listings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-hover transition-shadow">
                <div className="relative">
                  <img
                    src={property.photos?.[0] || "https://placehold.co/400x300/e5e5e5/666666?text=No+Image"}
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                    onClick={() => toggleSave(property.id)}
                  >
                    <Heart className={`h-5 w-5 ${savedListings.has(property.id) ? "fill-primary text-primary" : ""}`} />
                  </Button>
                </div>
                <CardHeader>
                  <h3 className="text-xl font-semibold line-clamp-1">{property.title}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {property.city}{property.state ? `, ${property.state}` : ""}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary mb-4">
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
                        <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
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
