import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Settings, Eye, PauseCircle } from "lucide-react";

// Property Components
import { PropertyHeroCarousel } from "@/components/property/PropertyHeroCarousel";
import { PropertyHeader } from "@/components/property/PropertyHeader";
import { PropertyActionButtons } from "@/components/property/PropertyActionButtons";
import { PropertyGroupStatus } from "@/components/property/PropertyGroupStatus";
import { PropertyInfoSidebar } from "@/components/property/PropertyInfoSidebar";
import { PropertyDescription } from "@/components/property/PropertyDescription";
import { PropertyApplicationModal } from "@/components/property/PropertyApplicationModal";

interface Property {
  id: string;
  title: string;
  description: string | null;
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
  external_listing_url: string | null;
  landlord_id: string | null;
  minimum_income_multiplier: number | null;
  public_code: string | null;
  max_occupants: number | null;
  min_household_income: number | null;
  required_id_verified: boolean | null;
  required_income_verified: boolean | null;
  required_background_check: boolean | null;
  total_slots: number | null;
  filled_slots: number | null;
  property_type: string | null;
  views_count: number | null;
}

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [isLandlordVerified, setIsLandlordVerified] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isUserVerified, setIsUserVerified] = useState(false);

  useEffect(() => {
    if (id) {
      loadAllData();
    }
  }, [id]);

  const loadAllData = async () => {
    setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();
    
    await Promise.all([
      loadProperty(),
      session ? checkIfSaved(session.user.id) : Promise.resolve(),
      session ? checkIfApplied(session.user.id) : Promise.resolve(),
      session ? loadUserGroups(session.user.id) : Promise.resolve(),
      session ? loadUserProfile(session.user.id) : Promise.resolve(),
    ]);

    if (session) {
      setCurrentUserId(session.user.id);
    }
    
    setLoading(false);
  };

  const loadUserProfile = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (data) {
      setUserProfile(data);
      setIsUserVerified(data.id_verified && data.income_verified);
    }
  };

  const loadUserGroups = async (userId: string) => {
    const { data } = await supabase
      .from("group_members")
      .select("group_id, groups(*)")
      .eq("user_id", userId)
      .eq("status", "active");

    if (data) {
      setUserGroups(data.map((gm) => gm.groups).filter(Boolean));
    }
  };

  const checkIfApplied = async (userId: string) => {
    if (!id) return;

    const { data } = await supabase
      .from("applications")
      .select("id")
      .eq("property_id", id)
      .eq("applicant_id", userId)
      .single();

    setHasApplied(!!data);
  };

  const loadProperty = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setProperty(data);

      // Check landlord verification
      if (data.landlord_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("landlord_verified")
          .eq("id", data.landlord_id)
          .single();

        setIsLandlordVerified(profile?.landlord_verified || false);
      }

      // Increment view count
      await supabase
        .from("properties")
        .update({ views_count: (data.views_count || 0) + 1 })
        .eq("id", id);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const checkIfSaved = async (userId: string) => {
    const { data } = await supabase
      .from("saved_listings")
      .select("id")
      .eq("user_id", userId)
      .eq("property_id", id)
      .single();

    setIsSaved(!!data);
  };

  const toggleSave = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    try {
      if (isSaved) {
        await supabase
          .from("saved_listings")
          .delete()
          .eq("user_id", session.user.id)
          .eq("property_id", id);

        setIsSaved(false);
        toast({
          title: "Removed from saved",
          description: "Property removed from your saved listings",
        });
      } else {
        await supabase
          .from("saved_listings")
          .insert({ user_id: session.user.id, property_id: id });

        setIsSaved(true);
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

  const isOwner = currentUserId && property?.landlord_id === currentUserId;
  const isFull = property?.total_slots != null && (property?.filled_slots || 0) >= property.total_slots;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Skeleton className="h-[500px] w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))}
              </div>
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Property not found</h1>
          <Link to="/properties">
            <Button>Back to Properties</Button>
          </Link>
        </div>
      </div>
    );
  }

  const rent = property.rent_total || property.rent_amount;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Back Button + Landlord Tools */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            className="gap-2 hover:bg-muted"
            onClick={() => navigate("/properties")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Properties
          </Button>

          {isOwner && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
                <Eye className="h-4 w-4" />
                {property.views_count || 0} views
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/landlord/listings/${property.id}/edit`)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Listing
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/landlord/applications")}
              >
                View Applications
              </Button>
            </div>
          )}
        </div>

        {/* Hero Carousel */}
        <PropertyHeroCarousel
          photos={property.photos || []}
          title={property.title}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header with Title, Location, Stats */}
            <PropertyHeader
              title={property.title}
              city={property.city}
              state={property.state}
              streetAddress={property.street_address}
              postalCode={property.postal_code}
              publicCode={property.public_code}
              rentAmount={rent}
              bedrooms={property.total_bedrooms}
              bathrooms={property.total_bathrooms}
              squareFeet={property.square_feet}
              maxOccupants={property.max_occupants}
              availableFrom={property.available_from}
              isVerified={!!property.landlord_id || isLandlordVerified}
            />

            {/* Action Buttons */}
            {!isOwner && (
              <PropertyActionButtons
                propertyId={property.id}
                isSaved={isSaved}
                hasApplied={hasApplied}
                isFull={isFull}
                isVerified={isUserVerified}
                onSaveToggle={toggleSave}
                onApply={() => setShowApplicationModal(true)}
                landlordId={property.landlord_id}
              />
            )}

            {/* Group Status */}
            {property.total_slots && property.total_slots > 0 && (
              <PropertyGroupStatus
                propertyId={property.id}
                totalSlots={property.total_slots}
                filledSlots={property.filled_slots || 0}
              />
            )}

            {/* Description, Amenities, Location */}
            <PropertyDescription
              description={property.description}
              amenities={property.amenities}
              city={property.city}
              state={property.state}
              externalListingUrl={property.external_listing_url}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <PropertyInfoSidebar
                rentAmount={rent}
                minimumIncomeMultiplier={property.minimum_income_multiplier}
                availableFrom={property.available_from}
                totalSlots={property.total_slots}
                filledSlots={property.filled_slots}
                maxOccupants={property.max_occupants}
                requiredIdVerified={property.required_id_verified}
                requiredIncomeVerified={property.required_income_verified}
                requiredBackgroundCheck={property.required_background_check}
                propertyType={property.property_type}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      <PropertyApplicationModal
        open={showApplicationModal}
        onOpenChange={setShowApplicationModal}
        propertyId={property.id}
        totalSlots={property.total_slots || 0}
        filledSlots={property.filled_slots || 0}
        userProfile={userProfile}
        userGroups={userGroups}
      />
    </div>
  );
};

export default PropertyDetail;
