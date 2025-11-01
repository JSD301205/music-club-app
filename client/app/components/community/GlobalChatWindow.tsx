'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { createClient } from '@/app/lib/supabase-client'
import { filterProfanity } from '@/app/utils/profanityFilter'
import Image from 'next/image'
import Link from 'next/link'
import { FaArrowLeft, FaPaperPlane, FaGlobeAmericas, FaTrash, FaEdit, FaTimes, FaSave } from 'react-icons/fa'

interface GlobalChatMessage {
  id: string
  user_id: string
  message: string
  created_at: string
  edited_at?: string
  profiles?: {
    username: string
    full_name: string
    avatar_url: string
  }
}

interface GlobalChatWindowProps {
  onBack: () => void
}

export default function GlobalChatWindow({ onBack }: GlobalChatWindowProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<GlobalChatMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [editedMessage, setEditedMessage] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch messages
  useEffect(() => {
    fetchMessages()

    // Subscribe to new messages
    const channel = supabase
      .channel('global_chat_realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'global_chat_messages',
        },
        async (payload) => {
          // console.log('Real-time event:', payload.eventType, payload)
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            // Refetch to get complete data with joined profiles
            await fetchMessages()
          } else if (payload.eventType === 'DELETE') {
            setMessages((prev) => prev.filter((msg) => msg.id !== payload.old.id))
          }
        }
      )
      .subscribe((status) => {
        // console.log('Subscription status:', status)
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchMessages = async () => {
    try {
      // Fetch messages
      // @ts-ignore - Supabase types
      const { data: messagesData, error: messagesError } = await supabase
        .from('global_chat_messages')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(200)

      if (messagesError) {
        // console.error('Fetch error:', messagesError)
        throw messagesError
      }

      if (!messagesData || messagesData.length === 0) {
        // console.log('No messages found')
        setMessages([])
        return
      }

      // Fetch profiles for all user_ids
      const userIds = Array.from(new Set(messagesData.map((msg: any) => msg.user_id)))
      
      // @ts-ignore - Supabase types
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', userIds)

      if (profilesError) {
        // console.error('Profiles fetch error:', profilesError)
        // Still show messages even if profiles fail
        setMessages(messagesData.map((msg: any) => ({
          ...msg,
          profiles: null
        })))
        return
      }

      // Map profiles to messages
      const profilesMap = new Map(profilesData?.map((p: any) => [p.id, p]) || [])
      const messagesWithProfiles = messagesData.map((msg: any) => ({
        ...msg,
        profiles: profilesMap.get(msg.user_id) || null
      }))
      
      // console.log('Fetched messages:', messagesWithProfiles.length)
      setMessages(messagesWithProfiles)
    } catch (error) {
      // console.error('Error fetching messages:', error)
    } finally {
      setLoading(false)
    }
  }

  // Scroll to bottom on new messages
  useEffect(() => {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
    
    return () => clearTimeout(timer)
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || sending) return

    const messageToSend = newMessage.trim()
    setSending(true)
    setNewMessage('') // Clear input immediately for better UX

    try {
      // Filter profanity before sending
      const filteredMessage = filterProfanity(messageToSend)

      // @ts-ignore - Supabase types
      const { error } = await supabase
        .from('global_chat_messages')
        // @ts-ignore - Supabase types
        .insert({
          user_id: user.id,
          message: filteredMessage,
        })

      if (error) throw error

      // Fetch messages to ensure we have the latest
      await fetchMessages()
    } catch (error) {
      // console.error('Error sending message:', error)
      alert('Failed to send message')
      // Restore message in input on error
      setNewMessage(messageToSend)
    } finally {
      setSending(false)
    }
  }

  const handleEditMessage = (messageId: string, currentMessage: string) => {
    setEditingMessageId(messageId)
    setEditedMessage(currentMessage)
  }

  const handleSaveEdit = async (messageId: string) => {
    if (!editedMessage.trim()) return

    try {
      const filteredMessage = filterProfanity(editedMessage.trim())

      // @ts-ignore - Supabase types
      const { error } = await supabase
        .from('global_chat_messages')
        // @ts-ignore - Supabase types
        .update({
          message: filteredMessage,
          edited_at: new Date().toISOString(),
        })
        .eq('id', messageId)

      if (error) throw error
      setEditingMessageId(null)
      setEditedMessage('')
    } catch (error) {
      // console.error('Error editing message:', error)
      alert('Failed to edit message')
    }
  }

  const handleCancelEdit = () => {
    setEditingMessageId(null)
    setEditedMessage('')
  }

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return

    try {
      // @ts-ignore - Supabase types
      const { error } = await supabase
        .from('global_chat_messages')
        // @ts-ignore - Supabase types
        .update({ is_deleted: true })
        .eq('id', messageId)

      if (error) throw error
    } catch (error) {
      // console.error('Error deleting message:', error)
      alert('Failed to delete message')
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="md:hidden text-white hover:text-gray-300 transition-colors"
          >
            <FaArrowLeft size={20} />
          </button>
          
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
            <FaGlobeAmericas className="text-white" size={24} />
          </div>

          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">Global Chat</h3>
            <p className="text-gray-400 text-sm">
              Community-wide discussion • {messages.length} messages
            </p>
          </div>
        </div>

        {/* Info banner */}
        <div className="mt-3 p-3 bg-blue-900/30 border border-blue-500/50 rounded-lg">
          <p className="text-blue-200 text-xs">
            💡 This is a public chat. Be respectful and follow community guidelines.
            Email notifications are muted for this chat.
          </p>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-400">Loading messages...</div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FaGlobeAmericas className="text-6xl text-gray-600 mb-4" />
            <p className="text-gray-400 text-lg mb-2">No messages yet</p>
            <p className="text-gray-500 text-sm">Be the first to start the conversation!</p>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwnMessage = message.user_id === user?.id
              const profile = message.profiles

              return (
                <div
                  key={message.id}
                  className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <Link href={`/community/${profile?.username}`} className="flex-shrink-0">
                    {profile?.avatar_url ? (
                      <Image
                        src={profile.avatar_url}
                        alt={profile.username}
                        width={40}
                        height={40}
                        className="rounded-full hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center hover:ring-2 hover:ring-purple-500 transition-all cursor-pointer">
                        <span className="text-white font-bold text-sm">
                          {profile?.username?.charAt(0).toUpperCase() || '?'}
                        </span>
                      </div>
                    )}
                  </Link>

                  {/* Message Content */}
                  <div className={`flex-1 ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col max-w-[70%]`}>
                    {/* Username and Time */}
                    <div className={`flex items-center gap-2 mb-1 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Link 
                        href={`/community/${profile?.username}`}
                        className="text-sm font-semibold text-white hover:text-purple-400 transition-colors"
                      >
                        {profile?.full_name || profile?.username || 'Unknown User'}
                      </Link>
                      <span className="text-xs text-gray-500">{formatTime(message.created_at)}</span>
                      {message.edited_at && (
                        <span className="text-xs text-gray-500 italic">(edited)</span>
                      )}
                    </div>

                    {/* Message Bubble */}
                    {editingMessageId === message.id ? (
                      <div className="w-full">
                        <textarea
                          value={editedMessage}
                          onChange={(e) => setEditedMessage(e.target.value)}
                          className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                          rows={3}
                        />
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleSaveEdit(message.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                          >
                            <FaSave size={12} />
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                          >
                            <FaTimes size={12} />
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`p-3 rounded-2xl ${
                          isOwnMessage
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-700 text-white'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>
                      </div>
                    )}

                    {/* Action Buttons (only for own messages) */}
                    {isOwnMessage && editingMessageId !== message.id && (
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => handleEditMessage(message.id, message.message)}
                          className="text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                        >
                          <FaEdit size={10} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
                        >
                          <FaTrash size={10} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700 bg-gray-800/50">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaPaperPlane />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send
        </p>
      </div>
    </div>
  )
}
