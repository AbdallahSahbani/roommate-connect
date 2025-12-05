import { CheckCircle, MapPin, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyDescriptionProps {
  description: string | null;
  amenities: string[] | null;
  city: string;
  state: string | null;
  externalListingUrl: string | null;
}

export const PropertyDescription = ({
  description,
  amenities,
  city,
  state,
  externalListingUrl,
}: PropertyDescriptionProps) => {
  return (
    <div className="space-y-8">
      {/* Description */}
      {description && (
        <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
          <h2 className="text-xl font-semibold mb-4">About This Property</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {description}
          </p>
        </section>
      )}

      {/* Amenities */}
      {amenities && amenities.length > 0 && (
        <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
          <h2 className="text-xl font-semibold mb-4">Features & Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {amenities.map((amenity, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <CheckCircle className="h-4 w-4 text-primary" />
                </div>
                <span className="text-sm font-medium">{amenity}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Location */}
      <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
        <h2 className="text-xl font-semibold mb-4">Location</h2>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">
              {city}{state && `, ${state}`}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Explore the neighborhood and nearby amenities
            </p>
            {externalListingUrl && (
              <Button variant="link" className="px-0 mt-2 h-auto" asChild>
                <a 
                  href={externalListingUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary"
                >
                  View original listing
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
