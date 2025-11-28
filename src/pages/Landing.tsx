import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Users, Shield, CheckCircle, MapPin, DollarSign, Bed, Building2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import nycSkyline from "@/assets/nyc-skyline.png";

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
    <div className="min-h-screen bg-background">
      {/* Hero Section with Search */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 min-h-[700px] flex items-center">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${nycSkyline})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70" />
        </div>
        <div className="mx-auto max-w-7xl relative z-10 w-full">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl drop-shadow-lg">
              Roomates
            </h1>
            <p className="mt-6 text-lg text-white/90 max-w-2xl mx-auto drop-shadow-md">
              Roomates helps renters team up with verified roommates to share quality homes for less – and gives landlords a secure way to list properties to pre-verified tenants.
            </p>

            {/* Search Card */}
            <div className="mt-10 max-w-4xl mx-auto">
              <div className="bg-card/95 backdrop-blur-sm rounded-xl p-6 shadow-hover">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      City
                    </label>
                    <Input
                      placeholder="New Haven"
                      value={searchCity}
                      onChange={(e) => setSearchCity(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground">State</label>
                    <Select value={searchState} onValueChange={setSearchState}>
                      <SelectTrigger className="bg-background">
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
                    <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Max Rent
                    </label>
                    <Input
                      type="number"
                      placeholder="3500"
                      value={maxRent}
                      onChange={(e) => setMaxRent(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-card-foreground flex items-center gap-2">
                      <Bed className="h-4 w-4" />
                      Bedrooms
                    </label>
                    <Select value={bedrooms} onValueChange={setBedrooms}>
                      <SelectTrigger className="bg-background">
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
                <Button 
                  size="lg" 
                  className="w-full mt-6"
                  onClick={handleSearch}
                >
                  Search Properties
                </Button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="secondary">
                  Get Started
                </Button>
              </Link>
              <Link to="/browse">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Browse Roommates
                </Button>
              </Link>
              <Link to="/landlord/listings">
                <Button size="lg" variant="outline" className="bg-primary/90 border-primary text-white hover:bg-primary">
                  <Building2 className="mr-2 h-5 w-5" />
                  I'm a Landlord
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Why Choose Roomates?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Users className="h-8 w-8 text-primary" />}
              title="Smart Matching"
              description="Our compatibility algorithm finds roommates who truly match your lifestyle and preferences."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary" />}
              title="Verified Users"
              description="ID verification, income checks, and background screening ensure your safety."
            />
            <FeatureCard
              icon={<Home className="h-8 w-8 text-primary" />}
              title="Quality Listings"
              description="Browse verified properties from trusted landlords across your preferred cities."
            />
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8 text-primary" />}
              title="Group Applications"
              description="Form groups with compatible roommates and apply to properties together."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StepCard
              number="1"
              title="Search for Your Place"
              description="Browse verified rentals in your preferred location and budget range."
            />
            <StepCard
              number="2"
              title="Find Compatible Roommates"
              description="Connect with roommates who match your lifestyle and preferences."
            />
            <StepCard
              number="3"
              title="Apply Together"
              description="Form groups and apply to rental properties with confidence."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Ready to Live Bigger with Less?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users who've found their ideal living situation through Roomates.
          </p>
          <Link to="/auth">
            <Button size="lg" className="shadow-hover">
              Start Your Search Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gradient-secondary bg-grain py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4 text-white">Roomates</h3>
              <p className="text-sm text-white/70">
                Live Bigger with Less.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/browse" className="text-white/70 hover:text-white transition-fast">Find Roommates</Link></li>
                <li><Link to="/properties" className="text-white/70 hover:text-white transition-fast">Browse Properties</Link></li>
                <li><Link to="/subscription" className="text-white/70 hover:text-white transition-fast">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/board" className="text-white/70 hover:text-white transition-fast">Board</Link></li>
                <li><Link to="/careers" className="text-white/70 hover:text-white transition-fast">Careers</Link></li>
                <li><Link to="/contact" className="text-white/70 hover:text-white transition-fast">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="#" className="text-white/70 hover:text-white transition-fast">Privacy Policy</Link></li>
                <li><Link to="#" className="text-white/70 hover:text-white transition-fast">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm text-white/70">
            <p>&copy; 2025 Roomates. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-card rounded-xl p-6 shadow-card hover:shadow-glow transition-smooth border-2 border-transparent hover:border-primary/20 group animate-fade-up">
    <div className="mb-4 group-hover:scale-110 transition-transform">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 text-card-foreground">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const StepCard = ({ number, title, description }: { number: string; title: string; description: string }) => (
  <div className="text-center animate-scale-in group">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-primary text-white text-xl font-bold mb-4 shadow-glow group-hover:scale-110 transition-transform">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Landing;
