import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Home, MessageSquare, Shield, CheckCircle, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [verifications, setVerifications] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      setProfile(data);

      // Fetch verifications
      const { data: verificationData } = await supabase
        .from("verifications")
        .select("*")
        .eq("user_id", session.user.id);

      if (verificationData) {
        const verificationMap = verificationData.reduce((acc, v) => {
          acc[v.verification_type] = v.status === "verified";
          return acc;
        }, {} as any);
        setVerifications(verificationMap);
      }

      // Check if profile is incomplete
      if (!data.bio || !data.budget_min) {
        navigate("/profile-setup");
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const profileComplete = profile?.bio && profile?.budget_min;
  const allVerified = verifications.identity && verifications.face && verifications.income;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubscriptionBanner />
        
        <div className="mb-8 mt-6">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {profile?.full_name}!
          </h2>
          <p className="text-muted-foreground">
            Find your perfect roommate and rental property today.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
              {profileComplete ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <AlertCircle className="h-4 w-4 text-warning" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profileComplete ? "Complete" : "Incomplete"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {profileComplete ? "All set!" : "Finish your profile to start matching"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Verification</CardTitle>
              {allVerified ? (
                <Shield className="h-4 w-4 text-success" />
              ) : (
                <AlertCircle className="h-4 w-4 text-warning" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allVerified ? "Verified" : "Pending"}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {allVerified ? "Fully verified!" : "Complete verification to unlock features"}
              </p>
              {!allVerified && (
                <Button size="sm" className="mt-2" onClick={() => navigate("/verification")}>
                  Complete Verification
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground mt-1">No new messages</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DashboardCard
            icon={<Users className="h-8 w-8 text-primary" />}
            title="Browse Roommates"
            description="Find compatible roommates based on your lifestyle and preferences"
            link="/browse"
            buttonText="Start Browsing"
          />
          
          <DashboardCard
            icon={<Home className="h-8 w-8 text-primary" />}
            title="View Properties"
            description="Explore verified rental properties in your preferred areas"
            link="/properties"
            buttonText="View Listings"
          />
          
          <DashboardCard
            icon={<MessageSquare className="h-8 w-8 text-primary" />}
            title="Messages"
            description="Chat with potential roommates and landlords"
            link="/messages"
            buttonText="Open Messages"
          />
        </div>

        {/* Profile Completion Status */}
        {profile && (
          <Card className="mt-8 shadow-card">
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>Keep your profile up to date to get better matches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Budget Range:</span>
                  <span className="text-sm font-medium">
                    ${profile.budget_min} - ${profile.budget_max}/month
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Occupation:</span>
                  <span className="text-sm font-medium">{profile.occupation || "Not set"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Sleep Schedule:</span>
                  <span className="text-sm font-medium capitalize">
                    {profile.sleep_schedule?.replace("_", " ") || "Not set"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">ID Verified:</span>
                  <span className={`text-sm font-medium ${profile.id_verified ? "text-success" : "text-muted-foreground"}`}>
                    {profile.id_verified ? "Yes" : "Pending"}
                  </span>
                </div>
              </div>
              <Link to="/profile-setup">
                <Button variant="outline" className="w-full mt-4">
                  Update Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

const DashboardCard = ({ 
  icon, 
  title, 
  description, 
  link, 
  buttonText 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  link: string;
  buttonText: string;
}) => (
  <Card className="shadow-card hover:shadow-hover transition-shadow">
    <CardHeader>
      <div className="mb-2">{icon}</div>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Link to={link}>
        <Button className="w-full">{buttonText}</Button>
      </Link>
    </CardContent>
  </Card>
);

export default Dashboard;