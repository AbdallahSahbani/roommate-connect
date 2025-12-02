import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ApplicationFormProps {
  propertyId: string;
  totalSlots: number;
  filledSlots: number;
  userProfile: any;
  userGroups: any[];
}

export const ApplicationForm = ({ 
  propertyId, 
  totalSlots, 
  filledSlots,
  userProfile,
  userGroups 
}: ApplicationFormProps) => {
  const navigate = useNavigate();
  const [moveInDate, setMoveInDate] = useState<Date>();
  const [message, setMessage] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("individual");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isVerified = 
    userProfile?.id_verified && 
    userProfile?.income_verified && 
    userProfile?.background_check_status === 'approved';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isVerified) {
      toast.error("Please complete verification before applying");
      return;
    }

    if (!moveInDate) {
      toast.error("Please select a move-in date");
      return;
    }

    if (message.length > 1000) {
      toast.error("Message must be less than 1000 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create application
      const { data: application, error: appError } = await supabase
        .from("applications")
        .insert({
          property_id: propertyId,
          applicant_id: user.id,
          group_id: selectedGroup !== "individual" ? selectedGroup : null,
          status: "submitted",
          message: message,
          move_in_date: format(moveInDate, "yyyy-MM-dd"),
          meets_income: userProfile.income_verified,
          meets_verification: userProfile.id_verified,
          meets_background: userProfile.background_check_status === 'approved',
          meets_capacity: (filledSlots < totalSlots)
        })
        .select()
        .single();

      if (appError) throw appError;

      // Get property and landlord details for conversation
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
              renter_id: user.id
            })
            .select()
            .single();
          
          conversationId = newConvo?.id;
        }

        // Send system message
        if (conversationId) {
          await supabase
            .from("messages")
            .insert({
              conversation_id: conversationId,
              sender_id: user.id,
              body: `Application submitted for this property.`,
              content: `Application submitted for this property.`
            });
        }
      }

      toast.success("Application submitted successfully! The landlord will review it soon.");
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error("Application error:", error);
      toast.error(error.message || "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVerified) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          To apply for this property you must complete ID and income verification.
          <Button 
            onClick={() => navigate("/verification")}
            variant="outline"
            className="mt-2 w-full"
          >
            Complete Verification
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="moveInDate">Desired Move-In Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
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
          <Label htmlFor="applicationType">Application Type</Label>
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger>
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
        <Label htmlFor="message">Message to Landlord</Label>
        <Textarea
          id="message"
          placeholder="Introduce yourself and explain why you're interested in this property..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={1000}
          rows={4}
        />
        <p className="text-xs text-muted-foreground text-right">
          {message.length} / 1000 characters
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting || !moveInDate}
        style={{ backgroundColor: '#5B1020' }}
      >
        {isSubmitting ? "Submitting..." : "Submit Application"}
      </Button>
    </form>
  );
};
