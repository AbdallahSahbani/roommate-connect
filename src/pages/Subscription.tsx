import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Check, Sparkles } from "lucide-react";

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
        setSubscriptionStatus(profile.subscription_status);
      }
    };
    checkAuth();
  }, [navigate]);

  const handleActivateSubscription = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // Since we're using a free model, just activate the subscription
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
        description: "You now have full access to LiveBigger",
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

  const features = [
    "Unlimited roommate matches",
    "Full compatibility scores",
    "Unlimited messaging",
    "Apply to unlimited properties",
    "AI-powered recommendations",
    "Priority support",
    "Advanced search filters",
    "Group formation tools",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-4xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            {subscriptionStatus === "active"
              ? "You're already subscribed!"
              : "Get full access to LiveBigger"}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Card className="relative">
            <CardHeader>
              <CardTitle className="text-2xl">Free Trial</CardTitle>
              <CardDescription>Try before you commit</CardDescription>
              <div className="text-3xl font-bold mt-4">
                $0 <span className="text-lg font-normal text-muted-foreground">/ 3 days</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full mt-6" variant="outline" disabled>
                Currently in Trial
              </Button>
            </CardContent>
          </Card>

          <Card className="relative border-primary shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                FREE - No Payment Required
              </div>
            </div>
            <CardHeader className="mt-4">
              <CardTitle className="text-2xl">Full Access</CardTitle>
              <CardDescription>Everything you need to find your perfect roommate</CardDescription>
              <div className="text-3xl font-bold mt-4">
                <span className="line-through text-muted-foreground">$9.99</span> $0{" "}
                <span className="text-lg font-normal text-muted-foreground">/ forever</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full mt-6"
                onClick={handleActivateSubscription}
                disabled={loading || subscriptionStatus === "active"}
              >
                {subscriptionStatus === "active" ? "Already Subscribed" : "Activate Free Subscription"}
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-4">
                No credit card required. No hidden fees. 100% free.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
