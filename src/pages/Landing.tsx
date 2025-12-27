import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Home, Users, Shield, CheckCircle, MapPin, DollarSign, Bed, Globe, ArrowRight, Sparkles, Zap, Building2, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/Navigation";
import { ParticleBackground } from "@/components/ParticleBackground";

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
    <div className="min-h-screen bg-background overflow-hidden">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* 3D Particle Background */}
        <div className="absolute inset-0 z-0">
          <ParticleBackground />
        </div>
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-background/50 to-background z-[1]" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[2]" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24 pb-20">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30 mb-8"
              >
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">AI-Powered Roommate Matching</span>
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight mb-6 leading-[1.05]"
              >
                <span className="text-foreground">Live </span>
                <span className="text-gradient-primary">bigger</span>
                <span className="text-foreground">,</span>
                <br />
                <span className="text-foreground">pay </span>
                <span className="text-gradient-secondary">less</span>
                <span className="text-foreground">.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-12"
              >
                Team up with verified roommates and find quality properties. 
                <span className="text-foreground font-medium"> One trusted platform</span> for renters and landlords.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link to="/properties">
                  <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 neon-glow group">
                    <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Find a Place
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/become-landlord">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6 border-primary/50 hover:bg-primary/10 hover:border-primary group">
                    <Building2 className="w-5 h-5 mr-2" />
                    I'm a Landlord
                  </Button>
                </Link>
              </motion.div>
              
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.9 }}
                className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16"
              >
                <StatItem value="50K+" label="Active Users" />
                <StatItem value="10K+" label="Properties" />
                <StatItem value="98%" label="Match Rate" />
              </motion.div>
            </motion.div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </motion.div>
        </motion.div>
      </section>
      
      {/* Search Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
        
        <div className="container mx-auto max-w-5xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center mb-12">
              <motion.span 
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-secondary/30 mb-4"
              >
                <MapPin className="h-4 w-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">Search</span>
              </motion.span>
              <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
                Find Your <span className="text-gradient-primary">Perfect</span> Home
              </h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                Search thousands of verified properties across the globe
              </p>
            </div>
            
            <div className="glass-card gradient-border-animated p-8 rounded-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-primary" />
                    Country
                  </label>
                  <Select value={searchCountry} onValueChange={setSearchCountry}>
                    <SelectTrigger className="bg-card/50 border-border/50 rounded-xl h-12">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-xl">
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>{country.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">State / Region</label>
                  <Select value={searchState} onValueChange={setSearchState}>
                    <SelectTrigger className="bg-card/50 border-border/50 rounded-xl h-12">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px] bg-card border-border rounded-xl">
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
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    City
                  </label>
                  <Input 
                    placeholder="New York, London, Paris..." 
                    value={searchCity} 
                    onChange={e => setSearchCity(e.target.value)} 
                    onKeyPress={handleKeyPress}
                    className="bg-card/50 border-border/50 rounded-xl h-12"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <DollarSign className="h-3.5 w-3.5 text-accent" />
                    Max Rent
                  </label>
                  <Input 
                    type="number" 
                    placeholder="3500" 
                    value={maxRent} 
                    onChange={e => setMaxRent(e.target.value)} 
                    onKeyPress={handleKeyPress}
                    className="bg-card/50 border-border/50 rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <Bed className="h-3.5 w-3.5 text-secondary" />
                    Bedrooms
                  </label>
                  <Select value={bedrooms} onValueChange={setBedrooms}>
                    <SelectTrigger className="bg-card/50 border-border/50 rounded-xl h-12">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border rounded-xl">
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="1">1+</SelectItem>
                      <SelectItem value="2">2+</SelectItem>
                      <SelectItem value="3">3+</SelectItem>
                      <SelectItem value="4">4+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button size="lg" className="w-full h-12 rounded-xl neon-glow" onClick={handleSearch}>
                    <Zap className="w-4 h-4 mr-2" />
                    Search Properties
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-16"
          >
            <motion.span 
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-accent/30 mb-4"
            >
              <Star className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">Features</span>
            </motion.span>
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Why Choose <span className="text-gradient-secondary">Roomates</span>?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              The most advanced roommate matching platform in 2026
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={<Users className="h-6 w-6" />} 
              title="AI Matching" 
              description="Neural network finds roommates who truly match your lifestyle." 
              index={0}
              color="primary"
            />
            <FeatureCard 
              icon={<Shield className="h-6 w-6" />} 
              title="Verified Users" 
              description="ID verification, income checks, and background screening." 
              index={1}
              color="secondary"
            />
            <FeatureCard 
              icon={<Home className="h-6 w-6" />} 
              title="Quality Listings" 
              description="Browse verified properties from trusted landlords." 
              index={2}
              color="accent"
            />
            <FeatureCard 
              icon={<CheckCircle className="h-6 w-6" />} 
              title="Group Apply" 
              description="Form groups and apply to properties together." 
              index={3}
              color="primary"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-primary opacity-10" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-3xl" />
        </div>
        
        <div className="container mx-auto max-w-4xl relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-4xl sm:text-6xl font-bold text-foreground mb-6">
              Ready to <span className="text-gradient-primary">Get Started</span>?
            </h2>
            <p className="text-muted-foreground text-xl max-w-xl mx-auto mb-10">
              Join thousands of users who've found their ideal living situation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" className="text-lg px-10 py-6 neon-glow">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Free Today
                </Button>
              </Link>
              <Link to="/properties">
                <Button variant="outline" size="lg" className="text-lg px-10 py-6 border-primary/50 hover:bg-primary/10">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                <Home className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-gradient-primary">Roomates</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-muted-foreground">
              <Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="/terms-of-service" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
              <Link to="/careers" className="hover:text-foreground transition-colors">Careers</Link>
            </div>
            
            <p className="text-sm text-muted-foreground">
              © 2026 Roomates. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatItem = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-3xl sm:text-4xl font-bold text-gradient-primary mb-1">{value}</div>
    <div className="text-sm text-muted-foreground">{label}</div>
  </div>
);

const FeatureCard = ({ 
  icon, 
  title, 
  description, 
  index,
  color = "primary"
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  index: number;
  color?: "primary" | "secondary" | "accent";
}) => {
  const colorClasses = {
    primary: "text-primary bg-primary/10 border-primary/30",
    secondary: "text-secondary bg-secondary/10 border-secondary/30",
    accent: "text-accent bg-accent/10 border-accent/30",
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass-card p-6 rounded-2xl border border-border/50 hover:border-primary/50 transition-all duration-300 group"
    >
      <div className={`w-14 h-14 rounded-xl ${colorClasses[color]} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
};

export default Landing;
