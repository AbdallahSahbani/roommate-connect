import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { Building2, FileText, Plus } from "lucide-react";

export default function LandlordDashboard() {
  const navigate = useNavigate();
  const { isLandlord, loading: roleLoading } = useCurrentUserRole();
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    applications: 0,
  });

  useEffect(() => {
    if (!roleLoading && !isLandlord) {
      navigate("/");
      return;
    }

    async function loadStats() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: properties } = await supabase
        .from("properties")
        .select("id, is_active")
        .eq("landlord_id", user.id);

      const { count: applicationsCount } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .in("property_id", properties?.map(p => p.id) || []);

      setStats({
        totalListings: properties?.length || 0,
        activeListings: properties?.filter(p => p.is_active).length || 0,
        applications: applicationsCount || 0,
      });
    }

    if (!roleLoading && isLandlord) {
      loadStats();
    }
  }, [isLandlord, roleLoading, navigate]);

  if (roleLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Landlord Dashboard</h1>
            <Button onClick={() => navigate("/landlord/listings/new")}>
              <Plus className="h-4 w-4 mr-2" />
              Create Listing
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-texture hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Listings</p>
                  <p className="text-3xl font-bold text-foreground">{stats.totalListings}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-texture hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Listings</p>
                  <p className="text-3xl font-bold text-foreground">{stats.activeListings}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-texture hover:scale-105 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-3xl font-bold text-foreground">{stats.applications}</p>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-texture">
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" onClick={() => navigate("/landlord/assistant")} className="justify-start">
                🤖 AI Listing Assistant
              </Button>
              <Button variant="outline" onClick={() => navigate("/landlord/listings/new")} className="justify-start">
                Create New Listing
              </Button>
              <Button variant="outline" onClick={() => navigate("/landlord/listings")} className="justify-start">
                View All Listings
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
