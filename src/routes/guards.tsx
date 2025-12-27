import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2DE0C2] border-t-transparent" />
      </div>
    );
  }

  return session ? children : <Navigate to="/auth/login" replace />;
};

export const RequireRole = ({
  role,
  children,
}: {
  role: "renter" | "landlord" | "admin";
  children: JSX.Element;
}) => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check user_roles table for role
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", role)
        .maybeSingle();

      if (roleData) {
        setUserRole(role);
      } else {
        // Check profile role as fallback
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        
        setUserRole(profile?.role || "user");
      }
      setLoading(false);
    };

    checkRole();
  }, [role]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2DE0C2] border-t-transparent" />
      </div>
    );
  }

  return userRole === role ? children : <Navigate to="/404" replace />;
};
