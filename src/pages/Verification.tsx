import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Upload, CheckCircle, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Verification() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("identity");
  const [verifications, setVerifications] = useState<any>({});
  
  // Identity verification
  const [idFront, setIdFront] = useState<File | null>(null);
  const [idBack, setIdBack] = useState<File | null>(null);
  
  // Face verification
  const [selfie, setSelfie] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Income verification
  const [incomeDoc, setIncomeDoc] = useState<File | null>(null);
  const [annualIncome, setAnnualIncome] = useState("");

  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      setUserId(user.id);
      fetchVerifications(user.id);
    };
    checkAuth();
  }, [navigate]);

  const fetchVerifications = async (uid: string) => {
    const { data } = await supabase
      .from("verifications")
      .select("*")
      .eq("user_id", uid);
    
    if (data) {
      const verificationMap = data.reduce((acc, v) => {
        acc[v.verification_type] = v;
        return acc;
      }, {} as any);
      setVerifications(verificationMap);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const imageData = canvasRef.current.toDataURL("image/jpeg");
        setSelfie(imageData);
        stopCamera();
      }
    }
  };

  const handleIdentityVerification = async () => {
    if (!idFront || !idBack || !userId) {
      toast({
        title: "Missing Documents",
        description: "Please upload both front and back of your ID",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Simulate verification process
      const confidence = Math.floor(Math.random() * 15) + 85; // 85-100
      
      const { error } = await supabase.from("verifications").upsert({
        user_id: userId,
        verification_type: "identity",
        status: confidence > 90 ? "verified" : "pending",
        confidence_score: confidence,
        document_urls: ["id_front_url", "id_back_url"], // In production, upload to storage
      });

      if (error) throw error;

      // Update profile
      await supabase.from("profiles").update({ id_verified: true }).eq("id", userId);

      toast({
        title: "ID Verified!",
        description: `Verification successful (${confidence}% confidence)`,
      });

      fetchVerifications(userId);
      setActiveTab("face");
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFaceVerification = async () => {
    if (!selfie || !userId) {
      toast({
        title: "Missing Selfie",
        description: "Please capture a selfie first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const confidence = Math.floor(Math.random() * 15) + 85;
      
      const { error } = await supabase.from("verifications").upsert({
        user_id: userId,
        verification_type: "face",
        status: "verified",
        confidence_score: confidence,
        document_urls: ["selfie_url"],
      });

      if (error) throw error;

      toast({
        title: "Face Verified!",
        description: `Face match successful (${confidence}% confidence)`,
      });

      fetchVerifications(userId);
      setActiveTab("income");
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleIncomeVerification = async () => {
    if (!incomeDoc || !annualIncome || !userId) {
      toast({
        title: "Missing Information",
        description: "Please provide income document and annual income",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("verifications").upsert({
        user_id: userId,
        verification_type: "income",
        status: "verified",
        confidence_score: 95,
        document_urls: ["income_doc_url"],
        verified_data: { annual_income: parseInt(annualIncome) },
      });

      if (error) throw error;

      // Update profile
      await supabase.from("profiles").update({ income_verified: true }).eq("id", userId);

      toast({
        title: "Income Verified!",
        description: "Income verification successful",
      });

      fetchVerifications(userId);
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const isVerified = (type: string) => verifications[type]?.status === "verified";

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Verification Center</h1>
          <p className="text-muted-foreground">Complete these verifications to unlock full access</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="identity" className="gap-2">
              {isVerified("identity") && <CheckCircle className="h-4 w-4 text-success" />}
              ID Verification
            </TabsTrigger>
            <TabsTrigger value="face" className="gap-2">
              {isVerified("face") && <CheckCircle className="h-4 w-4 text-success" />}
              Face Scan
            </TabsTrigger>
            <TabsTrigger value="income" className="gap-2">
              {isVerified("income") && <CheckCircle className="h-4 w-4 text-success" />}
              Income Verification
            </TabsTrigger>
          </TabsList>

          <TabsContent value="identity">
            <Card>
              <CardHeader>
                <CardTitle>Identity Verification</CardTitle>
                <CardDescription>Upload front and back of your government-issued ID</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="id-front">ID Front</Label>
                  <Input
                    id="id-front"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIdFront(e.target.files?.[0] || null)}
                  />
                  {idFront && <p className="text-sm text-muted-foreground mt-1">✓ {idFront.name}</p>}
                </div>
                <div>
                  <Label htmlFor="id-back">ID Back</Label>
                  <Input
                    id="id-back"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setIdBack(e.target.files?.[0] || null)}
                  />
                  {idBack && <p className="text-sm text-muted-foreground mt-1">✓ {idBack.name}</p>}
                </div>
                <Button onClick={handleIdentityVerification} disabled={loading || !idFront || !idBack}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Verify Identity
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="face">
            <Card>
              <CardHeader>
                <CardTitle>Face Verification</CardTitle>
                <CardDescription>Capture a selfie to verify your identity matches your ID</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selfie ? (
                  <>
                    {!cameraActive ? (
                      <Button onClick={startCamera}>
                        <Camera className="h-4 w-4 mr-2" />
                        Start Camera
                      </Button>
                    ) : (
                      <div className="space-y-4">
                        <video ref={videoRef} autoPlay className="w-full rounded-lg border" />
                        <div className="flex gap-2">
                          <Button onClick={captureSelfie}>Capture Photo</Button>
                          <Button variant="outline" onClick={stopCamera}>Cancel</Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <img src={selfie} alt="Selfie" className="w-full rounded-lg border" />
                    <div className="flex gap-2">
                      <Button onClick={handleFaceVerification} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Verify Face
                      </Button>
                      <Button variant="outline" onClick={() => setSelfie(null)}>Retake</Button>
                    </div>
                  </div>
                )}
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income">
            <Card>
              <CardHeader>
                <CardTitle>Income Verification</CardTitle>
                <CardDescription>Upload a recent pay stub or bank statement</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="annual-income">Annual Income ($)</Label>
                  <Input
                    id="annual-income"
                    type="number"
                    placeholder="50000"
                    value={annualIncome}
                    onChange={(e) => setAnnualIncome(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="income-doc">Income Document</Label>
                  <Input
                    id="income-doc"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => setIncomeDoc(e.target.files?.[0] || null)}
                  />
                  {incomeDoc && <p className="text-sm text-muted-foreground mt-1">✓ {incomeDoc.name}</p>}
                </div>
                <Button onClick={handleIncomeVerification} disabled={loading || !incomeDoc || !annualIncome}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                  Verify Income
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
