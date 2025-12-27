import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { ParticleBackground } from "@/components/ParticleBackground";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Users, Home, MessageSquare, Shield, CheckCircle, AlertCircle, 
  Sparkles, ArrowRight, Zap, Brain, Building2, Heart,
  TrendingUp, Clock, MapPin
} from "lucide-react";

const Dashboard = () => {
  const [profile, setProfile] = useState<any>(null);
  const [verifications, setVerifications] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ matches: 0, properties: 0, messages: 0 });
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

      // Fetch stats
      const [matchesRes, propertiesRes, messagesRes] = await Promise.all([
        supabase.from("matches").select("id", { count: 'exact' }).or(`user_id_1.eq.${session.user.id},user_id_2.eq.${session.user.id}`),
        supabase.from("properties").select("id", { count: 'exact' }).eq("is_active", true),
        supabase.from("messages").select("id", { count: 'exact' }).or(`sender_id.eq.${session.user.id},recipient_id.eq.${session.user.id}`).eq("is_read", false),
      ]);

      setStats({
        matches: matchesRes.count || 0,
        properties: propertiesRes.count || 0,
        messages: messagesRes.count || 0,
      });

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
        <motion.div 
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-muted-foreground font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const profileComplete = profile?.bio && profile?.budget_min;
  const allVerified = verifications.identity && verifications.face && verifications.income;
  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />
      <Navigation />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <motion.div 
          className="mb-12 mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-medium text-primary">AI-Powered Matching Active</span>
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
            <span className="text-foreground">Welcome back, </span>
            <span className="text-gradient">{firstName}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Your personalized AI assistant is ready to help you find the perfect roommate match.
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <StatCard 
            icon={<Heart className="h-5 w-5" />}
            label="Matches"
            value={stats.matches}
            color="primary"
          />
          <StatCard 
            icon={<Building2 className="h-5 w-5" />}
            label="Properties"
            value={stats.properties}
            color="secondary"
          />
          <StatCard 
            icon={<MessageSquare className="h-5 w-5" />}
            label="Messages"
            value={stats.messages}
            color="accent"
            badge={stats.messages > 0 ? "New" : undefined}
          />
          <StatCard 
            icon={<Shield className="h-5 w-5" />}
            label="Trust Score"
            value={allVerified ? "100%" : "75%"}
            color="success"
          />
        </motion.div>

        {/* Main Action Cards */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* AI Swipe Card */}
          <div className="glass-card p-6 gradient-border-animated group cursor-pointer" onClick={() => navigate('/roommate-swipe')}>
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                <Brain className="h-7 w-7 text-primary-foreground" />
              </div>
              <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Featured
              </Badge>
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">
              AI Roommate Matching
            </h3>
            <p className="text-muted-foreground mb-6">
              Our neural network analyzes compatibility across 50+ factors. Swipe to find your perfect match.
            </p>
            <Button className="w-full group-hover:glow-primary transition-all">
              Start Matching
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Properties Card */}
          <div className="glass-card p-6 group cursor-pointer" onClick={() => navigate('/properties')}>
            <div className="flex items-start justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-secondary flex items-center justify-center shadow-glow-secondary">
                <Home className="h-7 w-7 text-secondary-foreground" />
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <TrendingUp className="h-4 w-4 text-success" />
                <span>{stats.properties} available</span>
              </div>
            </div>
            <h3 className="text-2xl font-display font-bold text-foreground mb-2">
              Browse Properties
            </h3>
            <p className="text-muted-foreground mb-6">
              Explore verified rental listings with AI-powered recommendations based on your preferences.
            </p>
            <Button variant="outline" className="w-full border-secondary/30 hover:border-secondary hover:bg-secondary/10">
              View Listings
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <QuickActionCard
            icon={<Users className="h-5 w-5" />}
            title="Browse Roommates"
            description="View all compatible profiles"
            link="/browse"
          />
          <QuickActionCard
            icon={<MessageSquare className="h-5 w-5" />}
            title="Messages"
            description="Chat with matches"
            link="/messages"
            badge={stats.messages > 0 ? `${stats.messages}` : undefined}
          />
          <QuickActionCard
            icon={<Shield className="h-5 w-5" />}
            title="Verification"
            description={allVerified ? "Fully verified" : "Complete verification"}
            link="/verification"
            status={allVerified ? "complete" : "pending"}
          />
        </motion.div>

        {/* Profile Card */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="glass-card overflow-hidden">
              <CardHeader className="border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-display">Your Profile</CardTitle>
                    <CardDescription>Keep your profile updated for better matches</CardDescription>
                  </div>
                  <Badge variant={profileComplete ? "default" : "secondary"} className={profileComplete ? "bg-success/20 text-success border-success/30" : ""}>
                    {profileComplete ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complete
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Incomplete
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <ProfileStat 
                    icon={<Zap className="h-4 w-4 text-primary" />}
                    label="Budget"
                    value={`$${profile.budget_min || 0} - $${profile.budget_max || 0}`}
                  />
                  <ProfileStat 
                    icon={<Clock className="h-4 w-4 text-secondary" />}
                    label="Schedule"
                    value={profile.sleep_schedule?.replace("_", " ") || "Not set"}
                  />
                  <ProfileStat 
                    icon={<MapPin className="h-4 w-4 text-accent" />}
                    label="Location"
                    value={profile.preferred_city || "Any"}
                  />
                  <ProfileStat 
                    icon={<Shield className="h-4 w-4 text-success" />}
                    label="Verified"
                    value={profile.id_verified ? "Yes" : "Pending"}
                  />
                </div>
                <div className="mt-6 pt-6 border-t border-border/50">
                  <Link to="/profile-setup">
                    <Button variant="outline" className="w-full">
                      Update Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>
    </div>
  );
};

// Sub-components
const StatCard = ({ icon, label, value, color, badge }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number;
  color: 'primary' | 'secondary' | 'accent' | 'success';
  badge?: string;
}) => {
  const colorClasses = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    secondary: 'text-secondary bg-secondary/10 border-secondary/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
    success: 'text-success bg-success/10 border-success/20',
  };

  return (
    <div className="glass-card p-4 relative overflow-hidden group hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
      {badge && (
        <Badge className="absolute top-2 right-2 bg-accent text-accent-foreground text-[10px] px-1.5">
          {badge}
        </Badge>
      )}
    </div>
  );
};

const QuickActionCard = ({ icon, title, description, link, badge, status }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
  badge?: string;
  status?: 'complete' | 'pending';
}) => (
  <Link to={link}>
    <div className="glass-card p-5 group cursor-pointer hover:border-primary/30 transition-all h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground group-hover:bg-primary/20 group-hover:text-primary transition-colors">
          {icon}
        </div>
        {badge && (
          <Badge className="bg-accent text-accent-foreground">{badge}</Badge>
        )}
        {status === 'complete' && (
          <CheckCircle className="h-5 w-5 text-success" />
        )}
        {status === 'pending' && (
          <AlertCircle className="h-5 w-5 text-accent" />
        )}
      </div>
      <h4 className="font-semibold text-foreground mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </Link>
);

const ProfileStat = ({ icon, label, value }: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium text-foreground capitalize">{value}</p>
    </div>
  </div>
);

export default Dashboard;