import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useToast } from "@/hooks/use-toast";
import { Heart, X, MapPin, Briefcase, Home } from "lucide-react";
import { scoreUsers } from "@/lib/matching";

export default function RoommateSwipe() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isActiveSubscriber, loading: subLoading } = useSubscriptionStatus();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuthAndSubscription() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      if (!subLoading && !isActiveSubscriber) {
        navigate("/subscription");
        return;
      }
    }

    checkAuthAndSubscription();
  }, [isActiveSubscriber, subLoading, navigate]);

  useEffect(() => {
    async function loadCandidates() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current user's profile
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!myProfile) return;

      // Get all potential roommates
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", user.id)
        .eq("is_public_profile", true)
        .in("role", ["renter", "both"]);

      if (!profiles) return;

      // Score and sort candidates
      const scored = profiles.map(profile => {
        const score = scoreUsers(myProfile, profile);
        return {
          ...profile,
          compatibilityScore: score.overall,
        };
      }).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

      setCandidates(scored);
      setLoading(false);
    }

    if (!subLoading && isActiveSubscriber) {
      loadCandidates();
    }
  }, [isActiveSubscriber, subLoading]);

  const handlePass = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleConnect = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !candidates[currentIndex]) return;

    const candidate = candidates[currentIndex];
    const [userId1, userId2] = [user.id, candidate.id].sort();

    // Check if match already exists
    const { data: existingMatch } = await supabase
      .from("matches")
      .select("*")
      .eq("user_id_1", userId1)
      .eq("user_id_2", userId2)
      .single();

    if (existingMatch) {
      if (existingMatch.status === "pending") {
        // Update to mutual
        await supabase
          .from("matches")
          .update({ status: "mutual" })
          .eq("id", existingMatch.id);

        toast({ 
          title: "It's a match!", 
          description: `You and ${candidate.full_name} are now connected!` 
        });
      }
    } else {
      // Create new match
      await supabase.from("matches").insert({
        user_id_1: userId1,
        user_id_2: userId2,
        status: "pending",
      });

      toast({ 
        title: "Connection sent!", 
        description: "You'll be notified if they connect back." 
      });
    }

    setCurrentIndex(prev => prev + 1);
  };

  if (subLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const currentCandidate = candidates[currentIndex];

  if (!currentCandidate) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto p-8 bg-texture text-center">
            <h2 className="text-2xl font-bold mb-4">No more candidates</h2>
            <p className="text-muted-foreground mb-6">Check back later for new roommate matches!</p>
            <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </Card>
        </main>
      </div>
    );
  }

  const age = currentCandidate.date_of_birth 
    ? Math.floor((new Date().getTime() - new Date(currentCandidate.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">Find Your Roommate</h1>
            <p className="text-muted-foreground">
              {currentIndex + 1} of {candidates.length} • {currentCandidate.compatibilityScore}% match
            </p>
          </div>

          <Card className="overflow-hidden bg-texture">
            <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              {currentCandidate.profile_photo_url ? (
                <img 
                  src={currentCandidate.profile_photo_url} 
                  alt={currentCandidate.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-8xl text-primary/40">
                  {currentCandidate.full_name?.charAt(0) || "?"}
                </div>
              )}
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {currentCandidate.full_name || "Anonymous"}
                  {age && <span className="text-muted-foreground">, {age}</span>}
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {currentCandidate.preferred_cities && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {currentCandidate.preferred_cities[0]}
                  </Badge>
                )}
                {currentCandidate.occupation && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {currentCandidate.occupation}
                  </Badge>
                )}
                {currentCandidate.budget_max && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Home className="h-3 w-3" />
                    ${currentCandidate.budget_max}/mo
                  </Badge>
                )}
              </div>

              {currentCandidate.bio && (
                <p className="text-sm text-muted-foreground">{currentCandidate.bio}</p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                {currentCandidate.pets && (
                  <div>
                    <p className="text-muted-foreground">Pets</p>
                    <p className="font-medium">{currentCandidate.pets}</p>
                  </div>
                )}
                {currentCandidate.smoking && (
                  <div>
                    <p className="text-muted-foreground">Smoking</p>
                    <p className="font-medium">{currentCandidate.smoking}</p>
                  </div>
                )}
                {currentCandidate.sleep_schedule && (
                  <div>
                    <p className="text-muted-foreground">Schedule</p>
                    <p className="font-medium">{currentCandidate.sleep_schedule}</p>
                  </div>
                )}
                {currentCandidate.social_preference && (
                  <div>
                    <p className="text-muted-foreground">Social</p>
                    <p className="font-medium">{currentCandidate.social_preference}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <div className="flex gap-4 mt-6">
            <Button
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={handlePass}
            >
              <X className="h-6 w-6 mr-2" />
              Pass
            </Button>
            <Button
              size="lg"
              className="flex-1"
              onClick={handleConnect}
            >
              <Heart className="h-6 w-6 mr-2" />
              Connect
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
