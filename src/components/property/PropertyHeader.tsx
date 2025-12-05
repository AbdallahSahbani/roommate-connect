import { MapPin, Bed, Bath, Square, Users, ShieldCheck, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PropertyHeaderProps {
  title: string;
  city: string;
  state: string | null;
  streetAddress: string | null;
  postalCode: string | null;
  publicCode: string | null;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number | null;
  squareFeet: number | null;
  maxOccupants: number | null;
  availableFrom: string | null;
  isVerified: boolean;
}

export const PropertyHeader = ({
  title,
  city,
  state,
  streetAddress,
  postalCode,
  publicCode,
  rentAmount,
  bedrooms,
  bathrooms,
  squareFeet,
  maxOccupants,
  availableFrom,
  isVerified,
}: PropertyHeaderProps) => {
  return (
    <div className="space-y-6">
      {/* Title Row */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            {isVerified && (
              <Badge className="bg-success text-success-foreground gap-1.5 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                Verified Listing
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            <span className="text-base">
              {streetAddress && `${streetAddress}, `}
              {city}{state ? `, ${state}` : ""}
              {postalCode && ` ${postalCode}`}
            </span>
          </div>
          
          {publicCode && (
            <p className="text-sm text-muted-foreground">
              Listing ID: <span className="font-mono">{publicCode}</span>
            </p>
          )}
        </div>

        {/* Price Badge - Desktop */}
        <div className="hidden md:flex flex-col items-end">
          <div className="text-4xl font-bold text-primary">
            ${rentAmount.toLocaleString()}
          </div>
          <span className="text-muted-foreground">per month</span>
        </div>
      </div>

      {/* Mobile Price */}
      <div className="md:hidden bg-card rounded-xl p-4 shadow-card border border-border">
        <div className="text-3xl font-bold text-primary">
          ${rentAmount.toLocaleString()}
        </div>
        <span className="text-muted-foreground">per month</span>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatCard 
          icon={<Bed className="h-5 w-5" />} 
          value={bedrooms} 
          label="Bedrooms" 
        />
        <StatCard 
          icon={<Bath className="h-5 w-5" />} 
          value={bathrooms || 1} 
          label="Bathrooms" 
        />
        {squareFeet && (
          <StatCard 
            icon={<Square className="h-5 w-5" />} 
            value={squareFeet.toLocaleString()} 
            label="Sq. Ft." 
          />
        )}
        {maxOccupants && (
          <StatCard 
            icon={<Users className="h-5 w-5" />} 
            value={maxOccupants} 
            label="Max Occupants" 
          />
        )}
        {availableFrom && (
          <StatCard 
            icon={<Calendar className="h-5 w-5" />} 
            value={new Date(availableFrom).toLocaleDateString("en-US", { month: "short", day: "numeric" })} 
            label="Available" 
          />
        )}
      </div>
    </div>
  );
};

const StatCard = ({ 
  icon, 
  value, 
  label 
}: { 
  icon: React.ReactNode; 
  value: string | number; 
  label: string;
}) => (
  <div className="bg-card rounded-xl p-4 border border-border shadow-card hover:shadow-hover transition-shadow duration-300">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <div className="text-xl font-bold">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
      </div>
    </div>
  </div>
);
