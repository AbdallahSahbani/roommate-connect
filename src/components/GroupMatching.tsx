/**
 * Group Matching Component
 * Allows groups to find matching properties using the matching algorithm
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { scorePropertyForGroup } from "@/lib/matching";
import { Search, MapPin, DollarSign, Bed, Users, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

interface Property {
  id: string;
  title: string;
  city: string;
  state: string | null;
  rent_total: number | null;
  rent_amount: number;
  bedrooms: number | null;
  total_bedrooms: number;
  max_occupants: number | null;
  min_household_income: number | null;
  public_code: string | null;
  photos: string[] | null;
}

interface Profile {
  id: string;
  self_reported_monthly_income: number | null;
}

interface Group {
  id: string;
  name: string;
  combined_budget_max: number | null;
  preferred_city: string | null;
  preferred_state: string | null;
}

interface Match {
  property: Property;
  score: number;
}

interface GroupMatchingProps {
  group: Group;
  members: Profile[];
}

export const GroupMatching = ({ group, members }: GroupMatchingProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const findMatches = async () => {
    if (members.length === 0) {
      toast({
        title: "No Group Members",
        description: "Add members to your group before finding matches",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Build query based on group preferences
      let query = supabase
        .from("properties")
        .select("*")
        .eq("is_active", true);

      // Filter by state if specified
      if (group.preferred_state) {
        query = query.eq("state", group.preferred_state);
      }

      // Filter by city if specified
      if (group.preferred_city) {
        query = query.ilike("city", `%${group.preferred_city}%`);
      }

      // Limit to reasonable number of properties
      query = query.limit(50);

      const { data: properties, error } = await query;

      if (error) throw error;

      if (!properties || properties.length === 0) {
        toast({
          title: "No Properties Found",
          description: "Try expanding your search criteria",
        });
        setMatches([]);
        return;
      }

      // Score each property
      const scoredProperties: Match[] = properties
        .map((property) => ({
          property,
          score: scorePropertyForGroup(group, members, property),
        }))
        .filter((match) => match.score > 0) // Remove rejected properties
        .sort((a, b) => b.score - a.score); // Sort by score descending

      setMatches(scoredProperties);

      toast({
        title: "Matches Found!",
        description: `Found ${scoredProperties.length} matching properties`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Find Matching Properties</span>
            <Button onClick={findMatches} disabled={loading}>
              {loading ? (
                <>Searching...</>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Matches
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>Group Size:</strong> {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
            {group.combined_budget_max && (
              <p>
                <strong>Combined Budget:</strong> ${group.combined_budget_max.toLocaleString()}/month
                (${Math.round(group.combined_budget_max / members.length).toLocaleString()}/person)
              </p>
            )}
            {group.preferred_city && (
              <p>
                <strong>Preferred Location:</strong> {group.preferred_city}
                {group.preferred_state && `, ${group.preferred_state}`}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {matches.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {matches.length} Matching {matches.length === 1 ? "Property" : "Properties"}
          </h3>
          <div className="grid gap-4">
            {matches.map(({ property, score }) => (
              <Card key={property.id} className="hover:shadow-hover transition-shadow">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Property Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={property.photos?.[0] || "https://placehold.co/200x150/e5e5e5/666666?text=No+Image"}
                        alt={property.title}
                        className="w-48 h-32 object-cover rounded-lg"
                      />
                    </div>

                    {/* Property Details */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xl font-semibold">{property.title}</h4>
                          {property.public_code && (
                            <p className="text-xs text-muted-foreground">
                              ID: {property.public_code}
                            </p>
                          )}
                        </div>
                        <Badge 
                          variant={score >= 80 ? "default" : score >= 60 ? "secondary" : "outline"}
                          className="flex items-center gap-1"
                        >
                          <TrendingUp className="h-3 w-3" />
                          {score}% Match
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {property.city}{property.state && `, ${property.state}`}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${(property.rent_total || property.rent_amount).toLocaleString()}/mo
                        </div>
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4" />
                          {property.bedrooms || property.total_bedrooms} bed
                        </div>
                        {property.max_occupants && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Max {property.max_occupants}
                          </div>
                        )}
                      </div>

                      <div className="text-sm">
                        <strong>Per Person:</strong> $
                        {Math.round((property.rent_total || property.rent_amount) / members.length).toLocaleString()}
                        /month
                      </div>

                      <Link to={`/property/${property.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {matches.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>No matches yet. Click "Find Matches" to search for properties that fit your group.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
