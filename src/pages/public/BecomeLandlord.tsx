import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, CheckCircle, Sparkles } from "lucide-react";

export default function BecomeLandlord() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasLandlordRole, setHasLandlordRole] = useState(false);

  useEffect(() => {
    checkAuthAndRole();
  }, []);

  const checkAuthAndRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    setIsAuthenticated(true);

    // Check if user already has landlord role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    const hasRole = roles?.some(r => r.role === "landlord");
    setHasLandlordRole(hasRole);

    if (hasRole) {
      // Already a landlord, redirect to dashboard
      navigate("/landlord/dashboard");
    }

    setLoading(false);
  };

  const handleBecomeLandlord = async () => {
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Please sign in first");
        navigate("/auth?redirect=/become-landlord");
        return;
      }

      // Add landlord role
      const { error } = await supabase
        .from("user_roles")
        .insert([{ user_id: session.user.id, role: "landlord" }]);

      if (error) {
        if (error.code === "23505") {
          // Role already exists
          toast.success("You're already a landlord!");
        } else {
          throw error;
        }
      } else {
        toast.success("Welcome! You're now a landlord");
      }

      navigate("/landlord/dashboard");
    } catch (error: any) {
      console.error("Error becoming landlord:", error);
      toast.error("Failed to set up landlord account");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Building2 className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Become a Landlord</h1>
            <p className="text-lg text-muted-foreground mb-8">
              List your properties and connect with verified renters. Please sign in to continue.
            </p>
            <Button size="lg" onClick={() => navigate("/auth?redirect=/become-landlord")}>
              Sign In to Continue
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Building2 className="h-16 w-16 mx-auto mb-6 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Become a Landlord</h1>
            <p className="text-lg text-muted-foreground">
              Start listing your properties and connect with verified renters
            </p>
          </div>

          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-6">What you'll get:</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">🤖 AI Listing Assistant</h3>
                  <p className="text-muted-foreground">Let our AI help you create professional listings in minutes</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Verified Renters</h3>
                  <p className="text-muted-foreground">All renters are ID and income verified</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Easy Application Management</h3>
                  <p className="text-muted-foreground">Review and manage applications in one place</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold">Group Applications</h3>
                  <p className="text-muted-foreground">Rent to pre-formed groups of compatible roommates</p>
                </div>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <Button 
              size="lg" 
              onClick={handleBecomeLandlord}
              disabled={loading}
              className="text-lg px-8 py-6"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              {loading ? "Setting up..." : "Become a Landlord"}
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              By continuing, you agree to our terms of service
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
