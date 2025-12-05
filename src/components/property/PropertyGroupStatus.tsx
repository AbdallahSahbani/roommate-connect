import { useEffect, useState } from "react";
import { Users, ShieldCheck, DollarSign, BadgeCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface GroupMember {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  id_verified: boolean | null;
  income_verified: boolean | null;
}

interface PropertyGroupStatusProps {
  propertyId: string;
  totalSlots: number;
  filledSlots: number;
}

export const PropertyGroupStatus = ({
  propertyId,
  totalSlots,
  filledSlots,
}: PropertyGroupStatusProps) => {
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  const spotsRemaining = Math.max(0, totalSlots - filledSlots);
  const fillPercentage = totalSlots > 0 ? (filledSlots / totalSlots) * 100 : 0;
  const isFull = spotsRemaining === 0;

  useEffect(() => {
    loadApprovedMembers();
  }, [propertyId]);

  const loadApprovedMembers = async () => {
    try {
      // Get approved applications for this property
      const { data: applications } = await supabase
        .from("applications")
        .select("applicant_id")
        .eq("property_id", propertyId)
        .eq("status", "approved");

      if (applications && applications.length > 0) {
        const applicantIds = applications.map(a => a.applicant_id);
        
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url, id_verified, income_verified")
          .in("id", applicantIds);

        if (profiles) {
          setMembers(profiles);
        }
      }
    } catch (error) {
      console.error("Error loading group members:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (isFull) return "bg-destructive";
    if (fillPercentage >= 75) return "bg-amber-500";
    return "bg-success";
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Group Status
        </h3>
        <Badge className={`${getStatusColor()} text-white`}>
          {isFull ? "Waitlist Only" : `${spotsRemaining} Spots Left`}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Capacity</span>
          <span className="font-medium">{filledSlots} / {totalSlots} filled</span>
        </div>
        <Progress value={fillPercentage} className="h-3" />
      </div>

      {/* Group Members */}
      {loading ? (
        <div className="flex gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-full" />
          ))}
        </div>
      ) : members.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">Current members:</p>
          <div className="flex flex-wrap gap-3">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-2 bg-muted/50 rounded-full pr-3 py-1 pl-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xs">
                    {member.full_name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">
                  {member.full_name?.split(" ")[0] || "Member"}
                </span>
                <div className="flex gap-1">
                  {member.id_verified && (
                    <ShieldCheck className="h-3.5 w-3.5 text-success" />
                  )}
                  {member.income_verified && (
                    <DollarSign className="h-3.5 w-3.5 text-success" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground text-sm">
          <BadgeCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Be the first to join this property!</p>
        </div>
      )}
    </div>
  );
};
