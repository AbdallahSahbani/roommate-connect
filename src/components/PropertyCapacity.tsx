import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface PropertyCapacityProps {
  totalSlots: number;
  filledSlots: number;
  variant?: "badge" | "full";
}

export const PropertyCapacity = ({ totalSlots, filledSlots, variant = "badge" }: PropertyCapacityProps) => {
  if (totalSlots === 0) return null;
  
  const remaining = totalSlots - filledSlots;
  const percentage = (filledSlots / totalSlots) * 100;
  
  const getColorClass = () => {
    if (percentage >= 90) return "bg-destructive text-destructive-foreground";
    if (percentage >= 50) return "bg-amber-500 text-white";
    return "bg-green-600 text-white";
  };

  if (variant === "badge") {
    return (
      <Badge className={`${getColorClass()} font-medium`}>
        {percentage >= 100 ? "Waitlist only" : `${remaining} spot${remaining !== 1 ? 's' : ''} left`}
      </Badge>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="font-medium">Capacity</span>
        <span className="text-muted-foreground">
          {filledSlots} / {totalSlots} filled
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
      {percentage >= 100 ? (
        <p className="text-sm text-destructive font-medium">All spots reserved - Waitlist available</p>
      ) : (
        <p className="text-sm text-muted-foreground">{remaining} spot{remaining !== 1 ? 's' : ''} remaining</p>
      )}
    </div>
  );
};
