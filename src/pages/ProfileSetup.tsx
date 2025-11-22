import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const ProfileSetup = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    bio: "",
    occupation: "",
    budget_min: 500,
    budget_max: 2000,
    move_in_date: "",
    sleep_schedule: "flexible",
    cleanliness_level: 3,
    noise_tolerance: 3,
    guest_frequency: "occasionally",
    smoking: "non_smoker",
    pets: "no_pets",
    social_preference: "moderately_social",
    work_from_home: false,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUserId(session.user.id);
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update(formData)
        .eq("id", userId);

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile has been set up successfully.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-hover">
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Help us find your perfect roommate match by sharing your preferences and lifestyle
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* About You */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">About You</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell potential roommates about yourself..."
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation">Occupation</Label>
                  <Input
                    id="occupation"
                    placeholder="Software Engineer, Student, etc."
                    value={formData.occupation}
                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                  />
                </div>
              </div>

              {/* Budget & Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Budget & Timeline</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget_min">Min Budget ($/month)</Label>
                    <Input
                      id="budget_min"
                      type="number"
                      value={formData.budget_min}
                      onChange={(e) => setFormData({ ...formData, budget_min: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget_max">Max Budget ($/month)</Label>
                    <Input
                      id="budget_max"
                      type="number"
                      value={formData.budget_max}
                      onChange={(e) => setFormData({ ...formData, budget_max: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="move_in_date">Preferred Move-in Date</Label>
                  <Input
                    id="move_in_date"
                    type="date"
                    value={formData.move_in_date}
                    onChange={(e) => setFormData({ ...formData, move_in_date: e.target.value })}
                  />
                </div>
              </div>

              {/* Lifestyle Preferences */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Lifestyle Preferences</h3>

                <div className="space-y-2">
                  <Label htmlFor="sleep_schedule">Sleep Schedule</Label>
                  <Select value={formData.sleep_schedule} onValueChange={(value) => setFormData({ ...formData, sleep_schedule: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="early_bird">Early Bird (Sleep before 10 PM)</SelectItem>
                      <SelectItem value="night_owl">Night Owl (Sleep after midnight)</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Cleanliness Level: {formData.cleanliness_level}/5</Label>
                  <Slider
                    value={[formData.cleanliness_level]}
                    onValueChange={([value]) => setFormData({ ...formData, cleanliness_level: value })}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <p className="text-sm text-muted-foreground">1 = Relaxed, 5 = Very organized</p>
                </div>

                <div className="space-y-2">
                  <Label>Noise Tolerance: {formData.noise_tolerance}/5</Label>
                  <Slider
                    value={[formData.noise_tolerance]}
                    onValueChange={([value]) => setFormData({ ...formData, noise_tolerance: value })}
                    min={1}
                    max={5}
                    step={1}
                  />
                  <p className="text-sm text-muted-foreground">1 = Prefer quiet, 5 = Don't mind noise</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="social_preference">Social Preference</Label>
                  <Select value={formData.social_preference} onValueChange={(value) => setFormData({ ...formData, social_preference: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="very_social">Very Social (Love hanging out)</SelectItem>
                      <SelectItem value="moderately_social">Moderately Social (Sometimes)</SelectItem>
                      <SelectItem value="private">Private (Prefer alone time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smoking">Smoking</Label>
                    <Select value={formData.smoking} onValueChange={(value) => setFormData({ ...formData, smoking: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="non_smoker">Non-Smoker</SelectItem>
                        <SelectItem value="outside_only">Outside Only</SelectItem>
                        <SelectItem value="smoker">Smoker</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pets">Pets</Label>
                    <Select value={formData.pets} onValueChange={(value) => setFormData({ ...formData, pets: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="no_pets">No Pets</SelectItem>
                        <SelectItem value="has_cats">Has Cats</SelectItem>
                        <SelectItem value="has_dogs">Has Dogs</SelectItem>
                        <SelectItem value="has_other">Has Other Pets</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Complete Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileSetup;