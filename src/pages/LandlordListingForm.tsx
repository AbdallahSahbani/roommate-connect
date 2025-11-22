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

interface PropertyForm {
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  neighborhood: string;
  rent_amount: number;
  security_deposit: number;
  total_bedrooms: number;
  available_rooms: number;
  total_bathrooms: number;
  square_feet: number;
  property_type: string;
  furnished: boolean;
  pets_allowed: boolean;
  smoking_allowed: boolean;
  parking: string;
  utilities_included: boolean;
  lease_term_months_min: number;
  lease_term_months_max: number;
  min_household_income_monthly: number;
  max_occupants: number;
  available_from: string;
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
    address: "",
    city: "",
    state: "",
    zip_code: "",
    neighborhood: "",
    rent_amount: 0,
    security_deposit: 0,
    total_bedrooms: 1,
    available_rooms: 1,
    total_bathrooms: 1,
    square_feet: 0,
    property_type: "apartment",
    furnished: false,
    pets_allowed: false,
    smoking_allowed: false,
    parking: "none",
    utilities_included: false,
    lease_term_months_min: 12,
    lease_term_months_max: 12,
    min_household_income_monthly: 0,
    max_occupants: 2,
    available_from: "",
    photos: [],
  });

  useEffect(() => {
    if (id) {
      loadProperty();
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
          ...data,
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
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const propertyData = {
        ...form,
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
        const { error } = await supabase
          .from("properties")
          .insert([propertyData]);

        if (error) throw error;

        toast({
          title: "Property created",
          description: "Your listing has been created successfully",
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
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
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
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={form.state || ""}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip_code">Zip Code</Label>
                  <Input
                    id="zip_code"
                    value={form.zip_code || ""}
                    onChange={(e) => setForm({ ...form, zip_code: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Neighborhood</Label>
                  <Input
                    id="neighborhood"
                    value={form.neighborhood || ""}
                    onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rent_amount">Monthly Rent ($) *</Label>
                  <Input
                    id="rent_amount"
                    type="number"
                    value={form.rent_amount}
                    onChange={(e) => setForm({ ...form, rent_amount: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="security_deposit">Security Deposit ($)</Label>
                  <Input
                    id="security_deposit"
                    type="number"
                    value={form.security_deposit || 0}
                    onChange={(e) => setForm({ ...form, security_deposit: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="total_bedrooms">Bedrooms *</Label>
                  <Input
                    id="total_bedrooms"
                    type="number"
                    value={form.total_bedrooms}
                    onChange={(e) => setForm({ ...form, total_bedrooms: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="available_rooms">Available Rooms *</Label>
                  <Input
                    id="available_rooms"
                    type="number"
                    value={form.available_rooms}
                    onChange={(e) => setForm({ ...form, available_rooms: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="total_bathrooms">Bathrooms *</Label>
                  <Input
                    id="total_bathrooms"
                    type="number"
                    step="0.5"
                    value={form.total_bathrooms}
                    onChange={(e) => setForm({ ...form, total_bathrooms: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="square_feet">Square Feet</Label>
                  <Input
                    id="square_feet"
                    type="number"
                    value={form.square_feet || 0}
                    onChange={(e) => setForm({ ...form, square_feet: Number(e.target.value) })}
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label htmlFor="max_occupants">Max Occupants</Label>
                  <Input
                    id="max_occupants"
                    type="number"
                    value={form.max_occupants || 2}
                    onChange={(e) => setForm({ ...form, max_occupants: Number(e.target.value) })}
                  />
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
              <CardTitle>Lease Terms & Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lease_term_months_min">Min Lease (months)</Label>
                  <Input
                    id="lease_term_months_min"
                    type="number"
                    value={form.lease_term_months_min || 12}
                    onChange={(e) => setForm({ ...form, lease_term_months_min: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="lease_term_months_max">Max Lease (months)</Label>
                  <Input
                    id="lease_term_months_max"
                    type="number"
                    value={form.lease_term_months_max || 12}
                    onChange={(e) => setForm({ ...form, lease_term_months_max: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="min_household_income_monthly">Min Monthly Household Income ($)</Label>
                <Input
                  id="min_household_income_monthly"
                  type="number"
                  value={form.min_household_income_monthly || 0}
                  onChange={(e) => setForm({ ...form, min_household_income_monthly: Number(e.target.value) })}
                  placeholder="e.g., 3x rent"
                />
              </div>

              <div>
                <Label htmlFor="available_from">Available From</Label>
                <Input
                  id="available_from"
                  type="date"
                  value={form.available_from || ""}
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