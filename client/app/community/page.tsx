'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase-client'
import { Profile } from '@/app/types/database.types'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FaSearch, FaFilter, FaGuitar, FaMusic, FaEnvelope } from 'react-icons/fa'
import { INSTRUMENTS, GENRES } from '@/app/constants/music'
import Avatar from '@/app/components/ui/Avatar'

export default function CommunityPage() {
  const { user, loading: authLoading } = useAuth()
  const [members, setMembers] = useState<Profile[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedInstrument, setSelectedInstrument] = useState<string>('')
  const [selectedGenre, setSelectedGenre] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Handle authentication and data fetching
    const initializePage = async () => {
      if (authLoading) {
        // Still checking auth, wait
        return
      }

      if (!user) {
        // Not authenticated, redirect to login
        router.push('/auth/login')
        return
      }

      // User is authenticated, fetch members
      fetchMembers()
    }

    initializePage()
  }, [user, authLoading])

  // Remove the separate fetchMembers useEffect since it's now called above
  // useEffect(() => {
  //   fetchMembers()
  // }, [])

  useEffect(() => {
    filterMembers()
  }, [searchQuery, selectedInstrument, selectedGenre, members])

  const fetchMembers = async () => {
    try {
      setLoading(true)
      // @ts-ignore - Supabase types
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_profile_complete', true)
        .eq('is_visible_in_community', true)  // Only show visible profiles
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
      setFilteredMembers(data || [])
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMembers = () => {
    let filtered = members

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(member =>
        member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Instrument filter
    if (selectedInstrument) {
      filtered = filtered.filter(member =>
        (member.instruments as string[])?.includes(selectedInstrument)
      )
    }

    // Genre filter
    if (selectedGenre) {
      filtered = filtered.filter(member =>
        (member.musical_interests as string[])?.includes(selectedGenre)
      )
    }

    setFilteredMembers(filtered)
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedInstrument('')
    setSelectedGenre('')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading community members...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Music Community</h1>
          <p className="text-xl text-gray-300">Connect with {members.length} fellow musicians</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search members..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-all"
            >
              <FaFilter />
              Filters
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-600">
              {/* Instrument Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Instrument</label>
                <select
                  value={selectedInstrument}
                  onChange={(e) => setSelectedInstrument(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Instruments</option>
                  {INSTRUMENTS.map(instrument => (
                    <option key={instrument} value={instrument}>{instrument}</option>
                  ))}
                </select>
              </div>

              {/* Genre Filter */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">Genre</label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">All Genres</option>
                  {GENRES.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>

              {(selectedInstrument || selectedGenre) && (
                <div className="col-span-full">
                  <button
                    onClick={clearFilters}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="text-white mb-6">
          Showing {filteredMembers.length} of {members.length} members
        </div>

        {/* Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-white/20"
            >
              <div className="p-6">
                {/* Profile Picture */}
                <div className="flex items-start gap-4 mb-4">
                  <Avatar
                    src={member.avatar_url}
                    alt={member.username}
                    fallback={member.username}
                    size="lg"
                    className="border-4 border-purple-500"
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-white">
                        {member.full_name || member.username}
                      </h3>
                      {/* Role Badge */}
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          member.role === 'admin'
                            ? 'bg-orange-600 text-white'
                            : member.role === 'member'
                            ? 'bg-purple-600 text-white'
                            : 'bg-pink-600 text-white'
                        }`}
                        title={
                          member.role === 'admin'
                            ? 'Admin'
                            : member.role === 'member'
                            ? 'Musician Member'
                            : 'Music Enthusiast'
                        }
                      >
                        {member.role === 'admin' ? '🛡️' : member.role === 'member' ? '🎸' : '❤️'}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm">@{member.username}</p>
                    {member.batch_year && (
                      <p className="text-purple-400 text-sm">Batch {member.batch_year}</p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                {member.bio && (
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">{member.bio}</p>
                )}

                {/* Instruments */}
                {(member.instruments as string[])?.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaGuitar className="text-purple-400" />
                      <span className="text-white text-sm font-semibold">Instruments</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(member.instruments as string[]).slice(0, 3).map((instrument) => (
                        <span
                          key={instrument}
                          className="px-2 py-1 bg-purple-600/50 text-white text-xs rounded-full"
                        >
                          {instrument}
                        </span>
                      ))}
                      {(member.instruments as string[]).length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded-full">
                          +{(member.instruments as string[]).length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Genres */}
                {(member.musical_interests as string[])?.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FaMusic className="text-purple-400" />
                      <span className="text-white text-sm font-semibold">Genres</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(member.musical_interests as string[]).slice(0, 3).map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-1 bg-blue-600/50 text-white text-xs rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                      {(member.musical_interests as string[]).length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 text-white text-xs rounded-full">
                          +{(member.musical_interests as string[]).length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  <Link
                    href={`/community/${member.username}`}
                    className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-center transition-all"
                  >
                    View Profile
                  </Link>
                  {user.id !== member.id && (
                    <Link
                      href={`/community/messages?user=${member.username}`}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center"
                      title="Send Message"
                    >
                      <FaEnvelope />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-300 text-xl">No members found matching your criteria</p>
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
