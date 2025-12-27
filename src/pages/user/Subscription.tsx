import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, Sparkles, Crown, Zap, Shield, Users, Home, MessageSquare, Search } from "lucide-react";

export default function Subscription() {
  const [userId, setUserId] = useState<string | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("trialing");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("subscription_status")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setSubscriptionStatus(profile.subscription_status || "trialing");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleActivateSubscription = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          subscription_start: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Subscription Activated!",
        description: "You now have full access to Roomates",
      });

      setSubscriptionStatus("active");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const premiumFeatures = [
    { icon: Users, text: "Unlimited roommate matches" },
    { icon: Zap, text: "Full compatibility scores" },
    { icon: MessageSquare, text: "Unlimited messaging" },
    { icon: Home, text: "Apply to unlimited properties" },
    { icon: Sparkles, text: "AI-powered recommendations" },
    { icon: Shield, text: "Priority support" },
    { icon: Search, text: "Advanced search filters" },
    { icon: Users, text: "Group formation tools" },
  ];

  const trialFeatures = [
    "5 roommate matches",
    "Basic compatibility",
    "Limited messaging",
    "3 property applications",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <Navigation />
      
      <div className="container max-w-6xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Crown className="h-4 w-4" />
            {subscriptionStatus === "active" ? "You're a Premium Member" : "Upgrade Your Experience"}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Choose Your Plan
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {subscriptionStatus === "active"
              ? "Thank you for being a premium member!"
              : "Unlock the full power of Roomates and find your perfect living situation"}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Trial Card */}
          <Card className="relative bg-card/50 backdrop-blur-sm border-border/50 hover:border-border transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Starter</CardTitle>
                <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">
                  LIMITED
                </span>
              </div>
              <CardDescription className="text-base">
                Try before you commit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-bold">$0</span>
                <span className="text-muted-foreground">/ 3 days</span>
              </div>
              
              <div className="h-px bg-border" />
              
              <ul className="space-y-4">
                {trialFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center">
                      <Check className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button className="w-full" variant="outline" disabled>
                Currently Active
              </Button>
            </CardContent>
          </Card>

          {/* Premium Card */}
          <Card className="relative bg-gradient-to-br from-primary/5 via-card to-primary/5 border-primary/30 shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-300 overflow-hidden">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none" />
            
            {/* Badge */}
            <div className="absolute -top-px left-1/2 -translate-x-1/2">
              <div className="bg-gradient-to-r from-primary via-primary-light to-primary text-primary-foreground px-6 py-2 rounded-b-xl text-sm font-semibold flex items-center gap-2 shadow-lg">
                <Sparkles className="h-4 w-4" />
                FREE FOREVER
              </div>
            </div>
            
            <CardHeader className="pb-4 pt-10 relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Crown className="h-6 w-6 text-primary" />
                  Premium
                </CardTitle>
                <span className="text-xs bg-primary/20 text-primary px-3 py-1 rounded-full font-medium">
                  BEST VALUE
                </span>
              </div>
              <CardDescription className="text-base">
                Everything you need to find your perfect home
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6 relative">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl text-muted-foreground line-through">$9.99</span>
                <span className="text-5xl font-bold text-primary">$0</span>
                <span className="text-muted-foreground">/ forever</span>
              </div>
              
              <div className="h-px bg-primary/20" />
              
              <ul className="space-y-4">
                {premiumFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <feature.icon className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <span className="font-medium">{feature.text}</span>
                  </li>
                ))}
              </ul>
              
              <Button
                className="w-full py-6 text-lg font-semibold bg-primary hover:bg-primary-dark shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 transition-all duration-300"
                onClick={handleActivateSubscription}
                disabled={loading || subscriptionStatus === "active"}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="h-5 w-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Activating...
                  </span>
                ) : subscriptionStatus === "active" ? (
                  <span className="flex items-center gap-2">
                    <Check className="h-5 w-5" />
                    Already Premium
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Activate Free Premium
                  </span>
                )}
              </Button>
              
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  No credit card
                </span>
                <span>•</span>
                <span>No hidden fees</span>
                <span>•</span>
                <span>Cancel anytime</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trust badges */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">Trusted by thousands of renters and landlords</p>
          <div className="flex items-center justify-center gap-8 text-muted-foreground/50">
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">10K+</p>
              <p className="text-sm">Active Users</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">5K+</p>
              <p className="text-sm">Matches Made</p>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <p className="text-3xl font-bold text-foreground">98%</p>
              <p className="text-sm">Satisfaction</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}