import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSubscriptionStatus() {
  const [isActiveSubscriber, setIsActiveSubscriber] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsActiveSubscriber(false);
          setLoading(false);
          return;
        }

        const { data: subscription } = await supabase
          .from("subscriptions")
          .select("status, current_period_end")
          .eq("user_id", user.id)
          .single();

        const isActive = subscription?.status === "active" && 
          (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date());

        setIsActiveSubscriber(isActive);
        setLoading(false);
      } catch (error) {
        console.error("Error checking subscription:", error);
        setIsActiveSubscriber(false);
        setLoading(false);
      }
    }

    checkSubscription();
  }, []);

  return { isActiveSubscriber, loading };
}
