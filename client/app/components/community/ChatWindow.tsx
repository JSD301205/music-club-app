'use client'

import { useState, useEffect, useRef, ChangeEvent } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useMessages } from '@/app/hooks/useChat'
import { createClient } from '@/app/lib/supabase-client'
import { Profile } from '@/app/types/database.types'
import { uploadChatFile, formatFileSize } from '@/app/utils/fileUpload'
import FilePreview from './FilePreview'
import Image from 'next/image'
import Link from 'next/link'
import { FaArrowLeft, FaPaperPlane, FaUser, FaPaperclip, FaTimes } from 'react-icons/fa'

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  // Fetch other user's profile
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!conversationId || !user) return

      try {
        // @ts-ignore - Supabase types
        const { data: conversation } = await supabase
          .from('conversations')
          .select('*')
          .eq('id', conversationId)
          .single()

        if (conversation) {
          const conv: any = conversation
          const otherUserId = conv.user1_id === user.id 
            ? conv.user2_id 
            : conv.user1_id

          // @ts-ignore - Supabase types
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

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newMessage.trim() && !selectedFile) || !user || !otherUser || sending || uploading) return

    // Store the message content before clearing
    const messageToSend = newMessage.trim()

    setSending(true)
    try {
      let fileData: any = {}

      // Upload file first if selected
      if (selectedFile) {
        setUploading(true)
        try {
          const uploadResult = await uploadChatFile(selectedFile, user.id, 'chat-files')
          fileData = {
            file_url: uploadResult.url,
            file_name: uploadResult.fileName,
            file_type: uploadResult.fileType,
            file_size: uploadResult.fileSize,
          }
          // Clear file selection after successful upload
          setSelectedFile(null)
          if (fileInputRef.current) {
            fileInputRef.current.value = ''
          }
        } catch (error: any) {
          alert(`Failed to upload file: ${error.message}`)
          return
        } finally {
          setUploading(false)
        }
      }

      // Send message with optional file data
      // Note: This uses the sendMessage from useChat hook, which needs to be updated
      // For now, we'll insert directly to handle file data
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          receiver_id: otherUser.id,
          content: messageToSend || null,
          ...fileData,
        })

      if (error) throw error

      // Update conversation's last_message_at
      // @ts-ignore - Supabase types
      const updateResult = await supabase
        .from('conversations')
        // @ts-ignore - Supabase types
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId)

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
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
                  className={`max-w-[70%] space-y-2`}
                >
                  {/* Text message */}
                  {message.content && (
                    <div
                      className={`${
                        isOwnMessage
                          ? 'bg-purple-600 text-white rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl'
                          : 'bg-gray-700 text-white rounded-tl-2xl rounded-tr-2xl rounded-br-2xl'
                      } p-3`}
                    >
                      <p className="break-words">{message.content}</p>
                    </div>
                  )}

                  {/* File attachment */}
                  {(message as any).file_url && (message as any).file_type && (
                    <FilePreview
                      fileUrl={(message as any).file_url}
                      fileName={(message as any).file_name || 'file'}
                      fileType={(message as any).file_type}
                      fileSize={(message as any).file_size}
                    />
                  )}

                  {/* Timestamp */}
                  <p
                    className={`text-xs ${
                      isOwnMessage ? 'text-purple-200 text-right' : 'text-gray-400'
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
        <div className="space-y-3">
          {/* File Input (hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,audio/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* File Preview */}
          {selectedFile && (
            <div className="flex items-center gap-3 p-3 bg-gray-800/50 border border-gray-600 rounded-lg">
              <FaPaperclip className="text-purple-400" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">{selectedFile.name}</p>
                <p className="text-gray-400 text-xs">{formatFileSize(selectedFile.size)}</p>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="text-gray-400 hover:text-red-400 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
          )}

          {/* Input Row */}
          <div className="flex gap-2">
            {/* File Attach Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-colors"
              title="Attach file"
              disabled={uploading || sending}
            >
              <FaPaperclip size={18} />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message or attach a file..."
              className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={sending || uploading}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={(!newMessage.trim() && !selectedFile) || sending || uploading}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span className="hidden sm:inline">Uploading...</span>
                </>
              ) : (
                <>
                  <FaPaperPlane />
                  <span className="hidden sm:inline">Send</span>
                </>
              )}
            </button>
          </div>

          {/* Helper Text */}
          <p className="text-xs text-gray-500">
            Supports images, audio, and documents (max 10MB for media, 25MB for docs)
          </p>
        </div>
      </form>
    </div>
  )
}
