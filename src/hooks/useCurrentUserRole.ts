import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserRole {
  profileRole: string | null;
  isAdmin: boolean;
  isLandlord: boolean;
  isRenter: boolean;
  loading: boolean;
}

export function useCurrentUserRole(): UserRole {
  const [role, setRole] = useState<UserRole>({
    profileRole: null,
    isAdmin: false,
    isLandlord: false,
    isRenter: false,
    loading: true,
  });

  useEffect(() => {
    async function fetchRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole({
            profileRole: null,
            isAdmin: false,
            isLandlord: false,
            isRenter: false,
            loading: false,
          });
          return;
        }

        // Fetch profile role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // Check admin status
        const { data: adminRole } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .single();

        const profileRole = profile?.role || "renter";
        
        setRole({
          profileRole,
          isAdmin: !!adminRole,
          isLandlord: profileRole === "landlord" || profileRole === "both",
          isRenter: profileRole === "renter" || profileRole === "both",
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching user role:", error);
        setRole({
          profileRole: null,
          isAdmin: false,
          isLandlord: false,
          isRenter: false,
          loading: false,
        });
      }
    }

    fetchRole();
  }, []);

  return role;
}
