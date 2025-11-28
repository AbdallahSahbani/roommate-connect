import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { useToast } from "@/hooks/use-toast";
import { MapPin, DollarSign, Calendar, Eye, Edit } from "lucide-react";

export default function LandlordListings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLandlord, loading: roleLoading } = useCurrentUserRole();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isLandlord) {
      navigate("/");
      return;
    }

    async function loadProperties() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("landlord_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setProperties(data || []);
      }
      setLoading(false);
    }

    if (!roleLoading && isLandlord) {
      loadProperties();
    }
  }, [isLandlord, roleLoading, navigate, toast]);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("properties")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Listing updated" });
      setProperties(properties.map(p => 
        p.id === id ? { ...p, is_active: !currentStatus } : p
      ));
    }
  };

  if (roleLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">My Listings</h1>
            <Button onClick={() => navigate("/landlord/listings/new")}>
              Create Listing
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {properties.map((property) => (
              <Card key={property.id} className="p-6 bg-texture hover:scale-[1.02] transition-all duration-300">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-foreground">{property.title}</h3>
                      <Badge variant={property.is_active ? "default" : "secondary"}>
                        {property.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{property.city}, {property.state}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">${property.rent_total?.toLocaleString()}/mo</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">{new Date(property.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/property/${property.id}`)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/landlord/listings/${property.id}/edit`)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={property.is_active ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleActive(property.id, property.is_active)}
                    >
                      {property.is_active ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {properties.length === 0 && (
              <Card className="p-12 bg-texture text-center">
                <p className="text-muted-foreground mb-4">No listings yet</p>
                <Button onClick={() => navigate("/landlord/listings/new")}>
                  Create Your First Listing
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
