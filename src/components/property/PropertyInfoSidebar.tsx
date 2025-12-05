import { 
  DollarSign, 
  Calendar, 
  Users, 
  ShieldCheck, 
  BadgeCheck, 
  FileCheck,
  AlertCircle,
  Building
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface PropertyInfoSidebarProps {
  rentAmount: number;
  minimumIncomeMultiplier: number | null;
  availableFrom: string | null;
  totalSlots: number | null;
  filledSlots: number | null;
  maxOccupants: number | null;
  requiredIdVerified: boolean | null;
  requiredIncomeVerified: boolean | null;
  requiredBackgroundCheck: boolean | null;
  propertyType: string | null;
}

export const PropertyInfoSidebar = ({
  rentAmount,
  minimumIncomeMultiplier,
  availableFrom,
  totalSlots,
  filledSlots,
  maxOccupants,
  requiredIdVerified,
  requiredIncomeVerified,
  requiredBackgroundCheck,
  propertyType,
}: PropertyInfoSidebarProps) => {
  const estimatedIncome = rentAmount * (minimumIncomeMultiplier || 3);
  const spotsRemaining = totalSlots ? Math.max(0, totalSlots - (filledSlots || 0)) : null;

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Header with Price */}
      <div className="bg-gradient-to-br from-primary to-primary-dark p-6 text-primary-foreground">
        <div className="text-sm opacity-80 mb-1">Monthly Rent</div>
        <div className="text-4xl font-bold tracking-tight">
          ${rentAmount.toLocaleString()}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Key Info Items */}
        <InfoItem
          icon={<DollarSign className="h-5 w-5" />}
          label="Min. Household Income"
          value={`$${estimatedIncome.toLocaleString()}/mo`}
          highlight
        />

        {availableFrom && (
          <InfoItem
            icon={<Calendar className="h-5 w-5" />}
            label="Available From"
            value={new Date(availableFrom).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            })}
          />
        )}

        {propertyType && (
          <InfoItem
            icon={<Building className="h-5 w-5" />}
            label="Property Type"
            value={propertyType.charAt(0).toUpperCase() + propertyType.slice(1)}
          />
        )}

        {maxOccupants && (
          <InfoItem
            icon={<Users className="h-5 w-5" />}
            label="Max Occupants"
            value={`${maxOccupants} people`}
          />
        )}

        {spotsRemaining !== null && (
          <InfoItem
            icon={<Users className="h-5 w-5" />}
            label="Spots Available"
            value={spotsRemaining > 0 ? `${spotsRemaining} remaining` : "Waitlist only"}
            highlight={spotsRemaining === 0}
            variant={spotsRemaining === 0 ? "warning" : "default"}
          />
        )}

        <Separator />

        {/* Verification Requirements */}
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">
            Requirements
          </h4>
          <div className="space-y-3">
            <RequirementItem
              icon={<ShieldCheck className="h-4 w-4" />}
              label="ID Verification"
              required={requiredIdVerified ?? true}
            />
            <RequirementItem
              icon={<FileCheck className="h-4 w-4" />}
              label="Income Verification"
              required={requiredIncomeVerified ?? true}
            />
            <RequirementItem
              icon={<BadgeCheck className="h-4 w-4" />}
              label="Background Check"
              required={requiredBackgroundCheck ?? false}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({
  icon,
  label,
  value,
  highlight = false,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
  variant?: "default" | "warning";
}) => (
  <div className="flex items-start gap-3">
    <div className={`p-2 rounded-lg ${
      variant === "warning" 
        ? "bg-amber-100 text-amber-600" 
        : "bg-primary/10 text-primary"
    }`}>
      {icon}
    </div>
    <div>
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className={`font-semibold ${highlight ? "text-lg" : ""}`}>{value}</div>
    </div>
  </div>
);

const RequirementItem = ({
  icon,
  label,
  required,
}: {
  icon: React.ReactNode;
  label: string;
  required: boolean;
}) => (
  <div className="flex items-center gap-2">
    <div className={`p-1.5 rounded-md ${
      required ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
    }`}>
      {required ? icon : <AlertCircle className="h-4 w-4" />}
    </div>
    <span className={`text-sm ${required ? "text-foreground" : "text-muted-foreground"}`}>
      {label}
    </span>
    <span className={`text-xs ml-auto ${
      required ? "text-success font-medium" : "text-muted-foreground"
    }`}>
      {required ? "Required" : "Optional"}
    </span>
  </div>
);
