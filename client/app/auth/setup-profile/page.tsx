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
  socialLinks: [{ title: '', url: '' }],
  })

  // Get user role from profile
  const userRole = profile?.role

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
    // Prevent enthusiasts from accessing community if profile is not complete
    if (user && profile?.role === 'enthusiast' && !profile?.is_profile_complete) {
      // Stay on setup-profile, do not redirect
      // Optionally, could show a message or force refresh
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
        social_links: formData.socialLinks.filter(link => link.url.trim() !== ''),
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
      // Refresh the page after rerouting to /community
      setTimeout(() => {
        window.location.reload()
      }, 100)
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
              <span className="text-red-400">*</span> indicates mandatory fields.<br />
              {userRole === 'enthusiast' ? (
                <span className="text-xs text-blue-300">For enthusiasts, only Bio, Favorite Genres, and Batch Year are required.</span>
              ) : (
                <span className="text-xs text-purple-300">For members, Bio, Instruments, Favorite Genres, and Batch Year are required.</span>
              )}
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
                Bio <span className="text-red-400">*</span>
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
                Instruments You Play{userRole !== 'enthusiast' && <span className="text-red-400">*</span>}
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
                Favorite Genres <span className="text-red-400">*</span>
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
              <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                Batch Year <span className="text-red-400">*</span>
                <span className="relative group">
                  <span className="inline-flex items-center cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
                    </svg>
                  </span>
                  <span className="absolute left-6 top-1 z-10 w-48 bg-gray-900 border border-gray-700 rounded-lg p-2 text-xs text-gray-300 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Your batch year is the year you joined the institute (e.g., 2022). This helps us connect you with your peers and alumni.
                  </span>
                </span>
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

            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Social Links (Optional)
              </label>
              {formData.socialLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={link.title}
                    onChange={e => {
                      const newLinks = [...formData.socialLinks]
                      newLinks[idx].title = e.target.value
                      setFormData(prev => ({ ...prev, socialLinks: newLinks }))
                    }}
                    className="w-1/3 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Title (e.g. Spotify, Instagram)"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={e => {
                      const newLinks = [...formData.socialLinks]
                      newLinks[idx].url = e.target.value
                      setFormData(prev => ({ ...prev, socialLinks: newLinks }))
                    }}
                    className="w-2/3 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="https://your-social-link.com"
                  />
                  <button
                    type="button"
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
                    onClick={() => setFormData(prev => ({ ...prev, socialLinks: prev.socialLinks.filter((_, i) => i !== idx) }))}
                    disabled={formData.socialLinks.length === 1}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium mt-2"
                onClick={() => setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, { title: '', url: '' }] }))}
              >
                Add Link
              </button>
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
                disabled={
                  loading ||
                  formData.musicalInterests.length === 0 ||
                  (!formData.bio || !formData.batchYear) ||
                  (userRole !== 'enthusiast' && formData.instruments.length === 0)
                }
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
