'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '../lib/supabase-client'
import { Message, Conversation, Profile } from '../types/database.types'
import { RealtimeChannel } from '@supabase/supabase-js'

type ConversationWithProfile = Conversation & {
  otherUser: Profile
  unreadCount: number
}

type MessageWithSender = Message & {
  sender: Profile
}

export function useConversations(userId: string | undefined) {
  const [conversations, setConversations] = useState<ConversationWithProfile[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchConversations = useCallback(async () => {
    if (!userId) {
      setConversations([])
      setLoading(false)
      return
    }

    try {
      // @ts-ignore - Supabase types
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
        .order('last_message_at', { ascending: false })

      if (error) throw error

      // Fetch profiles for other users in conversations
      const conversationsWithProfiles = await Promise.all(
        (data || []).map(async (conv: any) => {
          const otherUserId = conv.user1_id === userId ? conv.user2_id : conv.user1_id
          
          // @ts-ignore - Supabase types
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .single()

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('receiver_id', userId)
            .eq('is_read', false)

          return {
            ...conv,
            otherUser: profile!,
            unreadCount: count || 0,
          }
        })
      )

      setConversations(conversationsWithProfiles)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchConversations()

    // Subscribe to message changes to update unread counts
    if (!userId) return

    const channel = supabase
      .channel(`conversations-updates-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        () => {
          // Refetch conversations when new messages arrive
          fetchConversations()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`, // Only listen to updates for messages we receive
        },
        () => {
          // Refetch conversations when messages are marked as read
          fetchConversations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchConversations, userId])

  return { conversations, loading, refetch: fetchConversations }
}

export function useMessages(conversationId: string | undefined) {
  const [messages, setMessages] = useState<MessageWithSender[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchMessages = useCallback(async () => {
    if (!conversationId) {
      setMessages([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(*)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error

      setMessages(data as unknown as MessageWithSender[])
    } catch (error) {
      console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    fetchMessages()

    // Subscribe to new messages in this conversation
    if (!conversationId) return

    // console.log('Setting up realtime subscription for conversation:', conversationId)

    const channel: RealtimeChannel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          // console.log('✅ New message received via realtime:', payload)
          
          // Fetch sender profile
          const { data: sender } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', payload.new.sender_id)
            .single()

          const newMessage = {
            ...payload.new,
            sender,
          } as unknown as MessageWithSender

          // console.log('Adding message to state:', newMessage)

          setMessages((current) => {
            // Prevent duplicates
            if (current.some(msg => msg.id === newMessage.id)) {
              // console.log('Message already exists, skipping duplicate')
              return current
            }
            // console.log('Adding new message to list')
            return [...current, newMessage]
          })
        }
      )
      .subscribe((status) => {
        // console.log('📡 Realtime subscription status:', status)
        if (status === 'SUBSCRIBED') {
          // console.log('✅ Successfully subscribed to realtime updates')
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error subscribing to realtime channel')
        } else if (status === 'TIMED_OUT') {
          console.error('⏱️ Realtime subscription timed out')
        }
      })

    return () => {
      // console.log('Cleaning up realtime subscription')
      supabase.removeChannel(channel)
    }
  }, [conversationId, supabase])

  const sendMessage = async (content: string, senderId: string, receiverId: string) => {
    if (!conversationId) return

    try {
      // console.log('Sending message...', { conversationId, senderId, receiverId })
      
      // @ts-ignore - Supabase types
      const { data, error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: senderId,
        receiver_id: receiverId,
        content,
      }).select('*, sender:profiles!sender_id(*)').single()

      if (error) {
        console.error('Error from Supabase:', error)
        throw error
      }

      // console.log('Message sent successfully:', data)

      // Optimistically add the message to the list
      if (data) {
        const messageWithSender = data as unknown as MessageWithSender
        setMessages((current) => {
          // Check if message already exists (prevent duplicates)
          if (current.some(msg => msg.id === messageWithSender.id)) {
            return current
          }
          return [...current, messageWithSender]
        })

        // Email notifications removed - using weekly digest instead
        // Users will receive a weekly summary of unread messages via the weekly-unread-digest function
      }
    } catch (error) {
      console.error('Error sending message:', error)
      throw error
    }
  }

  const markAsRead = async (messageIds: string[], userId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        // @ts-ignore - Supabase types
        .update({ is_read: true })
        .in('id', messageIds)
        .eq('receiver_id', userId)

      if (error) throw error
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  return { messages, loading, sendMessage, markAsRead, refetch: fetchMessages }
}

export function useUnreadCount(userId: string | undefined) {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      setUnreadCount(0)
      return
    }

    const fetchUnreadCount = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userId)
        .eq('is_read', false)

      setUnreadCount(count || 0)
    }

    fetchUnreadCount()

    // Subscribe to message changes
    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${userId}`,
        },
        () => {
          fetchUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return unreadCount
}
