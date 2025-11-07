// Database types for Supabase tables
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      practice_rooms: {
        Row: {
          id: number
          name: string
          description: string | null
          capacity: number
          equipment_available: string[]
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          description?: string | null
          capacity: number
          equipment_available?: string[]
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          description?: string | null
          capacity?: number
          equipment_available?: string[]
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      room_bookings: {
        Row: {
          id: number
          room_id: number
          user_id: string
          booking_date: string
          start_time: string
          end_time: string
          purpose: string | null
          status: 'pending' | 'approved' | 'rejected' | 'cancelled'
          approved_by: string | null
          approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          room_id: number
          user_id: string
          booking_date: string
          start_time: string
          end_time: string
          purpose?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          room_id?: number
          user_id?: string
          booking_date?: string
          start_time?: string
          end_time?: string
          purpose?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'cancelled'
          approved_by?: string | null
          approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      equipment_items: {
        Row: {
          id: number
          name: string
          category: 'instrument' | 'amplifier' | 'microphone' | 'audio-interface' | 'accessory' | 'other'
          description: string | null
          serial_number: string | null
          condition: 'excellent' | 'good' | 'fair' | 'needs-repair'
          image_url: string | null
          total_quantity: number
          available_quantity: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          category: 'instrument' | 'amplifier' | 'microphone' | 'audio-interface' | 'accessory' | 'other'
          description?: string | null
          serial_number?: string | null
          condition?: 'excellent' | 'good' | 'fair' | 'needs-repair'
          image_url?: string | null
          total_quantity?: number
          available_quantity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          category?: 'instrument' | 'amplifier' | 'microphone' | 'audio-interface' | 'accessory' | 'other'
          description?: string | null
          serial_number?: string | null
          condition?: 'excellent' | 'good' | 'fair' | 'needs-repair'
          image_url?: string | null
          total_quantity?: number
          available_quantity?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      equipment_borrowing: {
        Row: {
          id: number
          equipment_id: number
          user_id: string
          quantity: number
          borrowed_date: string
          due_date: string
          return_date: string | null
          purpose: string | null
          status: 'pending' | 'approved' | 'borrowed' | 'returned' | 'overdue' | 'rejected'
          approved_by: string | null
          approved_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          equipment_id: number
          user_id: string
          quantity?: number
          borrowed_date: string
          due_date: string
          return_date?: string | null
          purpose?: string | null
          status?: 'pending' | 'approved' | 'borrowed' | 'returned' | 'overdue' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          equipment_id?: number
          user_id?: string
          quantity?: number
          borrowed_date?: string
          due_date?: string
          return_date?: string | null
          purpose?: string | null
          status?: 'pending' | 'approved' | 'borrowed' | 'returned' | 'overdue' | 'rejected'
          approved_by?: string | null
          approved_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: number
          type: 'quiz' | 'poll' | 'announcement' | 'event'
          title: string
          description: string | null
          is_active: boolean
          priority: number
          start_date: string | null
          end_date: string | null
          created_by: string | null
          created_at: string
          updated_at: string
          metadata: Json
        }
        Insert: {
          id?: number
          type: 'quiz' | 'poll' | 'announcement' | 'event'
          title: string
          description?: string | null
          is_active?: boolean
          priority?: number
          start_date?: string | null
          end_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
        Update: {
          id?: number
          type?: 'quiz' | 'poll' | 'announcement' | 'event'
          title?: string
          description?: string | null
          is_active?: boolean
          priority?: number
          start_date?: string | null
          end_date?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          metadata?: Json
        }
      }
      quiz_questions: {
        Row: {
          id: number
          announcement_id: number
          question: string
          options: Json
          correct_answer: string
          explanation: string | null
          difficulty: 'easy' | 'medium' | 'hard'
          category: string | null
          created_at: string
        }
        Insert: {
          id?: number
          announcement_id: number
          question: string
          options: Json
          correct_answer: string
          explanation?: string | null
          difficulty?: 'easy' | 'medium' | 'hard'
          category?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          announcement_id?: number
          question?: string
          options?: Json
          correct_answer?: string
          explanation?: string | null
          difficulty?: 'easy' | 'medium' | 'hard'
          category?: string | null
          created_at?: string
        }
      }
      quiz_responses: {
        Row: {
          id: number
          question_id: number
          user_id: string
          answer: string
          is_correct: boolean
          responded_at: string
        }
        Insert: {
          id?: number
          question_id: number
          user_id: string
          answer: string
          is_correct: boolean
          responded_at?: string
        }
        Update: {
          id?: number
          question_id?: number
          user_id?: string
          answer?: string
          is_correct?: boolean
          responded_at?: string
        }
      }
      polls: {
        Row: {
          id: number
          announcement_id: number
          question: string
          options: Json
          allow_multiple: boolean
          created_at: string
        }
        Insert: {
          id?: number
          announcement_id: number
          question: string
          options: Json
          allow_multiple?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          announcement_id?: number
          question?: string
          options?: Json
          allow_multiple?: boolean
          created_at?: string
        }
      }
      poll_votes: {
        Row: {
          id: number
          poll_id: number
          user_id: string
          selected_options: Json
          voted_at: string
        }
        Insert: {
          id?: number
          poll_id: number
          user_id: string
          selected_options: Json
          voted_at?: string
        }
        Update: {
          id?: number
          poll_id?: number
          user_id?: string
          selected_options?: Json
          voted_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          email: string | null
          avatar_url: string | null
          bio: string | null
          role: 'admin' | 'member' | 'enthusiast' | 'alumni'
          instruments: Json
          musical_interests: Json
          spotify_playlist: string | null
          batch_year: number | null
          is_profile_complete: boolean
          is_visible_in_community: boolean
          allow_messages_from: 'everyone' | 'members_only' | 'no_one'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'admin' | 'member' | 'enthusiast' | 'alumni'
          instruments?: Json
          musical_interests?: Json
          spotify_playlist?: string | null
          batch_year?: number | null
          is_profile_complete?: boolean
          is_visible_in_community?: boolean
          allow_messages_from?: 'everyone' | 'members_only' | 'no_one'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          email?: string | null
          avatar_url?: string | null
          bio?: string | null
          role?: 'admin' | 'member' | 'enthusiast' | 'alumni'
          instruments?: Json
          musical_interests?: Json
          spotify_playlist?: string | null
          batch_year?: number | null
          is_profile_complete?: boolean
          is_visible_in_community?: boolean
          allow_messages_from?: 'everyone' | 'members_only' | 'no_one'
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user1_id: string
          user2_id: string
          last_message_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user1_id: string
          user2_id: string
          last_message_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user1_id?: string
          user2_id?: string
          last_message_at?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          receiver_id: string
          content: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          is_read?: boolean
          created_at?: string
        }
      }
      message_requests: {
        Row: {
          id: string
          from_user_id: string
          to_user_id: string
          status: 'pending' | 'approved' | 'rejected'
          message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          from_user_id: string
          to_user_id: string
          status?: 'pending' | 'approved' | 'rejected'
          message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          from_user_id?: string
          to_user_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_or_create_conversation: {
        Args: {
          user1: string
          user2: string
        }
        Returns: string
      }
      get_unread_message_count: {
        Args: {
          user_id: string
        }
        Returns: number
      }
      can_message_user: {
        Args: {
          sender_id: string
          recipient_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type PracticeRoom = Database['public']['Tables']['practice_rooms']['Row']
export type RoomBooking = Database['public']['Tables']['room_bookings']['Row']
export type EquipmentItem = Database['public']['Tables']['equipment_items']['Row']
export type EquipmentBorrowing = Database['public']['Tables']['equipment_borrowing']['Row']
export type Announcement = Database['public']['Tables']['announcements']['Row']
export type QuizQuestion = Database['public']['Tables']['quiz_questions']['Row']
export type QuizResponse = Database['public']['Tables']['quiz_responses']['Row']
export type Poll = Database['public']['Tables']['polls']['Row']
export type PollVote = Database['public']['Tables']['poll_votes']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type MessageRequest = Database['public']['Tables']['message_requests']['Row']

export type PracticeRoomInsert = Database['public']['Tables']['practice_rooms']['Insert']
export type RoomBookingInsert = Database['public']['Tables']['room_bookings']['Insert']
export type EquipmentItemInsert = Database['public']['Tables']['equipment_items']['Insert']
export type EquipmentBorrowingInsert = Database['public']['Tables']['equipment_borrowing']['Insert']
export type AnnouncementInsert = Database['public']['Tables']['announcements']['Insert']
export type QuizQuestionInsert = Database['public']['Tables']['quiz_questions']['Insert']
export type QuizResponseInsert = Database['public']['Tables']['quiz_responses']['Insert']
export type PollInsert = Database['public']['Tables']['polls']['Insert']
export type PollVoteInsert = Database['public']['Tables']['poll_votes']['Insert']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageRequestInsert = Database['public']['Tables']['message_requests']['Insert']

export type PracticeRoomUpdate = Database['public']['Tables']['practice_rooms']['Update']
export type RoomBookingUpdate = Database['public']['Tables']['room_bookings']['Update']
export type EquipmentItemUpdate = Database['public']['Tables']['equipment_items']['Update']
export type EquipmentBorrowingUpdate = Database['public']['Tables']['equipment_borrowing']['Update']
export type AnnouncementUpdate = Database['public']['Tables']['announcements']['Update']
export type QuizQuestionUpdate = Database['public']['Tables']['quiz_questions']['Update']
export type QuizResponseUpdate = Database['public']['Tables']['quiz_responses']['Update']
export type PollUpdate = Database['public']['Tables']['polls']['Update']
export type PollVoteUpdate = Database['public']['Tables']['poll_votes']['Update']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type ConversationUpdate = Database['public']['Tables']['conversations']['Update']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']
export type MessageRequestUpdate = Database['public']['Tables']['message_requests']['Update']

// Role type for easy use
export type UserRole = 'admin' | 'member' | 'enthusiast' | 'alumni'
export type MessagePermission = 'everyone' | 'members_only' | 'no_one'
export type AnnouncementType = 'quiz' | 'poll' | 'announcement' | 'event'
export type QuizDifficulty = 'easy' | 'medium' | 'hard'
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'cancelled'
export type BorrowingStatus = 'pending' | 'approved' | 'borrowed' | 'returned' | 'overdue' | 'rejected'
export type EquipmentCategory = 'instrument' | 'amplifier' | 'microphone' | 'audio-interface' | 'accessory' | 'other'
export type EquipmentCondition = 'excellent' | 'good' | 'fair' | 'needs-repair'
