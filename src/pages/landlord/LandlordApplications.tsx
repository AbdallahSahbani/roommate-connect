import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Clock, Home } from "lucide-react";

interface Application {
  id: string;
  status: string;
  created_at: string;
  meets_verification: boolean;
  meets_income: boolean;
  meets_background: boolean;
  meets_capacity: boolean;
  property: {
    id: string;
    title: string;
    city: string;
  };
  applicant: {
    id: string;
    full_name: string | null;
    email: string;
    date_of_birth: string | null;
  };
}

export default function LandlordApplications() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLandlord, loading: roleLoading } = useCurrentUserRole();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!roleLoading && !isLandlord) {
      navigate("/");
      return;
    }
    if (isLandlord) {
      loadApplications();
    }
  }, [isLandlord, roleLoading, navigate]);

  const loadApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("applications")
        .select(`
          id,
          status,
          created_at,
          meets_verification,
          meets_income,
          meets_background,
          meets_capacity,
          property:properties!inner(id, title, city),
          applicant:profiles!applications_applicant_id_fkey(id, full_name, email, date_of_birth)
        `)
        .eq("properties.landlord_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data as any || []);
    } catch (error) {
      console.error("Error loading applications:", error);
      toast({
        title: "Error",
        description: "Failed to load applications",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("applications")
        .update({ status })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Application ${status}`,
      });

      loadApplications();
    } catch (error) {
      console.error("Error updating application:", error);
      toast({
        title: "Error",
        description: "Failed to update application",
        variant: "destructive",
      });
    }
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  const groupedApplications = applications.reduce((acc, app) => {
    const propertyId = app.property.id;
    if (!acc[propertyId]) {
      acc[propertyId] = {
        property: app.property,
        applications: [],
      };
    }
    acc[propertyId].applications.push(app);
    return acc;
  }, {} as Record<string, { property: any; applications: Application[] }>);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Home className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Property Applications</h1>
        </div>

        {Object.keys(groupedApplications).length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No applications yet</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.values(groupedApplications).map(({ property, applications: apps }) => (
              <Card key={property.id} className="p-6">
                <h2 className="text-xl font-semibold mb-4">
                  {property.title} - {property.city}
                </h2>
                <div className="space-y-4">
                  {apps.map((app) => {
                    const age = calculateAge(app.applicant.date_of_birth);
                    const meetsAllCriteria =
                      app.meets_verification &&
                      app.meets_income &&
                      app.meets_background &&
                      app.meets_capacity;

                    return (
                      <div
                        key={app.id}
                        className="border rounded-lg p-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-medium">
                              {app.applicant.full_name || "Anonymous"}
                            </p>
                            {age && (
                              <span className="text-sm text-muted-foreground">
                                ({age} years old)
                              </span>
                            )}
                            <Badge
                              variant={
                                app.status === "approved"
                                  ? "default"
                                  : app.status === "pending"
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {app.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {app.applicant.email}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            {meetsAllCriteria ? (
                              <Badge variant="outline" className="gap-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Meets all criteria
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1">
                                <XCircle className="h-3 w-3" />
                                Missing requirements
                              </Badge>
                            )}
                            {!app.meets_verification && (
                              <Badge variant="outline">Verification needed</Badge>
                            )}
                            {!app.meets_income && (
                              <Badge variant="outline">Income insufficient</Badge>
                            )}
                            {!app.meets_capacity && (
                              <Badge variant="outline">No capacity</Badge>
                            )}
                          </div>
                        </div>
                        {app.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              onClick={() => updateApplicationStatus(app.id, "approved")}
                              size="sm"
                              className="gap-1"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => updateApplicationStatus(app.id, "rejected")}
                              variant="destructive"
                              size="sm"
                              className="gap-1"
                            >
                              <XCircle className="h-4 w-4" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
