import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Users, Shield, CheckCircle, MapPin, DollarSign, Bed, Globe, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import laDowntown from "@/assets/la-downtown.jpg";
import roommatesCta from "@/assets/roommates-cta.png";
import RentPressureChart from "@/components/RentPressureChart";
import HowItWorksSection from "@/components/HowItWorksSection";

const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AK", name: "Alaska" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" }, { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" }, { code: "DE", name: "Delaware" }, { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" }, { code: "HI", name: "Hawaii" }, { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" }, { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" }, { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" }, { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" }, { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" }, { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" }, { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" }, { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" }, { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" }, { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" }, { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" }, { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" }, { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" }, { code: "WY", name: "Wyoming" }, { code: "DC", name: "Washington D.C." },
];

const COUNTRIES = [
  { code: "US", name: "United States" }, { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" }, { code: "DE", name: "Germany" }, { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" }, { code: "SE", name: "Sweden" }, { code: "JP", name: "Japan" },
  { code: "CN", name: "China" }, { code: "SA", name: "Saudi Arabia" }, { code: "AE", name: "United Arab Emirates" },
  { code: "OM", name: "Oman" }, { code: "TR", name: "Turkey" }, { code: "TN", name: "Tunisia" }, { code: "MA", name: "Morocco" },
];

const Landing = () => {
  const navigate = useNavigate();
  const [searchCity, setSearchCity] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchCountry, setSearchCountry] = useState("US");
  const [maxRent, setMaxRent] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchCity) params.append("city", searchCity);
    if (searchState) params.append("state", searchState);
    if (searchCountry) params.append("country", searchCountry);
    if (maxRent) params.append("maxRent", maxRent);
    if (bedrooms && bedrooms !== "any") params.append("bedrooms", bedrooms);
    navigate(`/properties?${params.toString()}`);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[85vh] flex items-center">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${laDowntown})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-primary/85 z-[1]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <span className="inline-block text-xs tracking-[0.3em] uppercase text-primary-foreground/60 mb-6 font-medium">
                Smart Roommate Matching
              </span>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-primary-foreground mb-6 leading-[1.05]">
                Live bigger,
                <br />
                pay less.
              </h1>
              
              <p className="text-xl text-primary-foreground/70 max-w-xl leading-relaxed mb-10">
                Team up with verified roommates and find quality properties. One trusted platform for renters and landlords.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/properties">
                  <Button size="lg" variant="accent" className="w-full sm:w-auto group">
                    Find a place
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/become-landlord">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:border-primary-foreground/50">
                    I'm a landlord
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tagline Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-b border-border">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-3xl text-center"
        >
          <p className="text-lg text-muted-foreground leading-relaxed">
            Roomates helps renters team up with <span className="text-foreground font-medium">verified roommates</span> to share quality homes for less – and gives landlords a secure way to list to <span className="text-foreground font-medium">pre-verified tenants</span>.
          </p>
        </motion.div>
      </section>
      
      {/* Search Card Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-10">
              <span className="inline-block text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Search</span>
              <h2 className="text-3xl font-semibold text-foreground">
                Find Your Perfect Home
              </h2>
            </div>
            
            <div className="glass-card p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5" />
                    Country
                  </label>
                  <Select value={searchCountry} onValueChange={setSearchCountry}>
                    <SelectTrigger className="bg-background/80 border-border rounded-sm">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border rounded-sm">
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">State / Region</label>
                  <Select value={searchState} onValueChange={setSearchState}>
                    <SelectTrigger className="bg-background/80 border-border rounded-sm">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] bg-popover border-border rounded-sm">
                      {searchCountry === "US" ? (
                        US_STATES.map((state) => (
                          <SelectItem key={state.code} value={state.code}>{state.name}</SelectItem>
                        ))
                      ) : (
                        <SelectItem value="all">All Regions</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5" />
                    City
                  </label>
                  <Input 
                    placeholder="New York, London, Paris..." 
                    value={searchCity} 
                    onChange={e => setSearchCity(e.target.value)} 
                    onKeyPress={handleKeyPress}
                    className="rounded-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5" />
                    Max Rent
                  </label>
                  <Input 
                    type="number" 
                    placeholder="3500" 
                    value={maxRent} 
                    onChange={e => setMaxRent(e.target.value)} 
                    onKeyPress={handleKeyPress}
                    className="rounded-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Bed className="h-3.5 w-3.5" />
                    Bedrooms
                  </label>
                  <Select value={bedrooms} onValueChange={setBedrooms}>
                    <SelectTrigger className="bg-background/80 border-border rounded-sm">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border rounded-sm">
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button size="lg" className="w-full rounded-sm" onClick={handleSearch}>
                    Search Properties
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <span className="inline-block text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Features</span>
            <h2 className="text-3xl font-semibold text-foreground">
              Why Choose Roomates?
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-10 items-start">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FeatureCard icon={<Users className="h-5 w-5" />} title="Smart Matching" description="Our algorithm finds roommates who truly match your lifestyle." />
              <FeatureCard icon={<Shield className="h-5 w-5" />} title="Verified Users" description="ID verification, income checks, and background screening." />
              <FeatureCard icon={<Home className="h-5 w-5" />} title="Quality Listings" description="Browse verified properties from trusted landlords." />
              <FeatureCard icon={<CheckCircle className="h-5 w-5" />} title="Group Applications" description="Form groups and apply to properties together." />
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <RentPressureChart />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* CTA Section with Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <span className="inline-block text-xs tracking-[0.3em] uppercase text-muted-foreground mb-3">Get Started</span>
            <h2 className="text-3xl font-semibold text-foreground mb-4">
              Ready to Live Bigger with Less?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Join thousands of users who've found their ideal living situation.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            <div className="hidden lg:flex flex-col gap-5">
              <TestimonialCard 
                quote="Roomates matched me with two amazing people. Now we share a beautiful 3BR in Brooklyn for less than I'd pay for a studio."
                name="Sarah M."
                location="Brooklyn, NY"
                role="Software Engineer"
              />
              <TestimonialCard 
                quote="The verification process gave me peace of mind. Knowing my future roommates were background-checked made everything stress-free."
                name="James T."
                location="Boston, MA"
                role="Medical Resident"
              />
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="max-w-md mx-auto w-full"
            >
              <div className="glass-card overflow-hidden">
                <img src={roommatesCta} alt="Roomates" className="w-full h-auto" />
                <div className="p-5">
                  <Link to="/properties">
                    <Button className="w-full" size="lg">
                      Find a place
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>

            <div className="hidden lg:flex flex-col gap-5">
              <TestimonialCard 
                quote="As a landlord, I love that tenants come pre-verified. Every group that applies is ready to move in."
                name="Michael R."
                location="San Francisco, CA"
                role="Property Owner"
              />
              <TestimonialCard 
                quote="Finding my roommate group through Roomates turned strangers into friends. Best decision I ever made!"
                name="Emily K."
                location="Austin, TX"
                role="Marketing Manager"
              />
            </div>
          </div>

          <div className="lg:hidden mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TestimonialCard 
              quote="Roomates matched me with two amazing people!"
              name="Sarah M."
              location="Brooklyn, NY"
              role="Software Engineer"
            />
            <TestimonialCard 
              quote="As a landlord, I love that tenants come pre-verified."
              name="Michael R."
              location="San Francisco, CA"
              role="Property Owner"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-nav py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <h3 className="font-semibold text-lg mb-4 text-primary-foreground tracking-wide uppercase">Roomates</h3>
              <p className="text-primary-foreground/60 text-sm">Live Bigger with Less.</p>
            </div>
            <div>
              <h4 className="font-medium text-xs uppercase tracking-widest mb-4 text-primary-foreground">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/browse" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Find Roommates</Link></li>
                <li><Link to="/properties" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Browse Properties</Link></li>
                <li><Link to="/subscription" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-xs uppercase tracking-widest mb-4 text-primary-foreground">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/board" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Board</Link></li>
                <li><Link to="/careers" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-xs uppercase tracking-widest mb-4 text-primary-foreground">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/privacy-policy" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center text-xs text-primary-foreground/50 tracking-wide">
            <p>&copy; 2025 Roomates. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="glass-card p-6 group"
  >
    <div className="w-10 h-10 bg-primary flex items-center justify-center text-primary-foreground mb-4 group-hover:bg-accent transition-colors duration-200">
      {icon}
    </div>
    <h3 className="text-base font-medium mb-2 text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

const TestimonialCard = ({ quote, name, location, role }: { quote: string; name: string; location: string; role: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.4 }}
    className="glass-card p-6"
  >
    <div className="flex gap-0.5 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-3.5 h-3.5 text-accent fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
    <p className="text-muted-foreground text-sm italic mb-5 leading-relaxed">"{quote}"</p>
    <div className="border-t border-border pt-4">
      <p className="font-medium text-foreground text-sm">{name}</p>
      <p className="text-xs text-muted-foreground">{role} • {location}</p>
    </div>
  </motion.div>
);

export default Landing;
