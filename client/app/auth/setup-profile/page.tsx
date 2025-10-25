'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { createClient } from '@/app/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { FaGuitar, FaDrum, FaMicrophone, FaMusic, FaHeadphones } from 'react-icons/fa'
import { INSTRUMENTS, GENRES, BATCH_YEARS } from '@/app/constants/music'

// Icons mapping for instruments
const INSTRUMENT_ICONS: Record<string, any> = {
  'Guitar': FaGuitar,
  'Drums': FaDrum,
  'Vocals': FaMicrophone,
  'Beatboxing': FaMicrophone,
  'DJ/Production': FaHeadphones,
  'default': FaMusic
}

const getInstrumentIcon = (instrumentName: string) => {
  return INSTRUMENT_ICONS[instrumentName] || INSTRUMENT_ICONS['default']
}

export default function SetupProfilePage() {
  const { user, profile, loading: authLoading, refreshProfile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    bio: '',
    instruments: [] as string[],
    musicalInterests: [] as string[],
    batchYear: new Date().getFullYear(),
    spotifyPlaylist: '',
  })

  useEffect(() => {
    // Don't check anything while auth is still loading
    if (authLoading) return
    
    let timer: NodeJS.Timeout
    
    // Redirect if no user
    if (!user) {
      timer = setTimeout(() => {
        router.push('/auth/login')
      }, 200)
    }
    
    // Redirect if profile is complete (only if user exists)
    if (user && profile?.is_profile_complete) {
      timer = setTimeout(() => {
        router.push('/community')
      }, 200)
    }
    
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [profile, authLoading, router, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (!user) throw new Error('No user found')

      const updateData = {
        bio: formData.bio,
        instruments: formData.instruments,
        musical_interests: formData.musicalInterests,
        batch_year: formData.batchYear,
        spotify_playlist: formData.spotifyPlaylist || null,
        is_profile_complete: true,
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from('profiles')
        // @ts-ignore - Supabase types use Json type for arrays
        .update(updateData)
        .eq('id', user.id)

      if (profileError) throw profileError

      // Update user metadata to avoid database calls in middleware
      const { error: metadataError } = await supabase.auth.updateUser({
        data: {
          is_profile_complete: true,
        },
      })

      if (metadataError) {
        console.error('Error updating user metadata:', metadataError)
        // Don't throw - profile is already updated
      }

      await refreshProfile()
      router.push('/community')
    } catch (error: any) {
      setError(error.message || 'An error occurred while updating your profile')
    } finally {
      setLoading(false)
    }
  }

  const toggleInstrument = (instrument: string) => {
    setFormData(prev => ({
      ...prev,
      instruments: prev.instruments.includes(instrument)
        ? prev.instruments.filter(i => i !== instrument)
        : [...prev.instruments, instrument]
    }))
  }

  const toggleGenre = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      musicalInterests: prev.musicalInterests.includes(genre)
        ? prev.musicalInterests.filter(g => g !== genre)
        : [...prev.musicalInterests, genre]
    }))
  }

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Show loading if no user (will be handled by useEffect above)
  if (!user && !authLoading) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Complete Your Profile
            </h1>
            <p className="text-gray-300">
              Tell us about your musical journey to connect with fellow musicians
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Complete your profile to be visible in the community and connect with other musicians
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Tell us about yourself and your musical interests..."
                required
              />
            </div>

            {/* Instruments */}
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Instruments You Play
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INSTRUMENTS.map((instrument) => {
                  const Icon = getInstrumentIcon(instrument)
                  const isSelected = formData.instruments.includes(instrument)
                  return (
                    <button
                      key={instrument}
                      type="button"
                      onClick={() => toggleInstrument(instrument)}
                      className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <Icon />
                      <span className="text-sm">{instrument}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Musical Interests */}
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Favorite Genres
              </label>
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => {
                  const isSelected = formData.musicalInterests.includes(genre)
                  return (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => toggleGenre(genre)}
                      className={`px-4 py-2 rounded-full border-2 transition-all ${
                        isSelected
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {genre}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Batch Year */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Batch Year
              </label>
              <select
                value={formData.batchYear}
                onChange={(e) => setFormData(prev => ({ ...prev, batchYear: parseInt(e.target.value) }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                {BATCH_YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Spotify Playlist (Optional) */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Spotify Playlist Link (Optional)
              </label>
              <input
                type="url"
                value={formData.spotifyPlaylist}
                onChange={(e) => setFormData(prev => ({ ...prev, spotifyPlaylist: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://open.spotify.com/playlist/..."
              />
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-3 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-800/50 transition-all"
              >
                Skip for now
              </button>
              <button
                type="submit"
                disabled={loading || formData.instruments.length === 0 || formData.musicalInterests.length === 0}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
