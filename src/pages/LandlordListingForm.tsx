import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generatePublicCode } from "@/lib/generatePublicCode";
import { propertySchema } from "@/lib/validation";

interface PropertyForm {
  title: string;
  description: string;
  street_address: string;
  city: string;
  state: string;
  postal_code: string;
  rent_total: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  min_household_income: number;
  max_occupants: number;
  available_from: string;
  property_type: string;
  furnished: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  utilities_included: boolean;
  parking: string;
  photos: string[];
}

const LandlordListingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState("");
  
  const [form, setForm] = useState<PropertyForm>({
    title: "",
    description: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    rent_total: 0,
    bedrooms: 1,
    bathrooms: 1,
    square_feet: 0,
    min_household_income: 0,
    max_occupants: 2,
    available_from: "",
    property_type: "apartment",
    furnished: false,
    pets_allowed: false,
    smoking_allowed: false,
    utilities_included: false,
    parking: "none",
    photos: [],
  });

  useEffect(() => {
    if (id) {
      loadProperty();
    } else {
      // Check for draft listing from AI assistant
      const draft = sessionStorage.getItem("draftListing");
      if (draft) {
        try {
          const draftData = JSON.parse(draft);
          setForm({
            title: draftData.title || "",
            description: draftData.description || "",
            street_address: draftData.address?.split(',')[0] || "",
            city: draftData.city || "",
            state: draftData.state || "",
            postal_code: draftData.postal_code || "",
            rent_total: Number(draftData.rent) || 0,
            bedrooms: Number(draftData.bedrooms) || 1,
            bathrooms: Number(draftData.bathrooms) || 1,
            square_feet: Number(draftData.sqft) || 0,
            min_household_income: Number(draftData.screening_requirements?.min_income) || 0,
            max_occupants: Number(draftData.max_occupants) || 2,
            available_from: draftData.availability_date || "",
            property_type: draftData.property_type || "apartment",
            furnished: draftData.furnished || false,
            pets_allowed: draftData.pet_policy?.allowed || false,
            smoking_allowed: draftData.smoking_allowed || false,
            utilities_included: Array.isArray(draftData.utilities_included) && draftData.utilities_included.length > 0,
            parking: draftData.parking?.type || "none",
            photos: Array.isArray(draftData.photos) ? draftData.photos : [],
          });
          sessionStorage.removeItem("draftListing");
          toast({
            title: "Draft loaded",
            description: "AI assistant draft has been loaded. Review and save when ready.",
          });
        } catch (e) {
          console.error("Failed to load draft:", e);
        }
      }
    }
  }, [id]);

  const loadProperty = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (data) {
        setForm({
          title: data.title || "",
          description: data.description || "",
          street_address: data.street_address || "",
          city: data.city || "",
          state: data.state || "",
          postal_code: data.postal_code || "",
          rent_total: data.rent_total || 0,
          bedrooms: data.bedrooms || 1,
          bathrooms: data.total_bathrooms || 1,
          square_feet: data.square_feet || 0,
          min_household_income: data.min_household_income || 0,
          max_occupants: data.max_occupants || 2,
          available_from: data.available_from || "",
          property_type: data.property_type || "apartment",
          furnished: data.furnished || false,
          pets_allowed: data.pets_allowed || false,
          smoking_allowed: data.smoking_allowed || false,
          utilities_included: data.utilities_included || false,
          parking: data.parking || "none",
          photos: data.photos || [],
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading property",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form
      const validation = propertySchema.safeParse({
        title: form.title,
        city: form.city,
        rent_amount: form.rent_total,
        rent_total: form.rent_total,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        square_feet: form.square_feet,
        street_address: form.street_address,
        state: form.state,
        postal_code: form.postal_code,
        description: form.description,
        min_household_income: form.min_household_income,
        max_occupants: form.max_occupants,
        photos: form.photos,
      });
      if (!validation.success) {
        toast({
          title: "Validation error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Calculate default min_household_income if not set (3x rent)
      const minIncome = form.min_household_income || form.rent_total * 3;

      const propertyData: any = {
        title: form.title,
        description: form.description,
        street_address: form.street_address,
        address: `${form.street_address}, ${form.city}, ${form.state} ${form.postal_code}`,
        city: form.city,
        state: form.state,
        postal_code: form.postal_code,
        rent_total: form.rent_total,
        rent_amount: form.rent_total,
        bedrooms: form.bedrooms,
        total_bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        total_bathrooms: form.bathrooms,
        square_feet: form.square_feet,
        min_household_income: minIncome,
        min_household_income_monthly: minIncome,
        max_occupants: form.max_occupants || form.bedrooms + 1,
        available_rooms: form.bedrooms,
        available_from: form.available_from || null,
        property_type: form.property_type,
        furnished: form.furnished,
        pets_allowed: form.pets_allowed,
        smoking_allowed: form.smoking_allowed,
        utilities_included: form.utilities_included,
        parking: form.parking,
        photos: form.photos,
        landlord_id: session.user.id,
        is_active: true,
        status: "active",
      };

      if (id) {
        const { error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Property updated",
          description: "Your listing has been updated successfully",
        });
      } else {
        // Generate public_code for new property
        const publicCode = await generatePublicCode(form.state);
        propertyData.public_code = publicCode;

        const { error } = await supabase
          .from("properties")
          .insert([propertyData]);

        if (error) throw error;

        toast({
          title: "Property created",
          description: `Your listing has been created successfully (${publicCode})`,
        });
      }

      navigate("/landlord/listings");
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

  const addPhoto = () => {
    if (photoUrl.trim()) {
      setForm({ ...form, photos: [...form.photos, photoUrl.trim()] });
      setPhotoUrl("");
    }
  };

  const removePhoto = (index: number) => {
    setForm({ ...form, photos: form.photos.filter((_, i) => i !== index) });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            {id ? "Edit Listing" : "Create New Listing"}
          </h1>
          <p className="text-muted-foreground mt-2">Fill in the details of your property</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  maxLength={2000}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Location</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street_address">Street Address *</Label>
                <Input
                  id="street_address"
                  value={form.street_address}
                  onChange={(e) => setForm({ ...form, street_address: e.target.value })}
                  maxLength={200}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    maxLength={100}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State (2 letters) *</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value.toUpperCase() })}
                    maxLength={2}
                    placeholder="NY"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="postal_code">Postal Code</Label>
                <Input
                  id="postal_code"
                  value={form.postal_code}
                  onChange={(e) => setForm({ ...form, postal_code: e.target.value })}
                  maxLength={10}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="rent_total">Total Monthly Rent ($) *</Label>
                <Input
                  id="rent_total"
                  type="number"
                  min="0"
                  max="999999"
                  value={form.rent_total}
                  onChange={(e) => setForm({ ...form, rent_total: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms *</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    max="20"
                    value={form.bedrooms}
                    onChange={(e) => setForm({ ...form, bedrooms: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms *</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    max="20"
                    step="0.5"
                    value={form.bathrooms}
                    onChange={(e) => setForm({ ...form, bathrooms: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="square_feet">Square Feet</Label>
                  <Input
                    id="square_feet"
                    type="number"
                    min="0"
                    max="99999"
                    value={form.square_feet}
                    onChange={(e) => setForm({ ...form, square_feet: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="property_type">Property Type</Label>
                  <Select
                    value={form.property_type}
                    onValueChange={(value) => setForm({ ...form, property_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apartment">Apartment</SelectItem>
                      <SelectItem value="house">House</SelectItem>
                      <SelectItem value="room">Room</SelectItem>
                      <SelectItem value="studio">Studio</SelectItem>
                      <SelectItem value="duplex">Duplex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="parking">Parking</Label>
                  <Select
                    value={form.parking}
                    onValueChange={(value) => setForm({ ...form, parking: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="street">Street</SelectItem>
                      <SelectItem value="garage">Garage</SelectItem>
                      <SelectItem value="off-street">Off-street</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="furnished"
                    checked={form.furnished}
                    onCheckedChange={(checked) => setForm({ ...form, furnished: checked as boolean })}
                  />
                  <Label htmlFor="furnished">Furnished</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pets_allowed"
                    checked={form.pets_allowed}
                    onCheckedChange={(checked) => setForm({ ...form, pets_allowed: checked as boolean })}
                  />
                  <Label htmlFor="pets_allowed">Pets Allowed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smoking_allowed"
                    checked={form.smoking_allowed}
                    onCheckedChange={(checked) => setForm({ ...form, smoking_allowed: checked as boolean })}
                  />
                  <Label htmlFor="smoking_allowed">Smoking Allowed</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="utilities_included"
                    checked={form.utilities_included}
                    onCheckedChange={(checked) => setForm({ ...form, utilities_included: checked as boolean })}
                  />
                  <Label htmlFor="utilities_included">Utilities Included</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="min_household_income">Min Monthly Household Income ($)</Label>
                <Input
                  id="min_household_income"
                  type="number"
                  min="0"
                  max="9999999"
                  value={form.min_household_income}
                  onChange={(e) => setForm({ ...form, min_household_income: Number(e.target.value) })}
                  placeholder={`Default: ${form.rent_total * 3} (3x rent)`}
                />
                <p className="text-xs text-muted-foreground mt-1">Leave blank to default to 3x rent</p>
              </div>

              <div>
                <Label htmlFor="max_occupants">Max Occupants</Label>
                <Input
                  id="max_occupants"
                  type="number"
                  min="1"
                  max="20"
                  value={form.max_occupants}
                  onChange={(e) => setForm({ ...form, max_occupants: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="available_from">Available From</Label>
                <Input
                  id="available_from"
                  type="date"
                  value={form.available_from}
                  onChange={(e) => setForm({ ...form, available_from: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Photos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter photo URL"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
                <Button type="button" onClick={addPhoto}>Add Photo</Button>
              </div>
              {form.photos.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {form.photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img src={photo} alt={`Property ${index + 1}`} className="w-full h-32 object-cover rounded" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => removePhoto(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : id ? "Update Listing" : "Create Listing"}
            </Button>
            <Button type="button" variant="outline" onClick={() => navigate("/landlord/listings")}>
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default LandlordListingForm;
