/**
 * Example property listings for manual entry
 * 
 * These are NOT automatically seeded - they serve as templates/guides
 * for landlords entering real listings from Apartments.com or other sources.
 * 
 * Copy the relevant data into the landlord form at /landlord/listings/new
 */

export const exampleListings = [
  {
    title: "View 34 - Luxury High-Rise Studio",
    street_address: "View 34 Tower",
    city: "New York",
    state: "NY",
    postal_code: "10001",
    rent_total: 3300,
    bedrooms: 0, // Studio
    bathrooms: 1,
    square_feet: 550,
    available_from: "2025-02-01",
    max_occupants: 1,
    description: "Modern studio apartment in luxury high-rise building. Features include floor-to-ceiling windows with city views, stainless steel appliances, in-unit washer/dryer, and access to building amenities including gym, rooftop lounge, and 24/7 concierge.",
    amenities: [
      "Doorman",
      "Gym",
      "Rooftop Access",
      "In-Unit Laundry",
      "Dishwasher",
      "High-Speed Internet",
      "Central AC",
      "Elevator"
    ],
    property_type: "apartment",
    furnished: false,
    pets_allowed: false,
    smoking_allowed: false,
    utilities_included: false,
    parking: "available"
  },
  {
    title: "34 Woodland St - Spacious Townhouse",
    street_address: "34 Woodland St",
    city: "New Haven",
    state: "CT",
    postal_code: "06511",
    rent_total: 3100,
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 1800,
    available_from: "2025-03-01",
    max_occupants: 5,
    description: "Beautiful 3-bedroom townhouse in quiet residential neighborhood. Recently renovated with hardwood floors throughout, updated kitchen with granite counters, private backyard, and off-street parking for 2 vehicles. Walking distance to shops and public transit.",
    amenities: [
      "Hardwood Floors",
      "Updated Kitchen",
      "Backyard",
      "Parking Included",
      "Washer/Dryer Hookup",
      "Basement Storage",
      "Pet Friendly"
    ],
    property_type: "townhouse",
    furnished: false,
    pets_allowed: true,
    smoking_allowed: false,
    utilities_included: false,
    parking: "included"
  },
  {
    title: "Farmington Single Family Home",
    street_address: "123 Main Street", // Update with actual address
    city: "Farmington",
    state: "CT",
    postal_code: "06032",
    rent_total: 5500,
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 3200,
    available_from: "2025-04-01",
    max_occupants: 6,
    description: "Stunning 4-bedroom colonial home in prestigious Farmington location. Features include updated gourmet kitchen with island, formal dining room, family room with fireplace, master suite with walk-in closet, finished basement, 2-car garage, and beautifully landscaped yard. Top-rated school district.",
    amenities: [
      "Fireplace",
      "2-Car Garage",
      "Finished Basement",
      "Central AC",
      "Hardwood Floors",
      "Washer/Dryer Included",
      "Large Yard",
      "Pet Friendly",
      "Dishwasher"
    ],
    property_type: "house",
    furnished: false,
    pets_allowed: true,
    smoking_allowed: false,
    utilities_included: false,
    parking: "included"
  }
];
