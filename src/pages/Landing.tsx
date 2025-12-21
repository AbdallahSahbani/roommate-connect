import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Users, Shield, CheckCircle, MapPin, DollarSign, Bed, Building2, Globe, ArrowRight, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import laDowntown from "@/assets/la-downtown.jpg";
import roommatesCta from "@/assets/roommates-cta.png";
import RentPressureChart from "@/components/RentPressureChart";
import HowItWorksSection from "@/components/HowItWorksSection";

const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
  { code: "DC", name: "Washington D.C." },
];

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "FR", name: "France" },
  { code: "DE", name: "Germany" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "OM", name: "Oman" },
  { code: "TR", name: "Turkey" },
  { code: "TN", name: "Tunisia" },
  { code: "MA", name: "Morocco" },
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
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[80vh] flex items-center">
        {/* Background image with overlay */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${laDowntown})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary-dark/70 to-background/90 z-[1]" />
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent/20 rounded-full blur-3xl animate-float z-[2]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl animate-float z-[2]" style={{ animationDelay: '2s' }} />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle text-sm font-medium text-primary-foreground mb-6">
                <Sparkles className="w-4 h-4" />
                Smart Roommate Matching
              </span>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-primary-foreground mb-6 leading-[1.1]">
                Live bigger,
                <br />
                <span className="text-gradient bg-gradient-to-r from-accent via-primary-light to-accent bg-clip-text text-transparent">
                  pay less.
                </span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-primary-foreground/80 max-w-2xl mx-auto leading-relaxed mb-10 font-light">
                Team up with verified roommates and find real properties. One trusted platform for renters and landlords.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/properties">
                  <Button 
                    size="xl"
                    className="w-full sm:w-auto group"
                  >
                    Find a place
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/become-landlord">
                  <Button 
                    variant="glass"
                    size="xl"
                    className="w-full sm:w-auto text-primary-foreground border-primary-foreground/20"
                  >
                    I'm a landlord
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <div className="w-6 h-10 rounded-full border-2 border-primary-foreground/30 flex items-start justify-center p-2">
            <motion.div
              className="w-1.5 h-1.5 bg-primary-foreground rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
        </div>
      </section>

      {/* Tagline Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto max-w-4xl text-center"
        >
          <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
            Roomates helps renters team up with <span className="text-foreground font-medium">verified roommates</span> to share quality homes for less – and gives landlords a secure way to list properties to <span className="text-foreground font-medium">pre-verified tenants</span>.
          </p>
        </motion.div>
      </section>
      
      {/* Search Card Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 text-foreground">
              Search for Your Perfect Home
            </h2>
            <p className="text-center text-muted-foreground mb-8 max-w-xl mx-auto">
              Filter by location, budget, and bedrooms to find exactly what you need.
            </p>
            
            <div className="glass-card p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" />
                    Country
                  </label>
                  <Select value={searchCountry} onValueChange={setSearchCountry}>
                    <SelectTrigger className="bg-background/60 backdrop-blur-sm border-border/50 hover:border-border focus:border-primary/50">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50">
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">State / Region</label>
                  <Select value={searchState} onValueChange={setSearchState}>
                    <SelectTrigger className="bg-background/60 backdrop-blur-sm border-border/50 hover:border-border focus:border-primary/50">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] bg-popover/95 backdrop-blur-xl border-border/50">
                      {searchCountry === "US" ? (
                        US_STATES.map((state) => (
                          <SelectItem key={state.code} value={state.code}>
                            {state.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="all">All Regions</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    City
                  </label>
                  <Input 
                    placeholder="New York, London, Paris..." 
                    value={searchCity} 
                    onChange={e => setSearchCity(e.target.value)} 
                    onKeyPress={handleKeyPress}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Max Rent
                  </label>
                  <Input 
                    type="number" 
                    placeholder="3500" 
                    value={maxRent} 
                    onChange={e => setMaxRent(e.target.value)} 
                    onKeyPress={handleKeyPress}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Bed className="h-4 w-4 text-primary" />
                    Bedrooms
                  </label>
                  <Select value={bedrooms} onValueChange={setBedrooms}>
                    <SelectTrigger className="bg-background/60 backdrop-blur-sm border-border/50 hover:border-border focus:border-primary/50">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover/95 backdrop-blur-xl border-border/50">
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button size="lg" className="w-full" onClick={handleSearch}>
                    Search Properties
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section with Rent Chart */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Why Choose Roomates?
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to find the perfect living situation, all in one place.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] gap-10 items-start">
            {/* Left: Feature Cards in 2x2 Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 stagger-fade-in">
              <FeatureCard 
                icon={<Users className="h-6 w-6" />} 
                title="Smart Matching" 
                description="Our algorithm finds roommates who truly match your lifestyle and preferences." 
              />
              <FeatureCard 
                icon={<Shield className="h-6 w-6" />} 
                title="Verified Users" 
                description="ID verification, income checks, and background screening for peace of mind." 
              />
              <FeatureCard 
                icon={<Home className="h-6 w-6" />} 
                title="Quality Listings" 
                description="Browse verified properties from trusted landlords across the country." 
              />
              <FeatureCard 
                icon={<CheckCircle className="h-6 w-6" />} 
                title="Group Applications" 
                description="Form groups and apply to properties together with confidence." 
              />
            </div>
            
            {/* Right: Rent Pressure Chart */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
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
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">
              Ready to Live Bigger with Less?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who've found their ideal living situation through Roomates.
            </p>
          </motion.div>
          
          {/* Three Column Layout: Testimonial - Ad Card - Testimonial */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left Testimonials */}
            <div className="hidden lg:flex flex-col gap-6">
              <TestimonialCard 
                quote="I was nervous about finding roommates in NYC. Roomates matched me with two amazing people, and now we share a beautiful 3BR in Brooklyn for less than I'd pay for a studio!"
                name="Sarah M."
                location="Brooklyn, NY"
                role="Software Engineer"
              />
              <TestimonialCard 
                quote="The verification process gave me peace of mind. Knowing my future roommates were background-checked made the whole experience stress-free."
                name="James T."
                location="Boston, MA"
                role="Medical Resident"
              />
            </div>

            {/* Center Ad Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="max-w-md mx-auto w-full"
            >
              <div className="glass-card overflow-hidden hover-glow">
                <img 
                  src={roommatesCta} 
                  alt="Roomates - Live bigger, pay less with verified roommates" 
                  className="w-full h-auto"
                />
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

            {/* Right Testimonials */}
            <div className="hidden lg:flex flex-col gap-6">
              <TestimonialCard 
                quote="As a landlord, I love that tenants come pre-verified. No more wasting time on unqualified applicants – every group that applies is ready to move in."
                name="Michael R."
                location="San Francisco, CA"
                role="Property Owner"
              />
              <TestimonialCard 
                quote="Moving to a new city was scary, but finding my roommate group through Roomates turned strangers into friends. Best decision I ever made!"
                name="Emily K."
                location="Austin, TX"
                role="Marketing Manager"
              />
            </div>
          </div>

          {/* Mobile Testimonials */}
          <div className="lg:hidden mt-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TestimonialCard 
              quote="I was nervous about finding roommates in NYC. Roomates matched me with two amazing people!"
              name="Sarah M."
              location="Brooklyn, NY"
              role="Software Engineer"
            />
            <TestimonialCard 
              quote="As a landlord, I love that tenants come pre-verified. No more wasting time on unqualified applicants."
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
              <h3 className="font-bold text-xl mb-4 text-primary-foreground">Roomates</h3>
              <p className="text-primary-foreground/70">
                Live Bigger with Less.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-primary-foreground">Product</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/browse" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Find Roommates</Link></li>
                <li><Link to="/properties" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Browse Properties</Link></li>
                <li><Link to="/subscription" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-primary-foreground">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/board" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Board</Link></li>
                <li><Link to="/careers" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-primary-foreground">Legal</h4>
              <ul className="space-y-3 text-sm">
                <li><Link to="/privacy-policy" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-primary-foreground/20 text-center text-sm text-primary-foreground/70">
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
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="glass-card p-6 hover-lift group"
  >
    <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground mb-4 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2 text-foreground">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
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
  <div className="text-center group">
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-primary text-primary-foreground text-xl font-bold mb-4 shadow-glow group-hover:scale-110 transition-transform duration-300">
      {number}
    </div>
    <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

const TestimonialCard = ({
  quote,
  name,
  location,
  role
}: {
  quote: string;
  name: string;
  location: string;
  role: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    className="glass-card p-6 hover-lift"
  >
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
    <p className="text-muted-foreground text-sm italic mb-5 leading-relaxed">"{quote}"</p>
    <div className="border-t border-border/50 pt-4">
      <p className="font-semibold text-foreground text-sm">{name}</p>
      <p className="text-xs text-muted-foreground">{role} • {location}</p>
    </div>
  </motion.div>
);

export default Landing;
