import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Eye, Pause, Play, Archive } from "lucide-react";

interface Property {
  id: string;
  title: string;
  city: string;
  rent_amount: number;
  total_bedrooms: number;
  status: string;
  is_active: boolean;
  views_count: number;
  created_at: string;
}

const LandlordListings = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [inquiriesCount, setInquiriesCount] = useState<Record<string, number>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkLandlordRole();
    loadProperties();
  }, []);

  const checkLandlordRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "landlord");

    if (!roles || roles.length === 0) {
      toast({
        title: "Access denied",
        description: "You need landlord access to view this page",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  };

  const loadProperties = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("landlord_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);

      // Load inquiry counts for each property
      if (data && data.length > 0) {
        const counts: Record<string, number> = {};
        for (const property of data) {
          const { count } = await supabase
            .from("property_inquiries")
            .select("*", { count: "exact", head: true })
            .eq("property_id", property.id);
          counts[property.id] = count || 0;
        }
        setInquiriesCount(counts);
      }
    } catch (error: any) {
      toast({
        title: "Error loading properties",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (propertyId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ is_active: !currentState })
        .eq("id", propertyId);

      if (error) throw error;

      toast({
        title: currentState ? "Listing paused" : "Listing activated",
        description: `Property has been ${currentState ? "paused" : "activated"}`,
      });
      loadProperties();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const archiveProperty = async (propertyId: string) => {
    try {
      const { error } = await supabase
        .from("properties")
        .update({ status: "archived", is_active: false })
        .eq("id", propertyId);

      if (error) throw error;

      toast({
        title: "Listing archived",
        description: "Property has been archived",
      });
      loadProperties();
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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading your listings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
            <p className="text-muted-foreground mt-2">Manage your rental properties</p>
          </div>
          <Link to="/landlord/listings/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Button>
          </Link>
        </div>

        {properties.length === 0 ? (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                No properties listed yet. Create your first listing to get started!
              </p>
              <Link to="/landlord/listings/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Listing
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {properties.map((property) => (
              <Card key={property.id} className="shadow-card">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{property.title}</CardTitle>
                      <p className="text-muted-foreground mt-1">
                        {property.city} • ${property.rent_amount}/mo • {property.total_bedrooms} bed
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={property.is_active ? "default" : "secondary"}>
                        {property.status}
                      </Badge>
                      {!property.is_active && (
                        <Badge variant="outline">Paused</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        <span>{property.views_count} views</span>
                      </div>
                      <div>
                        <span>{inquiriesCount[property.id] || 0} inquiries</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/landlord/listings/${property.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleActive(property.id, property.is_active)}
                      >
                        {property.is_active ? (
                          <>
                            <Pause className="h-4 w-4 mr-2" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Activate
                          </>
                        )}
                      </Button>
                      {property.status !== "archived" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => archiveProperty(property.id)}
                        >
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default LandlordListings;