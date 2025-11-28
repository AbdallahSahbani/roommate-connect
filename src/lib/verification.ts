import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPEG or PNG image' };
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 10MB' };
  }
  
  return { valid: true };
};

export const uploadVerificationDocument = async (
  userId: string,
  file: File,
  type: 'front' | 'back'
): Promise<{ path?: string; error?: string }> => {
  const timestamp = Date.now();
  const extension = file.name.split('.').pop();
  const filePath = `ids/${userId}/${type}-${timestamp}.${extension}`;
  
  const { data, error } = await supabase.storage
    .from('verification-docs')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });
  
  if (error) {
    return { error: error.message };
  }
  
  return { path: data.path };
};

export const submitIdVerification = async (
  userId: string,
  frontPath: string,
  backPath: string
): Promise<{ error?: string }> => {
  // Create verification record
  const { error: verificationError } = await supabase
    .from('id_verifications')
    .upsert({
      user_id: userId,
      id_front_path: frontPath,
      id_back_path: backPath,
      status: 'submitted',
    }, {
      onConflict: 'user_id'
    });
  
  if (verificationError) {
    return { error: verificationError.message };
  }
  
  // Update profile status
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      id_verification_status: 'submitted',
    })
    .eq('id', userId);
  
  if (profileError) {
    return { error: profileError.message };
  }
  
  return {};
};

export const getVerificationStatus = async (userId: string) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('id_verified, id_verification_status')
    .eq('id', userId)
    .single();
  
  const { data: verification } = await supabase
    .from('id_verifications')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  return {
    profile,
    verification,
  };
};
