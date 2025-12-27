import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MapPin, DollarSign, Eye, ToggleLeft, ToggleRight } from "lucide-react";

export default function AdminProperties() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin, loading: roleLoading } = useCurrentUserRole();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isAdmin) {
      navigate("/");
      return;
    }

    async function loadProperties() {
      const { data, error } = await supabase
        .from("properties")
        .select("*, profiles!landlord_id(full_name)")
        .order("created_at", { ascending: false });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        setProperties(data || []);
      }
      setLoading(false);
    }

    if (!roleLoading && isAdmin) {
      loadProperties();
    }
  }, [isAdmin, roleLoading, navigate, toast]);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("properties")
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Property status updated" });
      setProperties(properties.map(p => 
        p.id === id ? { ...p, is_active: !currentStatus } : p
      ));
    }
  };

  if (roleLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-foreground">All Properties</h1>

        <div className="grid gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="p-6 bg-texture">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{property.title}</h3>
                    <Badge variant={property.is_active ? "default" : "secondary"}>
                      {property.is_active ? "Active" : "Inactive"}
                    </Badge>
                    {property.public_code && (
                      <Badge variant="outline">{property.public_code}</Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {property.city}, {property.state}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      ${property.rent_total?.toLocaleString()}/mo
                    </div>
                    <div>
                      Landlord: {property.profiles?.full_name || "Unknown"}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(`/properties/${property.id}`, "_blank")}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={property.is_active ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleActive(property.id, property.is_active)}
                  >
                    {property.is_active ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
