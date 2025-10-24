'use client'

import { useState, useEffect, Suspense } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useConversations } from '@/app/hooks/useChat'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/app/lib/supabase-client'
import Image from 'next/image'
import ChatWindow from '@/app/components/community/ChatWindow'
import { FaInbox, FaSearch } from 'react-icons/fa'

function MessagesPageContent() {
  const { user, loading: authLoading } = useAuth()
  const { conversations, loading, refetch } = useConversations(user?.id)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  // Handle starting a conversation with a user from URL query
  useEffect(() => {
    const startConversationWithUser = async () => {
      const username = searchParams.get('user')
      if (username && user) {
        try {
          // Get the user's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single()

          if (profile && profile.id !== user.id) {
            // Get or create conversation
            const { data: conversationId } = await supabase.rpc('get_or_create_conversation', {
              user1: user.id,
              user2: profile.id,
            })

            if (conversationId) {
              setSelectedConversation(conversationId)
              await refetch()
            }
          }
        } catch (error) {
          console.error('Error starting conversation:', error)
        }
      }
    }

    startConversationWithUser()
  }, [searchParams, user])

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.otherUser.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 py-20 px-4">
      <div className="container mx-auto max-w-7xl h-[calc(100vh-8rem)]">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 h-full flex">
          {/* Conversations List */}
          <div className={`w-full md:w-96 border-r border-gray-700 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            {/* Header */}
            <div className="p-4 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4">Messages</h2>
              
              {/* Search */}
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <FaInbox className="text-6xl text-gray-600 mb-4" />
                  <p className="text-gray-400 text-lg mb-2">No conversations yet</p>
                  <p className="text-gray-500 text-sm">
                    Start chatting with other musicians from the community
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation.id)}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-gray-800/50 transition-colors border-b border-gray-700/50 ${
                      selectedConversation === conversation.id ? 'bg-gray-800/50' : ''
                    }`}
                  >
                    {/* Avatar */}
                    {conversation.otherUser.avatar_url ? (
                      <Image
                        src={conversation.otherUser.avatar_url}
                        alt={conversation.otherUser.username}
                        width={50}
                        height={50}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                        <span className="text-white font-bold">
                          {conversation.otherUser.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="text-white font-semibold">
                          {conversation.otherUser.full_name || conversation.otherUser.username}
                        </h3>
                        {conversation.unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                            {conversation.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm">@{conversation.otherUser.username}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className={`flex-1 ${selectedConversation ? 'block' : 'hidden md:block'}`}>
            {selectedConversation ? (
              <ChatWindow
                conversationId={selectedConversation}
                onBack={() => setSelectedConversation(null)}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <FaInbox className="text-6xl text-gray-600 mb-4 mx-auto" />
                  <p className="text-gray-400 text-lg">Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    }>
      <MessagesPageContent />
    </Suspense>
  )
}
