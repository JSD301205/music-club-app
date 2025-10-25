// This file now only exports types. 
// For the Supabase client, import from './supabase-client' instead.
import { Database } from '../types/database.types';

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

// Jam Board types
export interface JamPost {
  id: number;
  author_id: string;
  title: string;
  description: string;
  instruments_needed: string[];
  genres: string[];
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'any';
  location?: string;
  available_times?: string[];
  type: 'looking_for_members' | 'jam_session' | 'collaboration' | 'performance';
  status: 'open' | 'closed' | 'filled';
  responses_count: number;
  created_at: string;
  updated_at: string;
}

export interface JamPostResponse {
  id: number;
  post_id: number;
  user_id: string;
  message?: string;
  created_at: string;
}

export interface JamPostWithAuthor extends JamPost {
  username: string;
  full_name: string;
  avatar_url?: string;
  instruments: string[];
  favorite_genres: string[];
}

export interface JamPostResponseWithUser extends JamPostResponse {
  username: string;
  full_name: string;
  avatar_url?: string;
  instruments: string[];
}