import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface UserRole {
  isAdmin: boolean;
  isLandlord: boolean;
  isRenter: boolean;
  loading: boolean;
}

export function useCurrentUserRole(): UserRole {
  const [role, setRole] = useState<UserRole>({
    isAdmin: false,
    isLandlord: false,
    isRenter: false,
    loading: true,
  });

  useEffect(() => {
    async function fetchRoles() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole({
            isAdmin: false,
            isLandlord: false,
            isRenter: false,
            loading: false,
          });
          return;
        }

        // Fetch ALL roles from user_roles table (security-compliant)
        const { data: userRoles } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        const roles = userRoles?.map(r => r.role) || [];
        
        setRole({
          isAdmin: roles.includes("admin"),
          isLandlord: roles.includes("landlord"),
          isRenter: roles.includes("renter"),
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching user roles:", error);
        setRole({
          isAdmin: false,
          isLandlord: false,
          isRenter: false,
          loading: false,
        });
      }
    }

    fetchRoles();
  }, []);

  return role;
}
