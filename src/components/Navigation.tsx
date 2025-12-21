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

  return (
    <nav className="glass-nav sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logo} 
              alt="Roomates Logo" 
              className="h-10 w-auto group-hover:scale-110 transition-all duration-300 filter drop-shadow-lg object-contain" 
            />
            <span className="font-bold text-xl text-primary-foreground tracking-tight">Roomates</span>
          </Link>

          <div className="flex items-center gap-1">
            {/* Home - always visible */}
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/15 font-medium rounded-xl">
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
                {/* LANDLORD ACCOUNT - Landlords see ONLY landlord tabs */}
                {isLandlord && (
                  <>
                    <Button variant="ghost" size="sm" asChild className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/15 font-medium rounded-xl">
                      <Link to="/landlord/dashboard">
                        <Building className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/15 font-medium rounded-xl">
                      <Link to="/landlord/listings">
                        <Building2 className="h-4 w-4 mr-2" />
                        My Listings
                      </Link>
                    </Button>
                  </>
                )}

                {/* RENTER ACCOUNT - Renters see ONLY renter tabs */}
                {isRenter && !isLandlord && (
                  <>
                    <Button variant="ghost" size="sm" asChild className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/15 font-medium rounded-xl">
                      <Link to="/properties">
                        <Building2 className="h-4 w-4 mr-2" />
                        Browse Properties
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/15 font-medium rounded-xl">
                      <Link to="/roommate-swipe">
                        <Heart className="h-4 w-4 mr-2" />
                        Find Roommates
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/15 font-medium rounded-xl">
                      <Link to="/groups">
                        <Users className="h-4 w-4 mr-2" />
                        My Groups
                      </Link>
                    </Button>
                  </>
                )}

                {/* For users without roles or not logged in - show browse only */}
                {!isRenter && !isLandlord && !isAdmin && (
                  <Button variant="ghost" size="sm" asChild className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/15 font-medium rounded-xl">
                    <Link to="/properties">
                      <Building2 className="h-4 w-4 mr-2" />
                      Browse Properties
                    </Link>
                  </Button>
                )}

                {/* Admin menu - only for admins */}
                {isAdmin && (
                  <Button variant="ghost" size="sm" asChild className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/15 font-medium rounded-xl">
                    <Link to="/admin">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
              </>
            )}
            
            {/* Common navigation - always visible for authenticated users */}
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/15 font-medium rounded-xl">
              <Link to="/messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/15 font-medium rounded-xl">
              <Link to="/profile-setup">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground/90 hover:text-primary-foreground hover:bg-primary-foreground/15 font-medium rounded-xl">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};
