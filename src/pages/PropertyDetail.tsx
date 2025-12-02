import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  MapPin, Bed, Bath, Square, Heart, Calendar, 
  DollarSign, ExternalLink, CheckCircle, ArrowLeft, Users 
} from "lucide-react";
import { PropertyCapacity } from "@/components/PropertyCapacity";
import { ApplicationForm } from "@/components/ApplicationForm";

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
}

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false);
  const [message, setMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isLandlordVerified, setIsLandlordVerified] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userGroups, setUserGroups] = useState<any[]>([]);
  const [hasApplied, setHasApplied] = useState(false);
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    if (id) {
      loadProperty();
      checkIfSaved();
      checkIfApplied();
      loadUserGroups();
      loadUserProfile();
    }
  }, [id]);

  const loadUserProfile = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    setUserProfile(data);
  };

  const loadUserGroups = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("group_members")
      .select("group_id, groups(*)")
      .eq("user_id", session.user.id)
      .eq("status", "active");

    if (data) {
      setUserGroups(data.map(gm => gm.groups).filter(Boolean));
    }
  };

  const checkIfApplied = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !id) return;

    const { data } = await supabase
      .from("applications")
      .select("id")
      .eq("property_id", id)
      .eq("applicant_id", session.user.id)
      .single();
    
    setHasApplied(!!data);
  };

  const loadProperty = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const checkIfSaved = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("saved_listings")
      .select("id")
      .eq("user_id", session.user.id)
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

  const sendInquiry = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setSendingMessage(true);
    try {
      await supabase
        .from("property_inquiries")
        .insert({
          property_id: id,
          user_id: session.user.id,
          message: message,
        });

      toast({
        title: "Message sent",
        description: "Your inquiry has been sent to the landlord",
      });
      setMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSendingMessage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full rounded-lg mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
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
  const estimatedIncome = rent * (property.minimum_income_multiplier || 3);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/properties")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Properties
        </Button>

        {/* Photo Gallery */}
        <div className="mb-8">
          <div className="relative rounded-xl overflow-hidden">
            <img
              src={property.photos?.[0] || "https://placehold.co/1200x600/e5e5e5/666666?text=No+Image"}
              alt={property.title}
              className="w-full h-96 object-cover"
            />
          </div>
          {property.photos && property.photos.length > 1 && (
            <div className="grid grid-cols-4 gap-4 mt-4">
              {property.photos.slice(1, 5).map((photo, idx) => (
                <img
                  key={idx}
                  src={photo}
                  alt={`${property.title} ${idx + 2}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title and Address */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="text-3xl font-bold">{property.title}</h1>
                  {property.public_code && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Listing ID: {property.public_code}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSave}
                  className="flex-shrink-0"
                >
                  <Heart className={`h-6 w-6 ${isSaved ? "fill-primary text-primary" : ""}`} />
                </Button>
              </div>
              <p className="text-lg text-muted-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {property.street_address && `${property.street_address}, `}
                {property.city}{property.state ? `, ${property.state}` : ""}
                {property.postal_code && ` ${property.postal_code}`}
              </p>
            </div>

            {/* Key Features */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center text-center">
                    <DollarSign className="h-8 w-8 text-primary mb-2" />
                    <div className="text-2xl font-bold">${rent.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Bed className="h-8 w-8 text-primary mb-2" />
                    <div className="text-2xl font-bold">{property.total_bedrooms}</div>
                    <div className="text-sm text-muted-foreground">bedrooms</div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <Bath className="h-8 w-8 text-primary mb-2" />
                    <div className="text-2xl font-bold">{property.total_bathrooms || 1}</div>
                    <div className="text-sm text-muted-foreground">bathrooms</div>
                  </div>
                  {property.square_feet && (
                    <div className="flex flex-col items-center text-center">
                      <Square className="h-8 w-8 text-primary mb-2" />
                      <div className="text-2xl font-bold">{property.square_feet.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">sqft</div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {property.description && (
              <Card>
                <CardHeader>
                  <CardTitle>About This Property</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Features & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {property.amenities.map((amenity, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Located in {property.city}{property.state && `, ${property.state}`}
                </p>
                {property.external_listing_url && (
                  <Button variant="link" className="px-0 mt-2" asChild>
                    <a href={property.external_listing_url} target="_blank" rel="noopener noreferrer">
                      View original listing <ExternalLink className="h-4 w-4 ml-1" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Landlord</CardTitle>
                {isLandlordVerified && (
                  <div className="flex items-center gap-2 text-sm text-success">
                    <CheckCircle className="h-4 w-4" />
                    Verified Landlord
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-3xl font-bold text-primary">${rent.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                 </div>
                 
                 {property.available_from && (
                   <div className="flex items-center gap-2 text-sm">
                     <Calendar className="h-4 w-4" />
                     Available from {new Date(property.available_from).toLocaleDateString()}
                   </div>
                 )}

                 {/* Capacity Display */}
                 {property.total_slots && property.total_slots > 0 && (
                   <div className="pt-4 border-t">
                     <h4 className="text-sm font-medium mb-3">Live Capacity</h4>
                     <PropertyCapacity 
                       totalSlots={property.total_slots} 
                       filledSlots={property.filled_slots || 0}
                       variant="full"
                     />
                   </div>
                 )}

                 <div className="pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-1">Estimated min. income:</div>
                  <div className="text-xl font-semibold">${estimatedIncome.toLocaleString()}/mo</div>
                </div>

                 <div className="space-y-3">
                   {!showApplicationForm ? (
                     <>
                        <Button 
                          className="w-full" 
                          style={{ backgroundColor: '#5B1020' }}
                          onClick={async () => {
                            const { data: { session } } = await supabase.auth.getSession();
                            if (!session) {
                              navigate("/auth");
                              return;
                            }
                            setShowApplicationForm(true);
                          }}
                         disabled={hasApplied || (property.total_slots != null && (property.filled_slots || 0) >= property.total_slots)}
                       >
                         {hasApplied ? "Already Applied" : (property.total_slots != null && (property.filled_slots || 0) >= property.total_slots) ? "Waitlist Only" : "Apply for this Property"}
                       </Button>
                       
                       <Textarea
                         placeholder="Hi, I'm interested in this property. Is it still available?"
                         value={message}
                         onChange={(e) => setMessage(e.target.value)}
                         rows={4}
                       />
                       <Button 
                         className="w-full" 
                         variant="outline"
                         onClick={sendInquiry}
                         disabled={sendingMessage}
                       >
                         {sendingMessage ? "Sending..." : "Send Message"}
                       </Button>
                     </>
                   ) : (
                     <div className="space-y-4">
                       <h3 className="font-semibold text-lg">Application</h3>
                       <ApplicationForm
                         propertyId={property.id}
                         totalSlots={property.total_slots || 0}
                         filledSlots={property.filled_slots || 0}
                         userProfile={userProfile}
                         userGroups={userGroups}
                       />
                       <Button
                         variant="ghost"
                         className="w-full"
                         onClick={() => setShowApplicationForm(false)}
                       >
                         Cancel
                       </Button>
                     </div>
                   )}
                 </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={toggleSave}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isSaved ? "fill-primary text-primary" : ""}`} />
                  {isSaved ? "Saved" : "Save Property"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
