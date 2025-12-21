import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, User, MessageSquare, Building2, LogOut, Shield, Building, Heart, Users, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import logo from "@/assets/roommates-logo.png";

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

  const navButtonClass = "text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/10 font-medium rounded-none tracking-wide";

  return (
    <nav className="glass-nav sticky top-0 z-50 shadow-card border-b border-primary-foreground/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logo} 
              alt="Roomates Logo" 
              className="h-9 w-auto group-hover:opacity-80 transition-opacity duration-200 filter drop-shadow object-contain" 
            />
            <span className="font-semibold text-lg text-primary-foreground tracking-wide uppercase">Roomates</span>
          </Link>

          <div className="flex items-center">
            {/* Home - always visible */}
            <Button variant="ghost" size="sm" asChild className={navButtonClass}>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>

            {/* Show loading state while fetching roles */}
            {loading ? (
              <Button variant="ghost" size="sm" disabled className="text-primary-foreground/50">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : (
              <>
                {/* LANDLORD ACCOUNT */}
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

                {/* RENTER ACCOUNT */}
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
                        <Heart className="h-4 w-4 mr-2" />
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

                {/* For users without roles */}
                {!isRenter && !isLandlord && !isAdmin && (
                  <Button variant="ghost" size="sm" asChild className={navButtonClass}>
                    <Link to="/properties">
                      <Building2 className="h-4 w-4 mr-2" />
                      Properties
                    </Link>
                  </Button>
                )}

                {/* Admin menu */}
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
            
            {/* Common navigation */}
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
