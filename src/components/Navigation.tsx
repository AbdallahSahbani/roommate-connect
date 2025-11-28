import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, User, Search, MessageSquare, Building2, LogOut, Shield, Building } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/roommates-logo.png";

export const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLandlord, setIsLandlord] = useState(false);

  useEffect(() => {
    checkLandlordRole();
  }, []);

  const checkLandlordRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    setIsLandlord(profile?.role === 'landlord' || profile?.role === 'both');
  };

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
              className="h-10 w-10 group-hover:scale-110 transition-bounce filter drop-shadow-md" 
            />
            <span className="font-bold text-xl text-primary-foreground">Roomates</span>
          </Link>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
              <Link to="/browse">
                <Search className="h-4 w-4 mr-2" />
                Find Roommates
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
              <Link to="/properties">
                <Building2 className="h-4 w-4 mr-2" />
                Properties
              </Link>
            </Button>
            {isLandlord && (
              <>
                <Button variant="ghost" size="sm" asChild className="text-primary-foreground hover:text-white hover:bg-white/15 font-medium">
                  <Link to="/landlord/listings">
                    <Building className="h-4 w-4 mr-2" />
                    My Listings
                  </Link>
                </Button>
                <Button 
                  size="sm" 
                  asChild 
                  className="bg-white/20 text-primary-foreground hover:bg-white/30 border border-white/30 shadow-glow ml-2 font-medium"
                >
                  <Link to="/landlord/listings/new">
                    Post a Property
                  </Link>
                </Button>
              </>
            )}
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
