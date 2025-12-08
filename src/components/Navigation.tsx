import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, User, MessageSquare, Building2, LogOut, Shield, Building, Heart, Users, Loader2, ArrowLeftRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useCurrentUserRole } from "@/hooks/useCurrentUserRole";
import logo from "@/assets/roommates-logo.png";

export const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isLandlord, isAdmin, isRenter, loading } = useCurrentUserRole();

  // Determine which mode the user is in based on current route
  const isOnLandlordRoute = location.pathname.startsWith('/landlord');
  const isOnAdminRoute = location.pathname.startsWith('/admin');
  const isOnRenterRoute = !isOnLandlordRoute && !isOnAdminRoute;

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

  // Function to switch between renter and landlord modes
  const handleSwitchMode = () => {
    if (isOnLandlordRoute && isRenter) {
      navigate("/properties");
    } else if (isOnRenterRoute && isLandlord) {
      navigate("/landlord/dashboard");
    }
  };

  return (
    <nav className="bg-gradient-nav bg-grain border-b border-primary-light/20 sticky top-0 z-50 backdrop-blur-sm shadow-glow">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src={logo} 
              alt="Roomates Logo" 
              className="h-10 w-auto group-hover:scale-110 transition-bounce filter drop-shadow-md object-contain" 
            />
            <span className="font-bold text-xl text-primary-foreground">Roomates</span>
          </Link>

          <div className="flex items-center gap-1">
            {/* Home - always visible */}
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
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
                {/* LANDLORD MODE - Show when on landlord routes AND user is landlord */}
                {isOnLandlordRoute && isLandlord && (
                  <>
                    <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
                      <Link to="/landlord/dashboard">
                        <Building className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
                      <Link to="/landlord/listings">
                        <Building2 className="h-4 w-4 mr-2" />
                        My Listings
                      </Link>
                    </Button>
                    {/* Switch to Renter mode if user is also a renter */}
                    {isRenter && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleSwitchMode}
                        className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium border border-primary-foreground/30"
                      >
                        <ArrowLeftRight className="h-4 w-4 mr-2" />
                        Switch to Renter
                      </Button>
                    )}
                  </>
                )}

                {/* RENTER MODE - Show when NOT on landlord routes AND user is renter */}
                {isOnRenterRoute && isRenter && (
                  <>
                    <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
                      <Link to="/properties">
                        <Building2 className="h-4 w-4 mr-2" />
                        Browse Properties
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
                      <Link to="/roommates/swipe">
                        <Heart className="h-4 w-4 mr-2" />
                        Find Roommates
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
                      <Link to="/groups">
                        <Users className="h-4 w-4 mr-2" />
                        My Groups
                      </Link>
                    </Button>
                    {/* Switch to Landlord mode if user is also a landlord */}
                    {isLandlord && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleSwitchMode}
                        className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium border border-primary-foreground/30"
                      >
                        <ArrowLeftRight className="h-4 w-4 mr-2" />
                        Switch to Landlord
                      </Button>
                    )}
                  </>
                )}

                {/* For users without roles or not logged in - show browse only */}
                {!isRenter && !isLandlord && !isOnAdminRoute && (
                  <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
                    <Link to="/properties">
                      <Building2 className="h-4 w-4 mr-2" />
                      Browse Properties
                    </Link>
                  </Button>
                )}

                {/* Admin menu - only on admin routes or for admins */}
                {isAdmin && (
                  <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
                    <Link to="/admin">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
              </>
            )}
            
            {/* Common navigation - always visible for authenticated users */}
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
              <Link to="/messages">
                <MessageSquare className="h-4 w-4 mr-2" />
                Messages
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
              <Link to="/profile-setup">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};