'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useMessages } from '@/app/hooks/useChat'
import { createClient } from '@/app/lib/supabase-client'
import { Profile } from '@/app/types/database.types'
import Image from 'next/image'
import Link from 'next/link'
import { FaArrowLeft, FaPaperPlane, FaUser } from 'react-icons/fa'

interface ChatWindowProps {
  conversationId: string
  onBack: () => void
}

export default function ChatWindow({ conversationId, onBack }: ChatWindowProps) {
  const { user } = useAuth()
  const { messages, loading, sendMessage, markAsRead } = useMessages(conversationId)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [otherUser, setOtherUser] = useState<Profile | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Fetch other user's profile
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!conversationId || !user) return

      try {
        const { data: conversation } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single()

        if (conversation) {
          const otherUserId = conversation.user1_id === user.id 
            ? conversation.user2_id 
            : conversation.user1_id

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', otherUserId)
            .single()

          setOtherUser(profile)
        }
      } catch (error) {
        console.error('Error fetching other user:', error)
      }
    }

    fetchOtherUser()
  }, [conversationId, user])

  // Mark messages as read
  useEffect(() => {
    if (messages.length > 0 && user) {
      const unreadMessages = messages
        .filter(msg => msg.receiver_id === user.id && !msg.is_read)
        .map(msg => msg.id)

      if (unreadMessages.length > 0) {
        markAsRead(unreadMessages, user.id)
      }
    }
  }, [messages, user])

  // Scroll to bottom on new messages (only in the messages container, not the whole page)
  useEffect(() => {
    // Use a timeout to ensure DOM has updated
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }, 100)
    
    return () => clearTimeout(timer)
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !user || !otherUser || sending) return

    setSending(true)
    try {
      await sendMessage(newMessage.trim(), user.id, otherUser.id)
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = diffInMs / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  if (loading || !otherUser) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center gap-3 bg-gray-800/30">
        <button
          onClick={onBack}
          className="md:hidden text-white hover:text-purple-400 transition-colors"
        >
          <FaArrowLeft size={20} />
        </button>

        {otherUser.avatar_url ? (
          <Image
            src={otherUser.avatar_url}
            alt={otherUser.username}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-white font-bold">
              {otherUser.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        <div className="flex-1">
          <h3 className="text-white font-semibold">
            {otherUser.full_name || otherUser.username}
          </h3>
          <p className="text-gray-400 text-sm">@{otherUser.username}</p>
        </div>

        <Link
          href={`/community/${otherUser.username}`}
          className="text-purple-400 hover:text-purple-300 transition-colors"
          title="View Profile"
        >
          <FaUser size={20} />
        </Link>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-400">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.sender_id === user?.id
            
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] ${
                    isOwnMessage
                      ? 'bg-purple-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
                      : 'bg-gray-700 text-white rounded-tl-2xl rounded-tr-2xl rounded-br-2xl'
                  } p-3`}
                >
                  <p className="break-words">{message.content}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-purple-200' : 'text-gray-400'
                    }`}
                  >
                    {formatTime(message.created_at)}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700 bg-gray-800/30">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <FaPaperPlane />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  )
}
