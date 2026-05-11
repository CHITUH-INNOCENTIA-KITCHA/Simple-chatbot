import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Upload avatar image to Supabase Storage
 * @param uri - Local file URI from image picker
 * @param userId - User ID to create unique path
 * @returns Public URL of the uploaded image
 */
export const uploadAvatar = async (uri: string, userId: string): Promise<string> => {
  try {
    // Fetch the file from local URI
    const response = await fetch(uri);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    // Generate file path
    const filePath = `${userId}/avatar.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(filePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true, // Replace if exists
      });

    if (error) {
      throw new Error(`Failed to upload avatar: ${error.message}`);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * Delete avatar for a user
 * @param userId - User ID
 */
export const deleteAvatar = async (userId: string): Promise<void> => {
  try {
    const filePath = `${userId}/avatar.jpg`;

    const { error } = await supabase.storage
      .from('avatars')
      .remove([filePath]);

    if (error) {
      throw new Error(`Failed to delete avatar: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting avatar:', error);
    throw error;
  }
};
