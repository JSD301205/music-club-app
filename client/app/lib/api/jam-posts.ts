import { createClient } from '../supabase-client';
import type { JamPost, JamPostWithAuthor, JamPostResponse, JamPostResponseWithUser } from '../supabase';

// Re-export types for convenience
export type { JamPost, JamPostWithAuthor, JamPostResponse, JamPostResponseWithUser };

// Get the client
const supabase = createClient();

// ============================================
// JAM POST CRUD OPERATIONS
// ============================================

export interface CreateJamPostData {
  title: string;
  description: string;
  instruments_needed: string[];
  genres: string[];
  skill_level: 'beginner' | 'intermediate' | 'advanced' | 'any';
  location?: string;
  available_times?: string[];
  type: 'looking_for_members' | 'jam_session' | 'collaboration' | 'performance';
}

export interface UpdateJamPostData extends Partial<CreateJamPostData> {
  status?: 'open' | 'closed' | 'filled';
}

export interface JamPostFilters {
  type?: string;
  status?: string;
  instruments?: string[];
  genres?: string[];
  skill_level?: string;
  search?: string;
}

/**
 * Create a new jam post
 */
export async function createJamPost(userId: string, data: CreateJamPostData) {
  // @ts-ignore - Supabase types
  const { data: post, error } = await (supabase
    .from('jam_posts') as any)
    .insert({
      author_id: userId,
      ...data,
    })
    .select()
    .single();

  if (error) throw error;
  return post as JamPost;
}

/**
 * Get all jam posts with filters
 */
export async function getJamPosts(filters?: JamPostFilters): Promise<JamPostWithAuthor[]> {
  // @ts-ignore - Supabase types
  let query = supabase
    .from('jam_posts_with_author')
    .select('*')
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  } else {
    // Default to only showing open posts
    query = query.eq('status', 'open');
  }

  if (filters?.skill_level && filters.skill_level !== 'any') {
    query = query.eq('skill_level', filters.skill_level);
  }

  if (filters?.instruments && filters.instruments.length > 0) {
    query = query.overlaps('instruments_needed', filters.instruments);
  }

  if (filters?.genres && filters.genres.length > 0) {
    query = query.overlaps('genres', filters.genres);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as JamPostWithAuthor[];
}

/**
 * Get a single jam post by ID
 */
export async function getJamPost(postId: number): Promise<JamPostWithAuthor | null> {
  // @ts-ignore - Supabase types
  const { data, error } = await supabase
    .from('jam_posts_with_author')
    .select('*')
    .eq('id', postId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }

  return data as JamPostWithAuthor;
}

/**
 * Get a single jam post by ID with responses
 */
export async function getJamPostById(postId: number): Promise<{
  post: JamPostWithAuthor;
  responses: JamPostResponseWithUser[];
}> {
  const post = await getJamPost(postId);
  if (!post) throw new Error('Post not found');
  
  const responses = await getPostResponses(postId);
  
  return { post, responses };
}

/**
 * Get jam posts by user
 */
export async function getUserJamPosts(userId: string): Promise<JamPostWithAuthor[]> {
  // @ts-ignore - Supabase types
  const { data, error } = await supabase
    .from('jam_posts_with_author')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as JamPostWithAuthor[];
}

/**
 * Update a jam post
 */
export async function updateJamPost(postId: number, userId: string, data: UpdateJamPostData) {
  // @ts-ignore - Supabase types
  const { data: post, error } = await (supabase
    .from('jam_posts') as any)
    .update(data)
    .eq('id', postId)
    .eq('author_id', userId) // Ensure user owns the post
    .select()
    .single();

  if (error) throw error;
  return post as JamPost;
}

/**
 * Delete a jam post
 */
export async function deleteJamPost(postId: number, userId: string) {
  // @ts-ignore - Supabase types
  const { error } = await supabase
    .from('jam_posts')
    .delete()
    .eq('id', postId)
    .eq('author_id', userId); // Ensure user owns the post

  if (error) throw error;
}

// ============================================
// JAM POST RESPONSES
// ============================================

/**
 * Respond to a jam post
 */
export async function respondToJamPost(postId: number, userId: string, message?: string) {
  // @ts-ignore - Supabase types
  const { data, error } = await (supabase
    .from('jam_post_responses') as any)
    .insert({
      post_id: postId,
      user_id: userId,
      message,
    })
    .select()
    .single();

  if (error) throw error;
  return data as JamPostResponse;
}

/**
 * Get responses for a post with user info
 */
export async function getPostResponses(postId: number): Promise<JamPostResponseWithUser[]> {
  // First, get all responses
  // @ts-ignore - Supabase types
  const { data: responses, error: responsesError } = await supabase
    .from('jam_post_responses')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: false });

  if (responsesError) throw responsesError;
  if (!responses || responses.length === 0) return [];

  // Get unique user IDs
  const userIds = Array.from(new Set(responses.map((r: any) => r.user_id)));

  // Fetch user profiles
  // @ts-ignore - Supabase types
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, instruments')
    .in('id', userIds);

  if (profilesError) throw profilesError;

  // Create a map of profiles
  const profileMap = new Map();
  (profiles || []).forEach((profile: any) => {
    profileMap.set(profile.id, profile);
  });

  // Combine responses with profile data
  return responses.map((response: any) => {
    const profile = profileMap.get(response.user_id) || {};
    return {
      id: response.id,
      post_id: response.post_id,
      user_id: response.user_id,
      message: response.message,
      created_at: response.created_at,
      username: profile.username || 'Unknown',
      full_name: profile.full_name || 'Unknown User',
      avatar_url: profile.avatar_url,
      instruments: profile.instruments || [],
    };
  }) as JamPostResponseWithUser[];
}

/**
 * Check if user has responded to a post
 */
export async function hasUserRespondedToPost(postId: number, userId: string): Promise<boolean> {
  // @ts-ignore - Supabase types
  const { data, error } = await supabase
    .from('jam_post_responses')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

/**
 * Delete a response (user can delete their own response)
 */
export async function deleteResponse(responseId: number, userId: string) {
  // @ts-ignore - Supabase types
  const { error } = await supabase
    .from('jam_post_responses')
    .delete()
    .eq('id', responseId)
    .eq('user_id', userId);

  if (error) throw error;
}

/**
 * Get posts user has responded to
 */
export async function getUserResponses(userId: string): Promise<JamPostWithAuthor[]> {
  // @ts-ignore - Supabase types
  const { data, error } = await supabase
    .from('jam_post_responses')
    .select('post_id')
    .eq('user_id', userId);

  if (error) throw error;

  if (!data || data.length === 0) return [];

  const postIds = data.map((r: any) => r.post_id);

  // @ts-ignore - Supabase types
  const { data: posts, error: postsError } = await supabase
    .from('jam_posts_with_author')
    .select('*')
    .in('id', postIds)
    .order('created_at', { ascending: false });

  if (postsError) throw postsError;
  return (posts || []) as JamPostWithAuthor[];
}
