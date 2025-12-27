import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, User, MessageSquare, Building2, LogOut, Shield, Building, Heart, Users, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import { motion } from "framer-motion";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLandlord, isAdmin, isRenter, loading } = useCurrentUserRole();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const navButtonClass = "text-foreground/80 hover:text-foreground hover:bg-primary/10 font-medium rounded-lg transition-all duration-200";

  return (
    <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-gradient tracking-tight">ROOMATES</span>
          </Link>

          <div className="flex items-center gap-1">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button variant="ghost" size="sm" asChild className={navButtonClass}>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Link>
              </Button>
            </motion.div>

            {loading ? (
              <Button variant="ghost" size="sm" disabled className="text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : (
              <>
                {isLandlord && (
                  <>
                    <Button variant="ghost" size="sm" asChild className={navButtonClass}>
                      <Link to="/landlord/dashboard">
                        <Building className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className={navButtonClass}>
                      <Link to="/landlord/listings">
                        <Building2 className="h-4 w-4 mr-2" />
                        Listings
                      </Link>
                    </Button>
                  </>
                )}

                {isRenter && !isLandlord && (
                  <>
                    <Button variant="ghost" size="sm" asChild className={navButtonClass}>
                      <Link to="/properties">
                        <Building2 className="h-4 w-4 mr-2" />
                        Properties
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className={navButtonClass}>
                      <Link to="/roommate-swipe">
                        <Heart className="h-4 w-4 mr-2 text-primary" />
                        Roommates
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className={navButtonClass}>
                      <Link to="/groups">
                        <Users className="h-4 w-4 mr-2" />
                        Groups
                      </Link>
                    </Button>
                  </>
                )}

                {!isRenter && !isLandlord && !isAdmin && (
                  <Button variant="ghost" size="sm" asChild className={navButtonClass}>
                    <Link to="/properties">
                      <Building2 className="h-4 w-4 mr-2" />
                      Properties
                    </Link>
                  </Button>
                )}

                {isAdmin && (
                  <Button variant="ghost" size="sm" asChild className={navButtonClass}>
                    <Link to="/admin">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
              </>
            )}
            
            <Button variant="ghost" size="sm" asChild className={navButtonClass}>
              <Link to="/messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className={navButtonClass}>
              <Link to="/profile-setup">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className={navButtonClass}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};