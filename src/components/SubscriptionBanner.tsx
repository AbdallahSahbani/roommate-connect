import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Clock } from "lucide-react";

export const SubscriptionBanner = () => {
  const [trialEnd, setTrialEnd] = useState<Date | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("trialing");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("trial_end, subscription_status")
        .eq("id", user.id)
        .single();

      if (profile) {
        setTrialEnd(profile.trial_end ? new Date(profile.trial_end) : null);
        setSubscriptionStatus(profile.subscription_status);
      }
    };

    fetchSubscription();
  }, []);

  if (subscriptionStatus === "active") return null;

  const daysLeft = trialEnd ? Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;
  const isExpired = daysLeft <= 0;

  return (
    <Alert className={isExpired ? "border-destructive" : "border-primary bg-primary/5"}>
      <Clock className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>
          {isExpired
            ? "Your trial has ended. Subscribe to continue using LiveBigger."
            : `Trial ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}. Enjoy full access!`}
        </span>
        {isExpired && (
          <Button size="sm" onClick={() => navigate("/subscription")}>
            Subscribe Now - Free (No Payment Required)
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};
