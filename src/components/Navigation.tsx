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
            {/* All users - always visible */}
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
              <Link to="/properties">
                <Building2 className="h-4 w-4 mr-2" />
                Browse Properties
              </Link>
            </Button>
            
            {/* Show loading state while fetching roles */}
            {loading ? (
              <Button variant="ghost" size="sm" disabled className="text-primary-foreground/50">
                <Loader2 className="h-4 w-4 animate-spin" />
              </Button>
            ) : (
              <>
                {/* Renter-only menu - only show if user is renter AND not landlord-only */}
                {isRenter && (
                  <>
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
                  </>
                )}
                
                {/* Landlord-only menu - only show if user is landlord */}
                {isLandlord && (
                  <>
                    <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
                      <Link to="/landlord/dashboard">
                        <Building className="h-4 w-4 mr-2" />
                        Landlord Dashboard
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
                      <Link to="/landlord/listings">
                        <Building2 className="h-4 w-4 mr-2" />
                        My Listings
                      </Link>
                    </Button>
                  </>
                )}
                
                {/* Admin-only menu */}
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
            
            {/* All authenticated users - always visible */}
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