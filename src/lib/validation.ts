/**
 * Input validation schemas for Roomates
 * 
 * SECURITY: All user input must be validated before use
 * - Prevents injection attacks
 * - Enforces data integrity
 * - Protects against malicious inputs
 */

import { z } from 'zod';

// Maximum lengths for text fields
const MAX_NAME = 100;
const MAX_TITLE = 200;
const MAX_BIO = 2000;
const MAX_DESCRIPTION = 5000;
const MAX_ADDRESS = 300;
const MAX_CITY = 100;
const MAX_STATE = 50;
const MAX_POSTAL = 20;
const MAX_MESSAGE = 2000;

// Allowed enum values
export const ROLE_VALUES = ['renter', 'landlord', 'both'] as const;
export const PETS_VALUES = ['none', 'cat', 'dog', 'both', 'other'] as const;
export const SMOKING_VALUES = ['no', 'yes', 'outside_only'] as const;
export const SLEEP_SCHEDULE_VALUES = ['early', 'night_owl', 'flexible'] as const;
export const SOCIAL_PREFERENCE_VALUES = ['introverted', 'extroverted', 'ambivert'] as const;
export const GUEST_FREQUENCY_VALUES = ['rarely', 'occasionally', 'often'] as const;
export const PROPERTY_TYPE_VALUES = ['apartment', 'house', 'condo', 'townhouse'] as const;

// Profile validation
export const profileSchema = z.object({
  full_name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(MAX_NAME, `Name must be ${MAX_NAME} characters or less`),
  
  role: z.enum(ROLE_VALUES),
  
  bio: z.string()
    .trim()
    .max(MAX_BIO, `Bio must be ${MAX_BIO} characters or less`)
    .optional()
    .nullable(),
  
  occupation: z.string()
    .trim()
    .max(MAX_NAME, `Occupation must be ${MAX_NAME} characters or less`)
    .optional()
    .nullable(),
  
  budget_min: z.number()
    .int()
    .min(0, 'Budget must be positive')
    .max(1000000, 'Budget is unrealistic')
    .optional()
    .nullable(),
  
  budget_max: z.number()
    .int()
    .min(0, 'Budget must be positive')
    .max(1000000, 'Budget is unrealistic')
    .optional()
    .nullable(),
  
  self_reported_monthly_income: z.number()
    .min(0, 'Income must be positive')
    .max(10000000, 'Income is unrealistic')
    .optional()
    .nullable(),
  
  cleanliness_level: z.number()
    .int()
    .min(1, 'Rating must be 1-5')
    .max(5, 'Rating must be 1-5')
    .optional()
    .nullable(),
  
  noise_tolerance: z.number()
    .int()
    .min(1, 'Rating must be 1-5')
    .max(5, 'Rating must be 1-5')
    .optional()
    .nullable(),
  
  pets: z.enum(PETS_VALUES).optional().nullable(),
  smoking: z.enum(SMOKING_VALUES).optional().nullable(),
  sleep_schedule: z.enum(SLEEP_SCHEDULE_VALUES).optional().nullable(),
  social_preference: z.enum(SOCIAL_PREFERENCE_VALUES).optional().nullable(),
  guest_frequency: z.enum(GUEST_FREQUENCY_VALUES).optional().nullable(),
  
  work_from_home: z.boolean().optional().nullable(),
  is_public_profile: z.boolean().optional().nullable(),
  
  preferred_cities: z.array(z.string().max(MAX_CITY)).optional().nullable(),
});

// Property validation
export const propertySchema = z.object({
  title: z.string()
    .trim()
    .min(1, 'Title is required')
    .max(MAX_TITLE, `Title must be ${MAX_TITLE} characters or less`),
  
  description: z.string()
    .trim()
    .max(MAX_DESCRIPTION, `Description must be ${MAX_DESCRIPTION} characters or less`)
    .optional()
    .nullable(),
  
  property_type: z.enum(PROPERTY_TYPE_VALUES).optional().nullable(),
  
  street_address: z.string()
    .trim()
    .max(MAX_ADDRESS, `Address must be ${MAX_ADDRESS} characters or less`)
    .optional()
    .nullable(),
  
  city: z.string()
    .trim()
    .min(1, 'City is required')
    .max(MAX_CITY, `City must be ${MAX_CITY} characters or less`),
  
  state: z.string()
    .trim()
    .max(MAX_STATE, `State must be ${MAX_STATE} characters or less`)
    .optional()
    .nullable(),
  
  postal_code: z.string()
    .trim()
    .max(MAX_POSTAL, `Postal code must be ${MAX_POSTAL} characters or less`)
    .optional()
    .nullable(),
  
  rent_amount: z.number()
    .int()
    .min(0, 'Rent must be positive')
    .max(1000000, 'Rent is unrealistic'),
  
  rent_total: z.number()
    .min(0, 'Total rent must be positive')
    .max(1000000, 'Rent is unrealistic')
    .optional()
    .nullable(),
  
  security_deposit: z.number()
    .int()
    .min(0, 'Deposit must be positive')
    .max(1000000, 'Deposit is unrealistic')
    .optional()
    .nullable(),
  
  bedrooms: z.number()
    .int()
    .min(0, 'Bedrooms must be 0 or more')
    .max(50, 'Bedrooms is unrealistic')
    .optional()
    .nullable(),
  
  bathrooms: z.number()
    .min(0, 'Bathrooms must be 0 or more')
    .max(50, 'Bathrooms is unrealistic')
    .optional()
    .nullable(),
  
  square_feet: z.number()
    .int()
    .min(0, 'Square feet must be positive')
    .max(1000000, 'Square feet is unrealistic')
    .optional()
    .nullable(),
  
  max_occupants: z.number()
    .int()
    .min(1, 'Must allow at least 1 occupant')
    .max(50, 'Max occupants is unrealistic')
    .optional()
    .nullable(),
  
  min_household_income: z.number()
    .min(0, 'Income requirement must be positive')
    .max(10000000, 'Income requirement is unrealistic')
    .optional()
    .nullable(),
  
  photos: z.array(z.string().url('Photo must be valid URL')).optional().nullable(),
});

// Message validation
export const messageSchema = z.object({
  content: z.string()
    .trim()
    .min(1, 'Message cannot be empty')
    .max(MAX_MESSAGE, `Message must be ${MAX_MESSAGE} characters or less`),
  
  recipient_id: z.string().uuid('Invalid recipient'),
});

// Group validation
export const groupSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Group name is required')
    .max(MAX_NAME, `Name must be ${MAX_NAME} characters or less`),
  
  description: z.string()
    .trim()
    .max(MAX_DESCRIPTION, `Description must be ${MAX_DESCRIPTION} characters or less`)
    .optional()
    .nullable(),
  
  combined_budget_max: z.number()
    .int()
    .min(0, 'Budget must be positive')
    .max(10000000, 'Budget is unrealistic')
    .optional()
    .nullable(),
  
  preferred_city: z.string()
    .trim()
    .max(MAX_CITY, `City must be ${MAX_CITY} characters or less`)
    .optional()
    .nullable(),
  
  preferred_state: z.string()
    .trim()
    .max(MAX_STATE, `State must be ${MAX_STATE} characters or less`)
    .optional()
    .nullable(),
});

// Contact form validation
export const contactSchema = z.object({
  name: z.string()
    .trim()
    .min(1, 'Name is required')
    .max(MAX_NAME, `Name must be ${MAX_NAME} characters or less`),
  
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be 255 characters or less'),
  
  message: z.string()
    .trim()
    .min(1, 'Message is required')
    .max(MAX_MESSAGE, `Message must be ${MAX_MESSAGE} characters or less`),
});

/**
 * Sanitize HTML to prevent XSS attacks
 * NEVER use dangerouslySetInnerHTML with unsanitized user input
 */
export function sanitizeHtml(html: string): string {
  // Strip all HTML tags - conservative approach
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Validate and sanitize URL for external redirects
 */
export function sanitizeUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    // Only allow http and https protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
}
