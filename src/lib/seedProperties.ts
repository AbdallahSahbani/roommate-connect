// Seeding removed - Properties must be added by landlords to comply with RLS policies
// This file is kept for backwards compatibility but does nothing

export async function seedPropertiesIfEmpty() {
  // No-op: Properties should be created by authenticated landlords
  // The previous implementation violated RLS policies
  return;
}