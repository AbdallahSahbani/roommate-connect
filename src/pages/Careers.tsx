import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Mail } from "lucide-react";

export default function Careers() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Careers at LiveBigger</h1>
            <p className="text-xl text-muted-foreground">
              Join us in revolutionizing the way people find roommates and rentals
            </p>
          </div>

          <Card className="p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="h-8 w-8 text-primary" />
              <h2 className="text-2xl font-bold">Why Work With Us?</h2>
            </div>
            
            <div className="space-y-4 text-muted-foreground">
              <p>
                At LiveBigger, we're building the future of housing matchmaking. Our platform 
                combines AI-powered compatibility scoring with real-world verification to help 
                people find their perfect living situation.
              </p>
              <p>
                We're a fast-growing startup that values innovation, transparency, and user trust. 
                Join our team and help millions of people "Live Bigger for Less."
              </p>
            </div>
          </Card>

          <div className="grid gap-6 mb-12">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">Full-Stack Developer</h3>
              <p className="text-muted-foreground mb-4">
                Build scalable features using React, TypeScript, and Supabase
              </p>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Apply Now
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">Machine Learning Engineer</h3>
              <p className="text-muted-foreground mb-4">
                Develop compatibility algorithms and predictive models
              </p>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Apply Now
              </Button>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-2">Product Designer</h3>
              <p className="text-muted-foreground mb-4">
                Create beautiful, intuitive experiences for our users
              </p>
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Apply Now
              </Button>
            </Card>
          </div>

          <Card className="p-8 bg-primary/5">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-4">Interested in joining our team?</h3>
              <p className="text-muted-foreground mb-6">
                Send your resume and portfolio to careers@livebigger.com
              </p>
              <Button>
                <Mail className="mr-2 h-4 w-4" />
                Email Us
              </Button>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
