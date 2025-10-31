import { createClient } from '../supabase-client';
import { Event } from '../supabase';

export async function getEvents(year: number, status?: 'past' | 'upcoming') {
  const supabase = createClient();
  let query = supabase
    .from('events')
    .select('*')
    .eq('year', year)
    .order('id', { ascending: false }); // Newest events first (highest ID = newest)

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching events:', error);
    throw error;
  }

  return data as Event[];
}

export async function createEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>) {
  const supabase = createClient();
  const { data, error } = await (supabase
    .from('events') as any)
    .insert([event])
    .select()
    .single();

  if (error) {
    console.error('Error creating event:', error);
    throw error;
  }

  return data as Event;
}

export async function updateEvent(id: number, updates: Partial<Event>) {
  const supabase = createClient();
  const { data, error } = await (supabase
    .from('events') as any)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating event:', error);
    throw error;
  }

  return data as Event;
}

export async function deleteEvent(id: number) {
  const supabase = createClient();
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

export async function uploadEventImage(file: File): Promise<string> {
  const supabase = createClient();
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('event-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('event-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}