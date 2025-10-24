'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { createClient } from '@/app/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FaSave, FaUser, FaLock, FaTrash } from 'react-icons/fa'

const INSTRUMENTS = [
  'Guitar', 'Drums', 'Vocals', 'Piano', 'Bass', 'Keyboard',
  'Violin', 'Flute', 'Saxophone', 'DJ/Production'
]

const GENRES = [
  'Rock', 'Pop', 'Jazz', 'Classical', 'Hip Hop', 'Electronic',
  'Blues', 'Country', 'R&B', 'Metal', 'Indie', 'Folk',
  'Carnatic', 'Hindustani', 'Fusion'
]

const BATCH_YEARS = [2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028]

export default function SettingsPage() {
  const { user, profile, refreshProfile, signOut, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    bio: '',
    instruments: [] as string[],
    musicalInterests: [] as string[],
    batchYear: new Date().getFullYear(),
    spotifyPlaylist: '',
    avatarUrl: '',
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username,
        fullName: profile.full_name || '',
        bio: profile.bio || '',
        instruments: (profile.instruments as string[]) || [],
        musicalInterests: (profile.musical_interests as string[]) || [],
        batchYear: profile.batch_year || new Date().getFullYear(),
        spotifyPlaylist: profile.spotify_playlist || '',
        avatarUrl: profile.avatar_url || '',
      })
    }
  }, [profile])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!user) throw new Error('No user found')

      const { error } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          full_name: formData.fullName,
          bio: formData.bio,
          instruments: formData.instruments,
          musical_interests: formData.musicalInterests,
          batch_year: formData.batchYear,
          spotify_playlist: formData.spotifyPlaylist || null,
          avatar_url: formData.avatarUrl || null,
        })
        .eq('id', user.id)

      if (error) throw error

      await refreshProfile()
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error: any) {
      setError(error.message)
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

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    try {
      // Delete user profile
      await supabase.from('profiles').delete().eq('id', user?.id)
      
      // Sign out
      await signOut()
      router.push('/')
    } catch (error: any) {
      setError(error.message)
    }
  }

  if (authLoading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8">
          <h1 className="text-4xl font-bold text-white mb-8 flex items-center gap-3">
            <FaUser />
            Account Settings
          </h1>

          {success && (
            <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-3 rounded-lg mb-6">
              Settings saved successfully!
            </div>
          )}

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Profile Picture */}
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Profile Picture
              </label>
              <div className="flex items-center gap-6">
                {formData.avatarUrl ? (
                  <Image
                    src={formData.avatarUrl}
                    alt="Profile"
                    width={100}
                    height={100}
                    className="rounded-full border-4 border-purple-500"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center border-4 border-purple-500">
                    <span className="text-white text-3xl font-bold">
                      {formData.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, avatarUrl: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Avatar URL (e.g., https://...)"
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    Paste a URL to your profile picture
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                  minLength={3}
                  maxLength={30}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
            </div>

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
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Instruments */}
            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Instruments
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INSTRUMENTS.map((instrument) => {
                  const isSelected = formData.instruments.includes(instrument)
                  return (
                    <button
                      key={instrument}
                      type="button"
                      onClick={() => toggleInstrument(instrument)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-gray-800/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      {instrument}
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
              >
                {BATCH_YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Spotify Playlist */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Spotify Playlist (Optional)
              </label>
              <input
                type="url"
                value={formData.spotifyPlaylist}
                onChange={(e) => setFormData(prev => ({ ...prev, spotifyPlaylist: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://open.spotify.com/playlist/..."
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-700">
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <FaSave />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                type="button"
                onClick={handleDeleteAccount}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <FaTrash />
                Delete Account
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
