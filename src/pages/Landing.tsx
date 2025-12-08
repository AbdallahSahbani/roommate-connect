import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Users, Shield, CheckCircle, MapPin, DollarSign, Bed, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import roommatesCta from "@/assets/roommates-cta.png";

const Landing = () => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState("");
  const [searchState, setSearchState] = useState("");
  const [maxRent, setMaxRent] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.append("city", searchCity);
    if (searchState) params.append("state", searchState);
    if (maxRent) params.append("maxRent", maxRent);
    if (bedrooms && bedrooms !== "any") params.append("bedrooms", bedrooms);
    navigate(`/properties?${params.toString()}`);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="min-h-screen relative" style={{ backgroundImage: `url('/textures/dark-cubes-bg.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[70vh] md:min-h-[70vh] sm:min-h-[60vh] flex items-center">
        <div className="mx-auto max-w-4xl relative z-10 w-full px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white drop-shadow-2xl mb-6" style={{ fontFamily: 'Inter, SF Pro, system-ui, sans-serif' }}>
            Live bigger, pay less.
          </h1>
          <p className="text-lg sm:text-xl text-white/95 max-w-2xl mx-auto drop-shadow-lg leading-relaxed mb-8">
            Team up with verified roommates and real properties. Roomates connects renters, landlords, and shared homes into one trusted platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/properties">
              <Button 
                size="lg" 
                className="w-full sm:w-auto text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-primary hover:bg-primary-light text-white"
              >
                Find a place
              </Button>
            </Link>
            <Link to="/become-landlord" className="text-white/90 hover:text-white transition-colors flex items-center justify-center sm:justify-start text-lg underline underline-offset-4">
              I'm a landlord
            </Link>
          </div>
        </div>
      </section>

      {/* Tagline Section */}
      <section className="relative z-10 bg-black/50 backdrop-blur-sm py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-lg text-white/90">
            Roomates helps renters team up with verified roommates to share quality homes for less – and gives landlords a secure way to list properties to pre-verified tenants.
          </p>
        </div>
      </section>
      
      {/* Search Card Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-8 text-white drop-shadow-lg">
            Search for Your Perfect Home
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-hover border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    City
                  </label>
                  <Input placeholder="New Haven" value={searchCity} onChange={e => setSearchCity(e.target.value)} onKeyPress={handleKeyPress} className="bg-white/20 border-white/30 text-white placeholder:text-white/60" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">State</label>
                  <Select value={searchState} onValueChange={setSearchState}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CT">Connecticut</SelectItem>
                      <SelectItem value="NY">New York</SelectItem>
                      <SelectItem value="MA">Massachusetts</SelectItem>
                      <SelectItem value="RI">Rhode Island</SelectItem>
                      <SelectItem value="NJ">New Jersey</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Max Rent
                  </label>
                  <Input type="number" placeholder="3500" value={maxRent} onChange={e => setMaxRent(e.target.value)} onKeyPress={handleKeyPress} className="bg-white/20 border-white/30 text-white placeholder:text-white/60" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Bed className="h-4 w-4" />
                    Bedrooms
                  </label>
                  <Select value={bedrooms} onValueChange={setBedrooms}>
                    <SelectTrigger className="bg-white/20 border-white/30 text-white">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button size="lg" className="w-full mt-6 bg-primary hover:bg-primary-light text-white" onClick={handleSearch}>
                Search Properties
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-white drop-shadow-lg">
            Why Choose Roomates?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard icon={<Users className="h-8 w-8 text-primary-light" />} title="Smart Matching" description="Our compatibility algorithm finds roommates who truly match your lifestyle and preferences." />
            <FeatureCard icon={<Shield className="h-8 w-8 text-primary-light" />} title="Verified Users" description="ID verification, income checks, and background screening ensure your safety." />
            <FeatureCard icon={<Home className="h-8 w-8 text-primary-light" />} title="Quality Listings" description="Browse verified properties from trusted landlords across your preferred cities." />
            <FeatureCard icon={<CheckCircle className="h-8 w-8 text-primary-light" />} title="Group Applications" description="Form groups with compatible roommates and apply to properties together." />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10 bg-black/30 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-white drop-shadow-lg">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard number="1" title="Search for Your Place" description="Browse verified rentals in your preferred location and budget range." />
            <StepCard number="2" title="Find Compatible Roommates" description="Connect with roommates who match your lifestyle and preferences." />
            <StepCard number="3" title="Apply Together" description="Form groups and apply to rental properties with confidence." />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-white drop-shadow-lg">
              Ready to Live Bigger with Less?
            </h2>
            <p className="text-lg text-white/80 mb-8">
              Join thousands of users who've found their ideal living situation through Roomates.
            </p>
          </div>
          
          {/* Ad Card - Half Size */}
          <div className="max-w-md mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-xl overflow-hidden shadow-card border border-white/20 hover:shadow-glow transition-all duration-300">
              <img 
                src={roommatesCta} 
                alt="Roomates - Live bigger, pay less with verified roommates" 
                className="w-full h-auto"
              />
              <div className="p-4">
                <Link to="/properties">
                  <Button 
                    className="w-full py-5 shadow-hover bg-primary hover:bg-primary-light text-white"
                  >
                    Find a place
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-nav bg-grain py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-primary-foreground">Roomates</h3>
              <p className="text-sm text-primary-foreground/70">
                Live Bigger with Less.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-primary-foreground">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/browse" className="text-primary-foreground/70 hover:text-primary-foreground transition-bounce hover:translate-x-1">Find Roommates</Link></li>
                <li><Link to="/properties" className="text-primary-foreground/70 hover:text-primary-foreground transition-bounce hover:translate-x-1">Browse Properties</Link></li>
                <li><Link to="/subscription" className="text-primary-foreground/70 hover:text-primary-foreground transition-bounce hover:translate-x-1">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-primary-foreground">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/board" className="text-primary-foreground/70 hover:text-primary-foreground transition-bounce hover:translate-x-1">Board</Link></li>
                <li><Link to="/careers" className="text-primary-foreground/70 hover:text-primary-foreground transition-bounce hover:translate-x-1">Careers</Link></li>
                <li><Link to="/contact" className="text-primary-foreground/70 hover:text-primary-foreground transition-bounce hover:translate-x-1">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-primary-foreground">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/privacy-policy" className="text-primary-foreground/70 hover:text-primary-foreground transition-bounce hover:translate-x-1">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-primary-foreground/70 hover:text-primary-foreground transition-bounce hover:translate-x-1">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/70">
            <p>&copy; 2025 Roomates. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-card border border-white/20 hover:shadow-glow transition-smooth hover:scale-105 group animate-fade-up">
    <div className="mb-4 group-hover:scale-110 transition-bounce">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-white/70">{description}</p>
  </div>
);

const StepCard = ({
  number,
  title,
  description
}: {
  number: string;
  title: string;
  description: string;
}) => (
  <div className="text-center animate-scale-in group">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white text-xl font-bold mb-4 shadow-glow group-hover:scale-110 transition-bounce">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-white/70">{description}</p>
  </div>
);

export default Landing;
