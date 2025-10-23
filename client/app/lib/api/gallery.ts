import { supabase, GalleryItem } from '../supabase';

export async function getGalleryItems(year: number, category?: string) {
  let query = supabase
    .from('gallery_items')
    .select('*')
    .eq('year', year)
    .order('id', { ascending: false }); // Newest items first (highest ID = newest)

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching gallery items:', error);
    throw error;
  }

  return data as GalleryItem[];
}

export async function createGalleryItem(item: Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('gallery_items')
    .insert([item])
    .select()
    .single();

  if (error) {
    console.error('Error creating gallery item:', error);
    throw error;
  }

  return data as GalleryItem;
}

export async function updateGalleryItem(id: number, updates: Partial<GalleryItem>) {
  const { data, error } = await supabase
    .from('gallery_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating gallery item:', error);
    throw error;
  }

  return data as GalleryItem;
}

export async function deleteGalleryItem(id: number) {
  const { error } = await supabase
    .from('gallery_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting gallery item:', error);
    throw error;
  }
}

export async function uploadGalleryImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('gallery-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('gallery-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}