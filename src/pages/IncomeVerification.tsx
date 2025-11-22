import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, Upload, DollarSign, Shield } from "lucide-react";

export default function IncomeVerification() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [selfReportedIncome, setSelfReportedIncome] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    setUserId(session.user.id);
    await loadProfile(session.user.id);
    await loadVerifications(session.user.id);
    setLoading(false);
  };

  const loadProfile = async (uid: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", uid)
      .single();
    
    if (data) {
      setProfile(data);
      setSelfReportedIncome(data.self_reported_monthly_income?.toString() || "");
    }
  };

  const loadVerifications = async (uid: string) => {
    const { data } = await supabase
      .from("income_verifications")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });
    
    if (data) setVerifications(data);
  };

  const handleSelfReported = async () => {
    if (!selfReportedIncome) return;
    
    setSubmitting(true);
    const { error } = await supabase
      .from("profiles")
      .update({ self_reported_monthly_income: parseFloat(selfReportedIncome) })
      .eq("id", userId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Self-reported income saved" });
      await loadProfile(userId);
    }
    setSubmitting(false);
  };

  const handleDocumentUpload = async () => {
    setSubmitting(true);
    
    const { error } = await supabase
      .from("income_verifications")
      .insert({
        user_id: userId,
        status: "pending",
        source: "documents",
        document_urls: []
      });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ 
        title: "Submitted", 
        description: "Your verification request is pending admin review" 
      });
      await loadVerifications(userId);
    }
    setSubmitting(false);
  };

  const handlePlaidConnect = () => {
    toast({
      title: "Coming Soon",
      description: "Plaid integration will be available soon"
    });
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const hasApprovedVerification = verifications.some(v => v.status === "approved");

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Income Verification</h1>
            <p className="text-muted-foreground">
              Verify your income to unlock better matches and faster approvals
            </p>
          </div>

          {/* Level 1: Self-Reported */}
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Level 1: Self-Reported Income</h3>
                  <p className="text-sm text-muted-foreground">Quick and easy</p>
                </div>
              </div>
              {profile?.self_reported_monthly_income && (
                <Badge variant="secondary">Completed</Badge>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="income">Monthly Income</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="5000"
                  value={selfReportedIncome}
                  onChange={(e) => setSelfReportedIncome(e.target.value)}
                />
              </div>
              <Button onClick={handleSelfReported} disabled={submitting || !selfReportedIncome}>
                Save Income
              </Button>
            </div>
          </Card>

          {/* Level 2: Document Upload */}
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Upload className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Level 2: Document Verification</h3>
                  <p className="text-sm text-muted-foreground">Upload pay stubs or tax returns</p>
                </div>
              </div>
              {verifications.some(v => v.status === "pending") && (
                <Badge variant="outline">Pending Review</Badge>
              )}
              {hasApprovedVerification && verifications[0]?.source === "documents" && (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Our team will review your documents within 1-2 business days
            </p>
            <Button onClick={handleDocumentUpload} disabled={submitting} variant="outline">
              Submit for Review
            </Button>
          </Card>

          {/* Level 3: Plaid */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Level 3: Bank Verification</h3>
                  <p className="text-sm text-muted-foreground">Connect your bank for instant verification</p>
                </div>
              </div>
              {hasApprovedVerification && verifications[0]?.source === "plaid" && (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Most secure and trusted by landlords
            </p>
            <Button onClick={handlePlaidConnect} variant="outline">
              Connect Bank (Coming Soon)
            </Button>
          </Card>
        </div>
      </main>
    </div>
  );
}
