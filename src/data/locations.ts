export type CityOption = {
  city: string;
  stateCode: string;
  stateName: string;
  country: "United States" | "Canada";
};

export const US_STATES = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export const CANADIAN_PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

export const CITY_OPTIONS: CityOption[] = [
  // Major US Cities
  { city: "New York", stateCode: "NY", stateName: "New York", country: "United States" },
  { city: "Los Angeles", stateCode: "CA", stateName: "California", country: "United States" },
  { city: "Chicago", stateCode: "IL", stateName: "Illinois", country: "United States" },
  { city: "Houston", stateCode: "TX", stateName: "Texas", country: "United States" },
  { city: "Phoenix", stateCode: "AZ", stateName: "Arizona", country: "United States" },
  { city: "Philadelphia", stateCode: "PA", stateName: "Pennsylvania", country: "United States" },
  { city: "San Antonio", stateCode: "TX", stateName: "Texas", country: "United States" },
  { city: "San Diego", stateCode: "CA", stateName: "California", country: "United States" },
  { city: "Dallas", stateCode: "TX", stateName: "Texas", country: "United States" },
  { city: "San Jose", stateCode: "CA", stateName: "California", country: "United States" },
  { city: "Austin", stateCode: "TX", stateName: "Texas", country: "United States" },
  { city: "Jacksonville", stateCode: "FL", stateName: "Florida", country: "United States" },
  { city: "Fort Worth", stateCode: "TX", stateName: "Texas", country: "United States" },
  { city: "Columbus", stateCode: "OH", stateName: "Ohio", country: "United States" },
  { city: "Charlotte", stateCode: "NC", stateName: "North Carolina", country: "United States" },
  { city: "San Francisco", stateCode: "CA", stateName: "California", country: "United States" },
  { city: "Indianapolis", stateCode: "IN", stateName: "Indiana", country: "United States" },
  { city: "Seattle", stateCode: "WA", stateName: "Washington", country: "United States" },
  { city: "Denver", stateCode: "CO", stateName: "Colorado", country: "United States" },
  { city: "Washington", stateCode: "DC", stateName: "District of Columbia", country: "United States" },
  { city: "Boston", stateCode: "MA", stateName: "Massachusetts", country: "United States" },
  { city: "El Paso", stateCode: "TX", stateName: "Texas", country: "United States" },
  { city: "Nashville", stateCode: "TN", stateName: "Tennessee", country: "United States" },
  { city: "Detroit", stateCode: "MI", stateName: "Michigan", country: "United States" },
  { city: "Oklahoma City", stateCode: "OK", stateName: "Oklahoma", country: "United States" },
  { city: "Portland", stateCode: "OR", stateName: "Oregon", country: "United States" },
  { city: "Las Vegas", stateCode: "NV", stateName: "Nevada", country: "United States" },
  { city: "Memphis", stateCode: "TN", stateName: "Tennessee", country: "United States" },
  { city: "Louisville", stateCode: "KY", stateName: "Kentucky", country: "United States" },
  { city: "Baltimore", stateCode: "MD", stateName: "Maryland", country: "United States" },
  { city: "Milwaukee", stateCode: "WI", stateName: "Wisconsin", country: "United States" },
  { city: "Albuquerque", stateCode: "NM", stateName: "New Mexico", country: "United States" },
  { city: "Tucson", stateCode: "AZ", stateName: "Arizona", country: "United States" },
  { city: "Fresno", stateCode: "CA", stateName: "California", country: "United States" },
  { city: "Mesa", stateCode: "AZ", stateName: "Arizona", country: "United States" },
  { city: "Sacramento", stateCode: "CA", stateName: "California", country: "United States" },
  { city: "Atlanta", stateCode: "GA", stateName: "Georgia", country: "United States" },
  { city: "Kansas City", stateCode: "MO", stateName: "Missouri", country: "United States" },
  { city: "Colorado Springs", stateCode: "CO", stateName: "Colorado", country: "United States" },
  { city: "Raleigh", stateCode: "NC", stateName: "North Carolina", country: "United States" },
  { city: "Omaha", stateCode: "NE", stateName: "Nebraska", country: "United States" },
  { city: "Miami", stateCode: "FL", stateName: "Florida", country: "United States" },
  { city: "Long Beach", stateCode: "CA", stateName: "California", country: "United States" },
  { city: "Virginia Beach", stateCode: "VA", stateName: "Virginia", country: "United States" },
  { city: "Oakland", stateCode: "CA", stateName: "California", country: "United States" },
  { city: "Minneapolis", stateCode: "MN", stateName: "Minnesota", country: "United States" },
  { city: "Tulsa", stateCode: "OK", stateName: "Oklahoma", country: "United States" },
  { city: "Tampa", stateCode: "FL", stateName: "Florida", country: "United States" },
  { city: "Arlington", stateCode: "TX", stateName: "Texas", country: "United States" },
  { city: "New Orleans", stateCode: "LA", stateName: "Louisiana", country: "United States" },
  
  // Connecticut Cities
  { city: "Bridgeport", stateCode: "CT", stateName: "Connecticut", country: "United States" },
  { city: "New Haven", stateCode: "CT", stateName: "Connecticut", country: "United States" },
  { city: "Stamford", stateCode: "CT", stateName: "Connecticut", country: "United States" },
  { city: "Hartford", stateCode: "CT", stateName: "Connecticut", country: "United States" },
  { city: "Waterbury", stateCode: "CT", stateName: "Connecticut", country: "United States" },
  { city: "Norwalk", stateCode: "CT", stateName: "Connecticut", country: "United States" },
  { city: "Danbury", stateCode: "CT", stateName: "Connecticut", country: "United States" },
  { city: "New Britain", stateCode: "CT", stateName: "Connecticut", country: "United States" },
  { city: "Bristol", stateCode: "CT", stateName: "Connecticut", country: "United States" },
  { city: "Meriden", stateCode: "CT", stateName: "Connecticut", country: "United States" },
  
  // Major Canadian Cities
  { city: "Toronto", stateCode: "ON", stateName: "Ontario", country: "Canada" },
  { city: "Montreal", stateCode: "QC", stateName: "Quebec", country: "Canada" },
  { city: "Vancouver", stateCode: "BC", stateName: "British Columbia", country: "Canada" },
  { city: "Calgary", stateCode: "AB", stateName: "Alberta", country: "Canada" },
  { city: "Edmonton", stateCode: "AB", stateName: "Alberta", country: "Canada" },
  { city: "Ottawa", stateCode: "ON", stateName: "Ontario", country: "Canada" },
  { city: "Winnipeg", stateCode: "MB", stateName: "Manitoba", country: "Canada" },
  { city: "Quebec City", stateCode: "QC", stateName: "Quebec", country: "Canada" },
  { city: "Hamilton", stateCode: "ON", stateName: "Ontario", country: "Canada" },
  { city: "Kitchener", stateCode: "ON", stateName: "Ontario", country: "Canada" },
  { city: "London", stateCode: "ON", stateName: "Ontario", country: "Canada" },
  { city: "Victoria", stateCode: "BC", stateName: "British Columbia", country: "Canada" },
  { city: "Halifax", stateCode: "NS", stateName: "Nova Scotia", country: "Canada" },
  { city: "Oshawa", stateCode: "ON", stateName: "Ontario", country: "Canada" },
  { city: "Windsor", stateCode: "ON", stateName: "Ontario", country: "Canada" },
];

export function searchCities(query: string): CityOption[] {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase().trim();
  
  return CITY_OPTIONS.filter(city => {
    const cityName = city.city.toLowerCase();
    const stateName = city.stateName.toLowerCase();
    const stateCode = city.stateCode.toLowerCase();
    
    return (
      cityName.includes(searchTerm) ||
      stateName.includes(searchTerm) ||
      stateCode.includes(searchTerm) ||
      `${cityName} ${stateCode}`.includes(searchTerm) ||
      `${cityName} ${stateName}`.includes(searchTerm)
    );
  }).slice(0, 10); // Limit to top 10 results
}

export function formatCityDisplay(city: CityOption): string {
  return `${city.city}, ${city.stateCode}, ${city.country}`;
}
