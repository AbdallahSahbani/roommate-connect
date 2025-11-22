import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { SubscriptionBanner } from "@/components/SubscriptionBanner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, User, Shield, Heart } from "lucide-react";

interface Profile {
  id: string;
  full_name: string;
  bio: string;
  occupation: string;
  budget_min: number;
  budget_max: number;
  sleep_schedule: string;
  cleanliness_level: number;
  noise_tolerance: number;
  social_preference: string;
  smoking: string;
  pets: string;
}

const Browse = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentUser, setCurrentUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Load current user's profile
      const { data: userProfile, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (userError) throw userError;
      setCurrentUser(userProfile);

      // Load other active profiles
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("is_active", true)
        .neq("id", session.user.id)
        .not("bio", "is", null)
        .limit(20);

      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading profiles",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateCompatibility = (profile: Profile): number => {
    if (!currentUser) return 0;

    let score = 0;
    let factors = 0;

    // Budget compatibility (30 points)
    if (profile.budget_min && profile.budget_max && currentUser.budget_min && currentUser.budget_max) {
      const overlap = Math.min(profile.budget_max, currentUser.budget_max) - Math.max(profile.budget_min, currentUser.budget_min);
      const maxRange = Math.max(profile.budget_max - profile.budget_min, currentUser.budget_max - currentUser.budget_min);
      if (overlap > 0) {
        score += (overlap / maxRange) * 30;
      }
      factors++;
    }

    // Sleep schedule (20 points)
    if (profile.sleep_schedule === currentUser.sleep_schedule || 
        profile.sleep_schedule === "flexible" || 
        currentUser.sleep_schedule === "flexible") {
      score += 20;
    }
    factors++;

    // Cleanliness (15 points)
    if (profile.cleanliness_level && currentUser.cleanliness_level) {
      const diff = Math.abs(profile.cleanliness_level - currentUser.cleanliness_level);
      score += Math.max(0, 15 - (diff * 3));
      factors++;
    }

    // Noise tolerance (15 points)
    if (profile.noise_tolerance && currentUser.noise_tolerance) {
      const diff = Math.abs(profile.noise_tolerance - currentUser.noise_tolerance);
      score += Math.max(0, 15 - (diff * 3));
      factors++;
    }

    // Social preference (10 points)
    if (profile.social_preference === currentUser.social_preference) {
      score += 10;
    } else if (profile.social_preference === "moderately_social" || currentUser.social_preference === "moderately_social") {
      score += 5;
    }
    factors++;

    // Smoking (5 points)
    if (profile.smoking === currentUser.smoking) {
      score += 5;
    }
    factors++;

    // Pets (5 points)
    if (profile.pets === currentUser.pets) {
      score += 5;
    }
    factors++;

    return Math.round(score);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading profiles...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SubscriptionBanner />
        
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Browse Roommates</h1>
          <p className="text-muted-foreground">Find compatible matches based on your lifestyle</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((profile) => {
            const compatibilityScore = calculateCompatibility(profile);
            return (
              <Card key={profile.id} className="shadow-card hover:shadow-hover transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{profile.full_name}</CardTitle>
                      <CardDescription>{profile.occupation}</CardDescription>
                    </div>
                    <Badge 
                      variant={compatibilityScore >= 70 ? "default" : compatibilityScore >= 50 ? "secondary" : "outline"}
                      className="text-lg px-3 py-1"
                    >
                      {compatibilityScore}%
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {profile.bio || "No bio available"}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Budget:</span>
                      <span className="font-medium">${profile.budget_min}-${profile.budget_max}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sleep:</span>
                      <span className="font-medium capitalize">
                        {profile.sleep_schedule?.replace("_", " ")}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Cleanliness:</span>
                      <span className="font-medium">{profile.cleanliness_level}/5</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Heart className="h-4 w-4 mr-2" />
                      Like
                    </Button>
                    <Button size="sm" className="flex-1">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {profiles.length === 0 && (
          <Card className="shadow-card">
            <CardContent className="py-12 text-center">
              <p className="text-lg text-muted-foreground mb-4">
                No profiles found. Check back soon!
              </p>
              <Link to="/dashboard">
                <Button>Return to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Browse;