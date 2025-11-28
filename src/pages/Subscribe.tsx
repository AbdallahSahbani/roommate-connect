import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

export default function Subscribe() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Upgrade to Find Your Perfect Roommate
          </h1>
          <p className="text-xl text-muted-foreground mb-12">
            Get access to our exclusive roommate matching system
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <Card className="p-8 bg-texture">
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <p className="text-4xl font-bold text-primary mb-6">$0</p>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Browse properties</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Create profile</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Basic messaging</span>
                </li>
              </ul>
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Current Plan
              </Button>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-primary/20 to-primary/5 border-primary">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <p className="text-4xl font-bold text-primary mb-6">
                $29<span className="text-lg">/month</span>
              </p>
              <ul className="space-y-3 mb-8 text-left">
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Everything in Free</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Unlimited roommate swipes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>AI compatibility matching</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-primary" />
                  <span>Verification badges</span>
                </li>
              </ul>
              <Button onClick={() => navigate("/subscription")}>
                Upgrade Now
              </Button>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
