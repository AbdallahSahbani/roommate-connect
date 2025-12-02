import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Bed, Bath, Square, Heart, DollarSign, ArrowUpDown, Home, CheckCircle2 } from "lucide-react";
import { CITY_OPTIONS, searchCities, formatCityDisplay, type CityOption } from "@/data/locations";
import { PropertyCapacity } from "@/components/PropertyCapacity";

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
  public_code: string | null;
  furnished: boolean | null;
  pets_allowed: boolean | null;
  smoking_allowed: boolean | null;
  max_occupants: number | null;
  property_type: string | null;
  landlord_id: string | null;
  total_slots: number | null;
  filled_slots: number | null;
}

interface LandlordProfile {
  id_verified: boolean | null;
  income_verified: boolean | null;
}

const Properties = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [landlordVerifications, setLandlordVerifications] = useState<Record<string, LandlordProfile>>({});
  const [loading, setLoading] = useState(true);
  const [savedListings, setSavedListings] = useState<Set<string>>(new Set());
  const [userProfile, setUserProfile] = useState<any>(null);
  
  // Location with autocomplete
  const [locationInput, setLocationInput] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<CityOption | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<CityOption[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  
  // Filters
  const [minRent, setMinRent] = useState(searchParams.get("minRent") || "");
  const [maxRent, setMaxRent] = useState(searchParams.get("maxRent") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [bathrooms, setBathrooms] = useState(searchParams.get("bathrooms") || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") || "");
  const [furnished, setFurnished] = useState(searchParams.get("furnished") || "");
  const [petsAllowed, setPetsAllowed] = useState(searchParams.get("petsAllowed") || "");
  const [smokingAllowed, setSmokingAllowed] = useState(searchParams.get("smokingAllowed") || "");
  const [sortBy, setSortBy] = useState<string>("newest");

  useEffect(() => {
    loadUserPreferences();
    loadSavedListings();
    
    // Click outside handler for suggestions
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadProperties();
  }, [selectedLocation, minRent, maxRent, bedrooms, bathrooms, propertyType, furnished, petsAllowed, smokingAllowed, sortBy]);

  useEffect(() => {
    if (locationInput.length >= 2) {
      const suggestions = searchCities(locationInput);
      setLocationSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  }, [locationInput]);

  const loadUserPreferences = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      loadProperties();
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profile) {
      setUserProfile(profile);
      
      // Pre-fill location from preferences
      if (!searchParams.get("city") && profile.preferred_cities && Array.isArray(profile.preferred_cities) && profile.preferred_cities.length > 0) {
        const prefCity = profile.preferred_cities[0];
        const prefState = profile.preferred_state || "";
        
        // Find matching city in our data
        const matchedCity = CITY_OPTIONS.find(
          c => c.city.toLowerCase() === prefCity.toLowerCase() && 
               c.stateCode === prefState
        );
        
        if (matchedCity) {
          setSelectedLocation(matchedCity);
          setLocationInput(formatCityDisplay(matchedCity));
        }
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

      // Location filters
      if (selectedLocation) {
        query = query
          .eq("city", selectedLocation.city)
          .eq("state", selectedLocation.stateCode)
          .eq("country", selectedLocation.country);
      }
      
      // Rent filters
      if (minRent) {
        query = query.gte("rent_amount", parseInt(minRent));
      }
      if (maxRent) {
        query = query.lte("rent_amount", parseInt(maxRent));
      }
      
      // Bedrooms
      if (bedrooms && bedrooms !== "any") {
        const bedroomCount = parseInt(bedrooms);
        if (bedroomCount === 0) {
          query = query.or("total_bedrooms.eq.0,total_bedrooms.is.null");
        } else {
          query = query.gte("total_bedrooms", bedroomCount);
        }
      }
      
      // Bathrooms
      if (bathrooms && bathrooms !== "any") {
        query = query.gte("total_bathrooms", parseFloat(bathrooms));
      }
      
      // Property type
      if (propertyType && propertyType !== "any") {
        query = query.eq("property_type", propertyType);
      }
      
      // Boolean filters
      if (furnished && furnished !== "any") {
        query = query.eq("furnished", furnished === "yes");
      }
      if (petsAllowed && petsAllowed !== "any") {
        query = query.eq("pets_allowed", petsAllowed === "yes");
      }
      if (smokingAllowed && smokingAllowed !== "any") {
        query = query.eq("smoking_allowed", smokingAllowed === "yes");
      }

      // Apply sorting - fetch all for best match, otherwise sort in DB
      if (sortBy === "best-match" && userProfile) {
        query = query.order("created_at", { ascending: false });
      } else {
        switch (sortBy) {
          case "price-asc":
            query = query.order("rent_amount", { ascending: true });
            break;
          case "price-desc":
            query = query.order("rent_amount", { ascending: false });
            break;
          case "newest":
          default:
            query = query.order("created_at", { ascending: false });
        }
      }

      const { data, error } = await query;

      if (error) throw error;
      
      let processedData = data || [];
      
      // Best match scoring (client-side)
      if (sortBy === "best-match" && userProfile && processedData.length > 0) {
        processedData = processedData.map(property => ({
          ...property,
          matchScore: calculateMatchScore(property, userProfile)
        })).sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0));
      }
      
      setProperties(processedData);
      
      // Load landlord verifications
      const landlordIds = [...new Set(processedData.map(p => p.landlord_id).filter(Boolean))];
      if (landlordIds.length > 0) {
        const { data: landlordData } = await supabase
          .from("profiles")
          .select("id, id_verified, income_verified")
          .in("id", landlordIds);
        
        if (landlordData) {
          const verificationsMap: Record<string, LandlordProfile> = {};
          landlordData.forEach(l => {
            verificationsMap[l.id] = {
              id_verified: l.id_verified,
              income_verified: l.income_verified
            };
          });
          setLandlordVerifications(verificationsMap);
        }
      }
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

  const calculateMatchScore = (property: Property, profile: any): number => {
    let score = 0;
    
    // Location match (30 points)
    if (profile.preferred_cities && Array.isArray(profile.preferred_cities)) {
      if (profile.preferred_cities.some((c: string) => c.toLowerCase() === property.city.toLowerCase())) {
        score += 20;
      }
    }
    if (profile.preferred_state && property.state === profile.preferred_state) {
      score += 10;
    }
    
    // Budget match (40 points)
    if (profile.budget_max) {
      const rentAmount = property.rent_total || property.rent_amount;
      const budgetDiff = Math.abs(rentAmount - profile.budget_max);
      const budgetRatio = budgetDiff / profile.budget_max;
      
      if (rentAmount <= profile.budget_max) {
        score += 40 - Math.min(40, budgetRatio * 100);
      } else if (rentAmount <= profile.budget_max * 1.1) {
        score += 20;
      }
    }
    
    // Availability timing (20 points)
    if (profile.move_in_date && property.available_from) {
      const targetDate = new Date(profile.move_in_date);
      const availableDate = new Date(property.available_from);
      const daysDiff = Math.abs((targetDate.getTime() - availableDate.getTime()) / (1000 * 3600 * 24));
      
      if (daysDiff <= 30) {
        score += 20;
      } else if (daysDiff <= 60) {
        score += 10;
      }
    }
    
    // Preferences match (10 points)
    if (profile.pets === "yes" && property.pets_allowed) score += 5;
    if (profile.smoking === "yes" && property.smoking_allowed) score += 5;
    
    return score;
  };

  const handleLocationSelect = (city: CityOption) => {
    setSelectedLocation(city);
    setLocationInput(formatCityDisplay(city));
    setShowSuggestions(false);
  };

  const clearLocation = () => {
    setSelectedLocation(null);
    setLocationInput("");
    setLocationSuggestions([]);
  };

  const isLandlordVerified = (landlordId: string | null): boolean => {
    if (!landlordId) return false;
    const verification = landlordVerifications[landlordId];
    return verification?.id_verified === true && verification?.income_verified === true;
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
    <div className="min-h-screen relative">
      <Navigation />
      <SubscriptionBanner />
      
      {/* Header with subtle gradient */}
      <div className="bg-texture py-12 px-4 border-b border-border">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-foreground animate-fade-up">Find a place to live bigger with less.</h1>
          <p className="text-muted-foreground animate-fade-in">Browse verified rentals in your preferred location and budget.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filter Bar with subtle texture */}
        <Card className="mb-8 shadow-hover bg-texture animate-scale-in">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location Autocomplete */}
              <div className="space-y-2 relative" ref={locationRef}>
                <label className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </label>
                <div className="relative">
                  <Input
                    placeholder="Search city (e.g. New York, NY)"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onFocus={() => locationInput.length >= 2 && setShowSuggestions(true)}
                    className="transition-fast hover:border-primary"
                  />
                  {selectedLocation && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1 h-7 w-7 p-0"
                      onClick={clearLocation}
                    >
                      ×
                    </Button>
                  )}
                </div>
                {showSuggestions && locationSuggestions.length > 0 && (
                  <Card className="absolute z-50 w-full mt-1 max-h-60 overflow-y-auto">
                    <CardContent className="p-2">
                      {locationSuggestions.map((city, idx) => (
                        <button
                          key={idx}
                          className="w-full text-left px-3 py-2 hover:bg-muted rounded-sm transition-fast text-sm"
                          onClick={() => handleLocationSelect(city)}
                        >
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span>{formatCityDisplay(city)}</span>
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Min Rent */}
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

              {/* Max Rent */}
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

              {/* Bedrooms */}
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
                    <SelectItem value="0">Studio (0)</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bathrooms */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Bath className="h-4 w-4" />
                  Bathrooms
                </label>
                <Select value={bathrooms} onValueChange={setBathrooms}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="1.5">1.5+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="2.5">2.5+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Property Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Type
                </label>
                <Select value={propertyType} onValueChange={setPropertyType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="apartment">Apartment</SelectItem>
                    <SelectItem value="house">House</SelectItem>
                    <SelectItem value="condo">Condo</SelectItem>
                    <SelectItem value="room">Room</SelectItem>
                    <SelectItem value="townhouse">Townhouse</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Furnished */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Furnished</label>
                <Select value={furnished} onValueChange={setFurnished}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pets Allowed */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Pets Allowed</label>
                <Select value={petsAllowed} onValueChange={setPetsAllowed}>
                  <SelectTrigger>
                    <SelectValue placeholder="Any" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Sort */}
            <div className="flex items-center gap-4 mt-6">
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
                    {userProfile && <SelectItem value="best-match">Best Match for You</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
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
                className="overflow-hidden hover:shadow-glow transition-smooth cursor-pointer group animate-fade-up bg-texture hover:scale-105"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={property.photos?.[0] || "https://placehold.co/400x300/e5e5e5/666666?text=No+Image"}
                    alt={property.title}
                    className="w-full h-48 object-cover group-hover:scale-110 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
                  <div className="text-2xl font-bold text-primary mb-4">
                    ${(property.rent_total || property.rent_amount).toLocaleString()} / month
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Bed className="h-4 w-4" />
                      {property.total_bedrooms === 0 ? "Studio" : `${property.total_bedrooms} bed`}
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
                  
                  {/* Capacity Display */}
                  {property.total_slots && property.total_slots > 0 && (
                    <div className="mb-3">
                      <PropertyCapacity 
                        totalSlots={property.total_slots} 
                        filledSlots={property.filled_slots || 0}
                        variant="badge"
                      />
                    </div>
                  )}
                  
                  {/* Property Features */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {property.furnished && (
                      <Badge variant="secondary" className="text-xs">
                        Furnished
                      </Badge>
                    )}
                    {property.pets_allowed && (
                      <Badge variant="secondary" className="text-xs">
                        Pets OK
                      </Badge>
                    )}
                    {property.smoking_allowed && (
                      <Badge variant="secondary" className="text-xs">
                        Smoking OK
                      </Badge>
                    )}
                    {property.landlord_id && isLandlordVerified(property.landlord_id) && (
                      <Badge className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Verified Landlord
                      </Badge>
                    )}
                  </div>
                  
                  {/* Listing ID */}
                  {property.public_code && (
                    <div className="text-xs text-muted-foreground mb-2">
                      ID: {property.public_code}
                    </div>
                  )}
                  
                  {property.amenities && property.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.slice(0, 3).map((amenity, idx) => (
                        <span key={idx} className="text-xs bg-muted px-2 py-1 rounded hover:bg-primary/20 transition-bounce hover:scale-110">
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
