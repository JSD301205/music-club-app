'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { createClient } from '@/app/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaCheck, FaTimes, FaEnvelope, FaUser, FaInbox, FaPaperPlane } from 'react-icons/fa'
import Avatar from '@/app/components/ui/Avatar'

interface MessageRequest {
  id: string
  from_user_id: string
  to_user_id: string
  status: 'pending' | 'approved' | 'rejected'
  message: string | null
  created_at: string
  from_user?: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    role: string
  }
  to_user?: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
    role: string
  }
}

export default function MessageRequestsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const [incomingRequests, setIncomingRequests] = useState<MessageRequest[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<MessageRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    } else if (user) {
      fetchRequests()
    }
  }, [user, authLoading])

  const fetchRequests = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Fetch incoming requests
      const { data: incoming, error: incomingError } = await supabase
        .from('message_requests')
        .select(`
          *,
          from_user:profiles!from_user_id(id, username, full_name, avatar_url, role)
        `)
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false })

      if (incomingError) throw incomingError

      // Fetch outgoing requests
      const { data: outgoing, error: outgoingError } = await supabase
        .from('message_requests')
        .select(`
          *,
          to_user:profiles!to_user_id(id, username, full_name, avatar_url, role)
        `)
        .eq('from_user_id', user.id)
        .order('created_at', { ascending: false })

      if (outgoingError) throw outgoingError

      setIncomingRequests(incoming || [])
      setOutgoingRequests(outgoing || [])
    } catch (error) {
      console.error('Error fetching message requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('message_requests')
        .update({ status: 'approved' } as any)
        .eq('id', requestId)

      if (error) throw error

      await fetchRequests()
    } catch (error) {
      console.error('Error approving request:', error)
      alert('Failed to approve request')
    }
  }

  const handleReject = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('message_requests')
        .update({ status: 'rejected' } as any)
        .eq('id', requestId)

      if (error) throw error

      await fetchRequests()
    } catch (error) {
      console.error('Error rejecting request:', error)
      alert('Failed to reject request')
    }
  }

  const handleCancel = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('message_requests')
        .delete()
        .eq('id', requestId)

      if (error) throw error

      await fetchRequests()
    } catch (error) {
      console.error('Error canceling request:', error)
      alert('Failed to cancel request')
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  const pendingIncoming = incomingRequests.filter(r => r.status === 'pending')
  const pendingOutgoing = outgoingRequests.filter(r => r.status === 'pending')

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 py-20 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <FaEnvelope />
            Message Requests
          </h1>
          <p className="text-gray-300">Manage who can message you</p>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('incoming')}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'incoming'
                  ? 'bg-purple-600 text-white'
                  : 'bg-transparent text-gray-300 hover:bg-white/5'
              }`}
            >
              <FaInbox />
              Incoming
              {pendingIncoming.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingIncoming.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('outgoing')}
              className={`flex-1 px-6 py-4 font-semibold transition-all flex items-center justify-center gap-2 ${
                activeTab === 'outgoing'
                  ? 'bg-purple-600 text-white'
                  : 'bg-transparent text-gray-300 hover:bg-white/5'
              }`}
            >
              <FaPaperPlane />
              Outgoing
              {pendingOutgoing.length > 0 && (
                <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {pendingOutgoing.length}
                </span>
              )}
            </button>
          </div>

          <div className="p-6">
            {/* Incoming Requests */}
            {activeTab === 'incoming' && (
              <div className="space-y-4">
                {incomingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-300 text-lg">No incoming message requests</p>
                  </div>
                ) : (
                  incomingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={request.from_user?.avatar_url}
                          alt={request.from_user?.username || 'User'}
                          fallback={request.from_user?.username || 'U'}
                          size="md"
                        />

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/community/${request.from_user?.username}`}
                              className="font-semibold text-white hover:text-purple-300 transition-colors"
                            >
                              {request.from_user?.full_name || request.from_user?.username}
                            </Link>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                request.from_user?.role === 'member'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-pink-600 text-white'
                              }`}
                            >
                              {request.from_user?.role === 'member' ? '🎸' : '❤️'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">@{request.from_user?.username}</p>

                          {request.message && (
                            <p className="text-gray-300 text-sm mb-3 italic">"{request.message}"</p>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className={`font-semibold ${
                              request.status === 'approved' ? 'text-green-400' :
                              request.status === 'rejected' ? 'text-red-400' :
                              'text-yellow-400'
                            }`}>
                              {request.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(request.id)}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                            >
                              <FaCheck />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(request.id)}
                              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                            >
                              <FaTimes />
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Outgoing Requests */}
            {activeTab === 'outgoing' && (
              <div className="space-y-4">
                {outgoingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-300 text-lg">No outgoing message requests</p>
                  </div>
                ) : (
                  outgoingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all"
                    >
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={request.to_user?.avatar_url}
                          alt={request.to_user?.username || 'User'}
                          fallback={request.to_user?.username || 'U'}
                          size="md"
                        />

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link
                              href={`/community/${request.to_user?.username}`}
                              className="font-semibold text-white hover:text-purple-300 transition-colors"
                            >
                              {request.to_user?.full_name || request.to_user?.username}
                            </Link>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                request.to_user?.role === 'member'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-pink-600 text-white'
                              }`}
                            >
                              {request.to_user?.role === 'member' ? '🎸' : '❤️'}
                            </span>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">@{request.to_user?.username}</p>

                          {request.message && (
                            <p className="text-gray-300 text-sm mb-3 italic">"{request.message}"</p>
                          )}

                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{new Date(request.created_at).toLocaleDateString()}</span>
                            <span>•</span>
                            <span className={`font-semibold ${
                              request.status === 'approved' ? 'text-green-400' :
                              request.status === 'rejected' ? 'text-red-400' :
                              'text-yellow-400'
                            }`}>
                              {request.status.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        {request.status === 'pending' && (
                          <button
                            onClick={() => handleCancel(request.id)}
                            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
                          >
                            Cancel
                          </button>
                        )}

                        {request.status === 'approved' && (
                          <Link
                            href={`/community/messages?user=${request.to_user?.username}`}
                            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
                          >
                            <FaEnvelope />
                            Message
                          </Link>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link
            href="/community"
            className="inline-block px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all"
          >
            ← Back to Community
          </Link>
        </div>
      </div>
    </div>
  )
}

