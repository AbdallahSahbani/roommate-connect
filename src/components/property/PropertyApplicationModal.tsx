import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle, Loader2, ShieldCheck, FileCheck, BadgeCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PropertyApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: string;
  totalSlots: number;
  filledSlots: number;
  userProfile: any;
  userGroups: any[];
}

export const PropertyApplicationModal = ({
  open,
  onOpenChange,
  propertyId,
  totalSlots,
  filledSlots,
  userProfile,
  userGroups,
}: PropertyApplicationModalProps) => {
  const navigate = useNavigate();
  const [moveInDate, setMoveInDate] = useState<Date>();
  const [message, setMessage] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("individual");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isIdVerified = userProfile?.id_verified;
  const isIncomeVerified = userProfile?.income_verified;
  const isBackgroundApproved = userProfile?.background_check_status === "approved";
  const isFullyVerified = isIdVerified && isIncomeVerified;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFullyVerified) {
      toast.error("Please complete verification before applying");
      return;
    }

    if (!moveInDate) {
      toast.error("Please select a move-in date");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create application
      const { error: appError } = await supabase
        .from("applications")
        .insert({
          property_id: propertyId,
          applicant_id: user.id,
          status: "pending",
          move_in_date: format(moveInDate, "yyyy-MM-dd"),
          meets_income: isIncomeVerified,
          meets_verification: isIdVerified,
          meets_background: isBackgroundApproved,
          meets_capacity: filledSlots < totalSlots,
        });

      if (appError) throw appError;

      // Get property landlord for conversation
      const { data: property } = await supabase
        .from("properties")
        .select("landlord_id")
        .eq("id", propertyId)
        .single();

      if (property?.landlord_id) {
        // Create or get conversation
        const { data: existingConvo } = await supabase
          .from("conversations")
          .select("id")
          .eq("property_id", propertyId)
          .eq("landlord_id", property.landlord_id)
          .eq("renter_id", user.id)
          .single();

        let conversationId = existingConvo?.id;

        if (!conversationId) {
          const { data: newConvo } = await supabase
            .from("conversations")
            .insert({
              property_id: propertyId,
              landlord_id: property.landlord_id,
              renter_id: user.id,
            })
            .select()
            .single();

          conversationId = newConvo?.id;
        }

        // Send application message
        if (conversationId && message.trim()) {
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            sender_id: user.id,
            body: `Application submitted: ${message.trim()}`,
            content: `Application submitted: ${message.trim()}`,
          });
        }
      }

      toast.success("Application submitted!", {
        description: "Your spot is reserved pending landlord review.",
      });
      onOpenChange(false);
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Application error:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Apply for Property</DialogTitle>
          <DialogDescription>
            Complete your application to reserve your spot.
          </DialogDescription>
        </DialogHeader>

        {/* Verification Status */}
        <div className="bg-muted/50 rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-sm">Your Verification Status</h4>
          <div className="grid grid-cols-3 gap-3">
            <VerificationBadge
              icon={<ShieldCheck className="h-4 w-4" />}
              label="ID"
              verified={isIdVerified}
            />
            <VerificationBadge
              icon={<FileCheck className="h-4 w-4" />}
              label="Income"
              verified={isIncomeVerified}
            />
            <VerificationBadge
              icon={<BadgeCheck className="h-4 w-4" />}
              label="Background"
              verified={isBackgroundApproved}
            />
          </div>
        </div>

        {!isFullyVerified ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Complete ID and income verification to apply.
              <Button
                onClick={() => navigate("/verification")}
                variant="outline"
                className="mt-3 w-full"
              >
                Complete Verification
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label>Desired Move-In Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12",
                      !moveInDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {moveInDate ? format(moveInDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={moveInDate}
                    onSelect={setMoveInDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {userGroups.length > 0 && (
              <div className="space-y-2">
                <Label>Application Type</Label>
                <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select application type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Just me (Individual)</SelectItem>
                    {userGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        As group: {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Message to Landlord (Optional)</Label>
              <Textarea
                placeholder="Introduce yourself and share why you're interested..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={1000}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground text-right">
                {message.length} / 1000
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base bg-primary hover:bg-primary-dark"
              disabled={isSubmitting || !moveInDate}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

const VerificationBadge = ({
  icon,
  label,
  verified,
}: {
  icon: React.ReactNode;
  label: string;
  verified: boolean;
}) => (
  <div
    className={cn(
      "flex flex-col items-center gap-1 p-3 rounded-lg text-center",
      verified ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
    )}
  >
    {icon}
    <span className="text-xs font-medium">{label}</span>
    <span className="text-[10px]">{verified ? "✓ Verified" : "Pending"}</span>
  </div>
);
