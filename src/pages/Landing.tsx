import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Home, Users, Shield, Building2, CheckCircle2 } from "lucide-react";
import { Navigation } from "@/components/Navigation";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-primary/5 via-background to-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <Home className="h-12 w-12 text-primary" />
              <h1 className="text-5xl font-bold text-foreground">Roomates</h1>
            </div>
            
            <p className="text-2xl text-foreground/90 max-w-3xl mx-auto leading-relaxed">
              Roomates helps renters team up with verified roommates and share quality homes for less – 
              while giving landlords a simple place to post safe, vetted listings.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => navigate("/properties")}
              >
                <Building2 className="mr-2 h-5 w-5" />
                Find a Place / Roommates
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-2"
                onClick={() => navigate("/landlord/listings")}
              >
                <Home className="mr-2 h-5 w-5" />
                I'm a Landlord – List a Property
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Why Choose Roomates?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-8 text-center space-y-4 shadow-card hover:shadow-hover transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Verified Profiles & Income Checks
              </h3>
              <p className="text-muted-foreground">
                Trust is key. All roommates complete verification including background and income checks.
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4 shadow-card hover:shadow-hover transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Split Rent Fairly With Your Group
              </h3>
              <p className="text-muted-foreground">
                Form groups, browse together, and split rent on quality apartments you couldn't afford alone.
              </p>
            </Card>

            <Card className="p-8 text-center space-y-4 shadow-card hover:shadow-hover transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">
                Landlords Can Post Listings in Minutes
              </h3>
              <p className="text-muted-foreground">
                Simple, fast listing creation with photo uploads. Reach verified tenants looking for quality homes.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            How It Works
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Renters */}
            <Card className="p-8 space-y-6">
              <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Users className="h-6 w-6" />
                For Renters
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Create your profile</p>
                    <p className="text-sm text-muted-foreground">Complete verification and set your preferences</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Find compatible roommates</p>
                    <p className="text-sm text-muted-foreground">Browse profiles and see compatibility scores</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Browse properties together</p>
                    <p className="text-sm text-muted-foreground">Search listings and split rent fairly</p>
                  </div>
                </div>
              </div>
              <Button className="w-full" onClick={() => navigate("/browse")}>
                Start Browsing Roommates
              </Button>
            </Card>

            {/* For Landlords */}
            <Card className="p-8 space-y-6">
              <h3 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                For Landlords
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Create your listing</p>
                    <p className="text-sm text-muted-foreground">Add property details and upload photos</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Reach verified tenants</p>
                    <p className="text-sm text-muted-foreground">Connect with pre-screened renters</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">Manage inquiries easily</p>
                    <p className="text-sm text-muted-foreground">Review applications and communicate securely</p>
                  </div>
                </div>
              </div>
              <Button className="w-full" onClick={() => navigate("/landlord/listings")}>
                Create Your First Listing
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border bg-card">
        <div className="container mx-auto max-w-6xl text-center text-muted-foreground">
          <p>&copy; 2025 Roomates. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
