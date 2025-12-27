import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSubscriptionStatus } from "@/hooks/useSubscriptionStatus";
import { useRoommateMatching } from "@/hooks/useRoommateMatching";
import { useToast } from "@/hooks/use-toast";
import { SwipeCard } from "@/components/roommate/SwipeCard";
import { Heart, X, RefreshCw, Users, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function RoommateSwipe() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isActiveSubscriber, loading: subLoading } = useSubscriptionStatus();
  
  const {
    currentCandidate,
    nextCandidate,
    currentIndex,
    totalCandidates,
    loading,
    aiInsights,
    insightsLoading,
    handleSwipe,
    refreshCandidates,
  } = useRoommateMatching();

  useEffect(() => {
    async function checkAuthAndSubscription() {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Skip subscription check for now to allow testing
      // if (!subLoading && !isActiveSubscriber) {
      //   navigate("/subscription");
      //   return;
      // }
    }

    checkAuthAndSubscription();
  }, [isActiveSubscriber, subLoading, navigate]);

  const onSwipe = async (direction: 'left' | 'right') => {
    if (!currentCandidate) return;
    
    await handleSwipe(direction);
    
    if (direction === 'right') {
      toast({ 
        title: "Connection sent!", 
        description: "You'll be notified if they connect back.",
      });
    }
  };

  if (subLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <Card className="p-8 text-center">
              <motion.div 
                className="flex flex-col items-center gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="h-12 w-12 text-primary" />
                </motion.div>
                <h2 className="text-xl font-semibold">Finding your perfect roommates...</h2>
                <p className="text-muted-foreground">Our AI is analyzing compatibility</p>
              </motion.div>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  if (!currentCandidate) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <main className="container mx-auto px-4 py-12">
          <motion.div 
            className="max-w-md mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="p-8 text-center bg-card">
              <div className="flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">No more candidates</h2>
                  <p className="text-muted-foreground">
                    Check back later for new roommate matches!
                  </p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={refreshCandidates}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                  <Button onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <motion.div 
            className="text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-foreground mb-1">Find Roommates</h1>
            <p className="text-muted-foreground">
              {currentIndex + 1} of {totalCandidates} • Swipe or use buttons
            </p>
          </motion.div>

          {/* Card stack */}
          <div className="relative h-[580px] mb-6">
            <AnimatePresence>
              {/* Next card (behind) */}
              {nextCandidate && (
                <SwipeCard
                  key={nextCandidate.id}
                  candidate={nextCandidate}
                  aiInsights={aiInsights[nextCandidate.id]}
                  insightsLoading={insightsLoading[nextCandidate.id]}
                  onSwipe={() => {}}
                  isTop={false}
                />
              )}
              
              {/* Current card (on top) */}
              <SwipeCard
                key={currentCandidate.id}
                candidate={currentCandidate}
                aiInsights={aiInsights[currentCandidate.id]}
                insightsLoading={insightsLoading[currentCandidate.id]}
                onSwipe={onSwipe}
                isTop={true}
              />
            </AnimatePresence>
          </div>

          {/* Action buttons */}
          <motion.div 
            className="flex justify-center gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="w-16 h-16 rounded-full border-2 border-red-300 hover:bg-red-50 hover:border-red-400 transition-all"
              onClick={() => onSwipe('left')}
            >
              <X className="h-8 w-8 text-red-500" />
            </Button>
            <Button
              size="lg"
              className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 shadow-lg transition-all"
              onClick={() => onSwipe('right')}
            >
              <Heart className="h-8 w-8 text-white" />
            </Button>
          </motion.div>

          {/* Hint text */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Drag card left to pass, right to connect
          </p>
        </div>
      </main>
    </div>
  );
}
