import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Briefcase, Home, Moon, Sun, Users, Sparkles, Shield, CheckCircle2 } from "lucide-react";

interface AIInsights {
  vibeCheck: string;
  compatibilityPoints: string[];
  potentialChallenges: string[];
  recommendedIcebreaker: string;
}

interface SwipeCardProps {
  candidate: {
    id: string;
    full_name?: string | null;
    profile_photo_url?: string | null;
    date_of_birth?: string | null;
    occupation?: string | null;
    bio?: string | null;
    preferred_cities?: string[] | null;
    budget_max?: number | null;
    sleep_schedule?: string | null;
    social_preference?: string | null;
    pets?: string | null;
    smoking?: string | null;
    cleanliness_level?: number | null;
    noise_tolerance?: number | null;
    work_from_home?: boolean | null;
    id_verified?: boolean | null;
    income_verified?: boolean | null;
    compatibilityScore: number;
  };
  aiInsights?: AIInsights | null;
  insightsLoading?: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

export function SwipeCard({ candidate, aiInsights, insightsLoading, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);
  
  // Visual indicators for swipe direction
  const likeOpacity = useTransform(x, [0, 100], [0, 1]);
  const passOpacity = useTransform(x, [-100, 0], [1, 0]);

  const age = candidate.date_of_birth 
    ? Math.floor((new Date().getTime() - new Date(candidate.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  const getSleepIcon = (schedule: string) => {
    if (schedule === 'night_owl') return <Moon className="h-3 w-3" />;
    if (schedule === 'early_bird') return <Sun className="h-3 w-3" />;
    return <Sun className="h-3 w-3" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  return (
    <motion.div
      className="absolute w-full"
      style={{ x, rotate, opacity }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
      initial={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
      animate={{ scale: isTop ? 1 : 0.95, y: isTop ? 0 : 10 }}
    >
      {/* Swipe indicators */}
      {isTop && (
        <>
          <motion.div
            className="absolute top-4 right-4 z-10 bg-green-500 text-white px-4 py-2 rounded-lg font-bold text-xl border-4 border-green-600 rotate-12"
            style={{ opacity: likeOpacity }}
          >
            CONNECT!
          </motion.div>
          <motion.div
            className="absolute top-4 left-4 z-10 bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-xl border-4 border-red-600 -rotate-12"
            style={{ opacity: passOpacity }}
          >
            PASS
          </motion.div>
        </>
      )}

      <Card className="overflow-hidden bg-card border-border shadow-xl">
        {/* Photo section */}
        <div className="relative aspect-[4/3] bg-gradient-to-br from-primary/20 to-primary/5">
          {candidate.profile_photo_url ? (
            <img 
              src={candidate.profile_photo_url} 
              alt={candidate.full_name || "Profile"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-9xl font-bold text-primary/30">
                {candidate.full_name?.charAt(0) || "?"}
              </div>
            </div>
          )}
          
          {/* Score badge */}
          <div className="absolute top-3 left-3">
            <Badge className={`${getScoreColor(candidate.compatibilityScore)} bg-background/90 backdrop-blur-sm text-lg px-3 py-1 border`}>
              {candidate.compatibilityScore}% Match
            </Badge>
          </div>

          {/* Verification badges */}
          <div className="absolute top-3 right-3 flex gap-1">
            {candidate.id_verified && (
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                <Shield className="h-3 w-3 mr-1" /> ID
              </Badge>
            )}
            {candidate.income_verified && (
              <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Income
              </Badge>
            )}
          </div>
        </div>

        {/* Content section */}
        <div className="p-5 space-y-4">
          {/* Name and age */}
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {candidate.full_name || "Anonymous"}
              {age && <span className="text-muted-foreground font-normal">, {age}</span>}
            </h2>
          </div>

          {/* Quick info badges */}
          <div className="flex flex-wrap gap-2">
            {candidate.preferred_cities?.[0] && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {candidate.preferred_cities[0]}
              </Badge>
            )}
            {candidate.occupation && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                {candidate.occupation}
              </Badge>
            )}
            {candidate.budget_max && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Home className="h-3 w-3" />
                ${candidate.budget_max}/mo
              </Badge>
            )}
            {candidate.sleep_schedule && (
              <Badge variant="secondary" className="flex items-center gap-1">
                {getSleepIcon(candidate.sleep_schedule)}
                {candidate.sleep_schedule.replace('_', ' ')}
              </Badge>
            )}
            {candidate.social_preference && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {candidate.social_preference}
              </Badge>
            )}
          </div>

          {/* Bio */}
          {candidate.bio && (
            <p className="text-sm text-muted-foreground line-clamp-2">{candidate.bio}</p>
          )}

          {/* AI Insights section */}
          {insightsLoading ? (
            <div className="bg-primary/5 rounded-lg p-4 animate-pulse">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Analyzing compatibility...</span>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-primary/10 rounded w-3/4"></div>
                <div className="h-3 bg-primary/10 rounded w-1/2"></div>
              </div>
            </div>
          ) : aiInsights ? (
            <div className="bg-primary/5 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-primary">AI Match Insights</span>
              </div>
              
              <p className="text-sm font-medium text-foreground">{aiInsights.vibeCheck}</p>
              
              <ul className="space-y-1">
                {aiInsights.compatibilityPoints.map((point, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                    {point}
                  </li>
                ))}
              </ul>

              {aiInsights.recommendedIcebreaker && (
                <div className="pt-2 border-t border-border/50">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium">Icebreaker:</span> {aiInsights.recommendedIcebreaker}
                  </p>
                </div>
              )}
            </div>
          ) : null}

          {/* Lifestyle grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {candidate.pets && candidate.pets !== 'none' && (
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="text-xs text-muted-foreground">Pets</p>
                <p className="font-medium capitalize">{candidate.pets}</p>
              </div>
            )}
            {candidate.smoking && (
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="text-xs text-muted-foreground">Smoking</p>
                <p className="font-medium capitalize">{candidate.smoking}</p>
              </div>
            )}
            {candidate.cleanliness_level && (
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="text-xs text-muted-foreground">Cleanliness</p>
                <p className="font-medium">{candidate.cleanliness_level}/5</p>
              </div>
            )}
            {candidate.work_from_home && (
              <div className="bg-muted/50 rounded-lg p-2">
                <p className="text-xs text-muted-foreground">Works from</p>
                <p className="font-medium">Home</p>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
