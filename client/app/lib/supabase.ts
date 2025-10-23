import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for database tables
export interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  registration_link?: string;
  category: 'Performances' | 'Open Mics' | 'Competitions' | 'Workshops';
  youtube_url?: string;
  view_bands_link?: string;
  gallery_route?: string;
  year: number;
  status: 'past' | 'upcoming';
  order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: number;
  category: string;
  image: string;
  title: string;
  type: 'image' | 'video';
  video_url?: string;
  event?: string;
  year: number;
  order: number;
  created_at: string;
  updated_at: string;
}