import { Shield, ShieldCheck, ShieldAlert, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TRUST_LEVEL_INFO } from "@/lib/security";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TrustBadgeProps {
  trustLevel: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

/**
 * Display a user's trust level as a badge
 * Use this in profiles, messages, and listings
 */
export const TrustBadge = ({ 
  trustLevel, 
  showLabel = true, 
  size = "md" 
}: TrustBadgeProps) => {
  const info = TRUST_LEVEL_INFO[trustLevel] || TRUST_LEVEL_INFO.unverified;
  
  const iconSize = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-5 w-5" : "h-4 w-4";
  
  const getIcon = () => {
    switch (trustLevel) {
      case 'trusted':
        return <Star className={`${iconSize} fill-current`} />;
      case 'income_verified':
      case 'id_verified':
        return <ShieldCheck className={iconSize} />;
      case 'basic':
        return <Shield className={iconSize} />;
      default:
        return <ShieldAlert className={iconSize} />;
    }
  };

  const getVariant = (): "default" | "secondary" | "outline" | "destructive" => {
    switch (trustLevel) {
      case 'trusted':
        return 'default';
      case 'income_verified':
      case 'id_verified':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getVariant()} className={`gap-1 ${info.color}`}>
            {getIcon()}
            {showLabel && <span>{info.label}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{info.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
