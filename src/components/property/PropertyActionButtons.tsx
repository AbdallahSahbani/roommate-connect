import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, Users, MessageSquare, Loader2, HeartOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";

interface PropertyActionButtonsProps {
  propertyId: string;
  isSaved: boolean;
  hasApplied: boolean;
  isFull: boolean;
  isVerified: boolean;
  onSaveToggle: () => Promise<void>;
  onApply: () => void;
  landlordId: string | null;
}

const messageSchema = z.string().min(1, "Message cannot be empty").max(1000, "Message must be less than 1000 characters");

export const PropertyActionButtons = ({
  propertyId,
  isSaved,
  hasApplied,
  isFull,
  isVerified,
  onSaveToggle,
  onApply,
  landlordId,
}: PropertyActionButtonsProps) => {
  const navigate = useNavigate();
  const [savingState, setSavingState] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("Hi, I'm interested in this property. Is it still available?");
  const [sendingInquiry, setSendingInquiry] = useState(false);

  const handleSave = async () => {
    setSavingState(true);
    try {
      await onSaveToggle();
    } finally {
      setSavingState(false);
    }
  };

  const handleJoinGroup = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    if (!isVerified) {
      toast.info("Verification required", {
        description: "Please complete ID and income verification before applying."
      });
      navigate("/verification");
      return;
    }

    onApply();
  };

  const handleInquire = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setShowInquiryModal(true);
  };

  const sendInquiry = async () => {
    const result = messageSchema.safeParse(inquiryMessage.trim());
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    setSendingInquiry(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create inquiry
      await supabase
        .from("property_inquiries")
        .insert({
          property_id: propertyId,
          user_id: user.id,
          message: inquiryMessage.trim(),
        });

      // Also create a message if landlord exists
      if (landlordId) {
        // Get or create conversation
        const { data: existingConvo } = await supabase
          .from("conversations")
          .select("id")
          .eq("property_id", propertyId)
          .eq("landlord_id", landlordId)
          .eq("renter_id", user.id)
          .single();

        let conversationId = existingConvo?.id;

        if (!conversationId) {
          const { data: newConvo } = await supabase
            .from("conversations")
            .insert({
              property_id: propertyId,
              landlord_id: landlordId,
              renter_id: user.id
            })
            .select()
            .single();
          
          conversationId = newConvo?.id;
        }

        if (conversationId) {
          await supabase
            .from("messages")
            .insert({
              conversation_id: conversationId,
              sender_id: user.id,
              body: inquiryMessage.trim(),
              content: inquiryMessage.trim()
            });
        }
      }

      toast.success("Message sent!", {
        description: "The landlord will receive your inquiry shortly."
      });
      setShowInquiryModal(false);
      setInquiryMessage("Hi, I'm interested in this property. Is it still available?");
    } catch (error: any) {
      toast.error("Failed to send message", {
        description: error.message
      });
    } finally {
      setSendingInquiry(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Save Button */}
        <Button
          variant={isSaved ? "default" : "outline"}
          className={`h-14 text-base font-medium transition-all duration-300 ${
            isSaved 
              ? "bg-primary text-primary-foreground hover:bg-primary-dark" 
              : "hover:bg-primary/5 hover:border-primary"
          }`}
          onClick={handleSave}
          disabled={savingState}
        >
          {savingState ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : isSaved ? (
            <HeartOff className="h-5 w-5 mr-2" />
          ) : (
            <Heart className="h-5 w-5 mr-2" />
          )}
          {isSaved ? "Saved" : "Save Property"}
        </Button>

        {/* Join Group / Apply Button */}
        <Button
          className="h-14 text-base font-medium bg-primary hover:bg-primary-dark text-primary-foreground"
          onClick={handleJoinGroup}
          disabled={hasApplied}
        >
          <Users className="h-5 w-5 mr-2" />
          {hasApplied 
            ? "Applied" 
            : isFull 
              ? "Join Waitlist" 
              : "Apply Now"}
        </Button>

        {/* Inquire Button */}
        <Button
          variant="outline"
          className="h-14 text-base font-medium hover:bg-primary/5 hover:border-primary"
          onClick={handleInquire}
        >
          <MessageSquare className="h-5 w-5 mr-2" />
          Contact Landlord
        </Button>
      </div>

      {/* Inquiry Modal */}
      <Dialog open={showInquiryModal} onOpenChange={setShowInquiryModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Contact Landlord</DialogTitle>
            <DialogDescription>
              Send a message to inquire about this property.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Textarea
              value={inquiryMessage}
              onChange={(e) => setInquiryMessage(e.target.value)}
              placeholder="Write your message..."
              rows={5}
              className="resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right mt-2">
              {inquiryMessage.length} / 1000
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInquiryModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={sendInquiry} 
              disabled={sendingInquiry || !inquiryMessage.trim()}
              className="bg-primary hover:bg-primary-dark"
            >
              {sendingInquiry ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
