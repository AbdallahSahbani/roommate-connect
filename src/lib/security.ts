/**
 * Security utilities for Roommates
 * 
 * SECURITY: These functions help protect against common attacks
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * Hash a string for storage (not for passwords - use for IP/email obfuscation)
 * Uses a simple but effective hashing approach for rate limiting
 */
export async function hashForStorage(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Log a security event
/**
 * Log a security event
 */
export async function logSecurityEvent(
  eventType: string,
  metadata?: object
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Using any to bypass strict Json type checking
    const insertData: { user_id: string | null; event_type: string; metadata: unknown } = {
      user_id: user?.id ?? null,
      event_type: eventType,
      metadata: metadata ?? null,
    };
    
    await (supabase.from('security_events') as unknown as { insert: (data: unknown[]) => Promise<unknown> }).insert([insertData]);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

/**
 * Known scam phrases to detect in messages
 */
const SCAM_PATTERNS = [
  /western\s*union/i,
  /moneygram/i,
  /send\s*(you\s*)?a?\s*check\s*(for\s*more)?/i,
  /wire\s*transfer/i,
  /cash\s*only/i,
  /bitcoin|crypto\s*currency/i,
  /gift\s*card/i,
  /pay\s*upfront/i,
  /no\s*credit\s*check/i,
  /overseas/i,
  /nigerian?\s*prince/i,
  /lottery\s*winner/i,
  /inheritance/i,
];

/**
 * Check if message contains suspicious content
 */
export function containsSuspiciousContent(message: string): {
  isSuspicious: boolean;
  matches: string[];
} {
  const matches: string[] = [];
  
  for (const pattern of SCAM_PATTERNS) {
    if (pattern.test(message)) {
      const match = message.match(pattern);
      if (match) matches.push(match[0]);
    }
  }
  
  return {
    isSuspicious: matches.length > 0,
    matches,
  };
}

/**
 * Check if message contains external URLs
 */
export function containsExternalUrls(message: string): {
  hasUrls: boolean;
  urls: string[];
} {
  const urlPattern = /https?:\/\/[^\s]+/gi;
  const matches = message.match(urlPattern) ?? [];
  
  return {
    hasUrls: matches.length > 0,
    urls: matches,
  };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Generate a secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Trust level descriptions for UI
 */
export const TRUST_LEVEL_INFO: Record<string, { label: string; description: string; color: string }> = {
  unverified: {
    label: 'Unverified',
    description: 'New account with limited access',
    color: 'text-muted-foreground',
  },
  basic: {
    label: 'Basic',
    description: 'Email verified & profile completed',
    color: 'text-yellow-600',
  },
  id_verified: {
    label: 'ID Verified',
    description: 'Government ID confirmed',
    color: 'text-blue-600',
  },
  income_verified: {
    label: 'Income Verified',
    description: 'Income documentation verified',
    color: 'text-green-600',
  },
  trusted: {
    label: 'Trusted',
    description: 'Fully verified member',
    color: 'text-primary',
  },
};
