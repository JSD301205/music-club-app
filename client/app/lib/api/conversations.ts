import { createClient } from '../supabase-client';
import { Database } from '@/app/types/database.types';

const supabase = createClient();

type ConversationRow = Database['public']['Tables']['conversations']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];
type ConversationInsert = Database['public']['Tables']['conversations']['Insert'];
type MessageInsert = Database['public']['Tables']['messages']['Insert'];

export interface Conversation {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  created_at: string;
  other_user: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

/**
 * Get or create a conversation between two users
 */
export async function getOrCreateConversation(user1Id: string, user2Id: string): Promise<string> {
  // Ensure user1_id < user2_id for consistency
  const [smallerId, largerId] = [user1Id, user2Id].sort();

  // Check if conversation exists
  // @ts-ignore - Supabase types
  const { data: existing } = await (supabase
    .from('conversations') as any)
    .select('id')
    .eq('user1_id', smallerId)
    .eq('user2_id', largerId)
    .single();

  if (existing) {
    return existing.id;
  }

  // Create new conversation
  // @ts-ignore - Supabase types
  const { data: newConv, error } = await (supabase
    .from('conversations') as any)
    .insert({
      user1_id: smallerId,
      user2_id: largerId,
    })
    .select('id')
    .single();

  if (error) throw error;
  return newConv.id;
}

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  // @ts-ignore - Supabase types
  const { data, error } = await (supabase
    .from('conversations') as any)
    .select('*')
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error) throw error;

  // Get other user details for each conversation
  const conversations: Conversation[] = [];
  
  for (const conv of (data || []) as any[]) {
    const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id;
    
    // @ts-ignore - Supabase types
    const { data: otherUser } = await (supabase
      .from('profiles') as any)
      .select('id, username, full_name, avatar_url')
      .eq('id', otherUserId)
      .single();

    // Get unread count
    // @ts-ignore - Supabase types
    const { count } = await (supabase
      .from('messages') as any)
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conv.id)
      .eq('receiver_id', userId)
      .eq('is_read', false);

    conversations.push({
      ...conv,
      other_user: otherUser || {
        id: otherUserId,
        username: 'Unknown',
        full_name: 'Unknown User',
      },
      unread_count: count || 0,
    });
  }

  return conversations;
}

/**
 * Get messages in a conversation
 */
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
  // @ts-ignore - Supabase types
  const { data, error} = await (supabase
    .from('messages') as any)
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data || [];
}
/**
 * Send a message
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string
): Promise<Message> {
  // @ts-ignore - Supabase types
  const { data, error } = await (supabase
    .from('messages') as any)
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      receiver_id: receiverId,
      content,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Mark messages as read
 */
export async function markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
  // @ts-ignore - Supabase types
  const { error } = await (supabase
    .from('messages') as any)
    .update({ is_read: true })
    .eq('conversation_id', conversationId)
    .eq('receiver_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

/**
 * Subscribe to new messages in a conversation
 */
export function subscribeToMessages(
  conversationId: string,
  callback: (message: Message) => void
) {
  return supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        callback(payload.new as Message);
      }
    )
    .subscribe();
}

