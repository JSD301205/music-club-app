'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { createClient } from '@/app/lib/supabase-client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { FaSave, FaUser, FaLock, FaTrash, FaEye, FaEyeSlash, FaEnvelope, FaShieldAlt } from 'react-icons/fa'
import { INSTRUMENTS, GENRES, BATCH_YEARS } from '@/app/constants/music'
import ImageUpload from '@/app/components/ui/ImageUpload'
import { UserRole, MessagePermission } from '@/app/types/database.types'

export default function SettingsPage() {
  const { user, profile, refreshProfile, signOut, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
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
    socialLinks: [''],
    avatarUrl: '',
    role: 'member' as UserRole,
    isVisibleInCommunity: true,
    allowMessagesFrom: 'members_only' as MessagePermission,
  })
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null)

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
        socialLinks: Array.isArray((profile as any).social_links) && (profile as any).social_links.length > 0 ? (profile as any).social_links : [''],
        avatarUrl: profile.avatar_url || '',
        role: profile.role || 'member',
        isVisibleInCommunity: profile.is_visible_in_community ?? true,
        allowMessagesFrom: profile.allow_messages_from || 'members_only',
      })
    }
  }, [profile])

  const uploadAvatar = async (file: File): Promise<string> => {
    if (!user) throw new Error('No user found')

    // Delete old avatar if exists
    if (formData.avatarUrl && formData.avatarUrl.includes('supabase')) {
      const oldPath = formData.avatarUrl.split('/').pop()
      if (oldPath) {
        await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`])
      }
    }

    // Upload new avatar
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.id}/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      if (!user) throw new Error('No user found')

      let avatarUrl = formData.avatarUrl

      // Upload new avatar if file selected
      if (avatarFile) {
        setUploading(true)
        avatarUrl = await uploadAvatar(avatarFile)
        setAvatarFile(null)
        setUploading(false)
      }

      const { error } = await (supabase
        .from('profiles') as any)
        .update({
          username: formData.username,
          full_name: formData.fullName,
          bio: formData.bio,
          instruments: formData.instruments,
          musical_interests: formData.musicalInterests,
          batch_year: formData.batchYear,
          social_links: formData.socialLinks.filter(link => link.trim() !== ''),
          avatar_url: avatarUrl || null,
          role: formData.role,
          is_visible_in_community: formData.isVisibleInCommunity,
          allow_messages_from: formData.allowMessagesFrom,
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
      setUploading(false)
    }
  }

  const handleImageChange = (file: File) => {
    setAvatarFile(file)
    // Create temporary preview URL
    const previewUrl = URL.createObjectURL(file)
    setFormData(prev => ({ ...prev, avatarUrl: previewUrl }))
  }

  const handleRemoveImage = () => {
    setAvatarFile(null)
    setFormData(prev => ({ ...prev, avatarUrl: '' }))
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
      await (supabase.from('profiles') as any).delete().eq('id', user?.id)
      
      // Sign out
      await signOut()
      router.push('/')
      // Reload to ensure auth state is cleared
      setTimeout(() => {
        window.location.reload()
      }, 600)
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
            <ImageUpload
              currentImage={formData.avatarUrl}
              onImageChange={handleImageChange}
              onRemove={handleRemoveImage}
              username={formData.username}
            />

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
              <label className="block text-sm font-medium text-white mb-2 flex items-center gap-2">
                Batch Year
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
              >
                {BATCH_YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Spotify Playlist */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Social Links (Optional)
              </label>
              {formData.socialLinks.map((link, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={link}
                    onChange={e => {
                      const newLinks = [...formData.socialLinks]
                      newLinks[idx] = e.target.value
                      setFormData(prev => ({ ...prev, socialLinks: newLinks }))
                    }}
                    className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                onClick={() => setFormData(prev => ({ ...prev, socialLinks: [...prev.socialLinks, ''] }))}
              >
                Add Link
              </button>
            </div>

            {/* Privacy & Role Settings */}
            <div className="border-t border-gray-700 pt-8">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <FaShieldAlt />
                Privacy & Role Settings
              </h2>

              {/* Current Role Display */}
              <div className="mb-6 p-4 bg-purple-600/20 border border-purple-500 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Your Role</p>
                    <p className="text-gray-300 text-sm">
                      You are currently a <span className="font-bold">
                        {formData.role === 'admin' 
                          ? '🛡️ Admin' 
                          : formData.role === 'member' 
                          ? '🎸 Member' 
                          : '❤️ Enthusiast'}
                      </span>
                    </p>
                  </div>
                  {formData.role === 'enthusiast' && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Are you a musician? Upgrading to Member will make you visible in the community and allow you to post on the jam board.')) {
                          setFormData(prev => ({ ...prev, role: 'member', isVisibleInCommunity: true }))
                        }
                      }}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all"
                    >
                      Upgrade to Member
                    </button>
                  )}
                </div>
              </div>

              {/* Community Visibility */}
              <div className="mb-6">
                <label className="flex items-center justify-between p-4 bg-gray-800/50 border border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-all">
                  <div className="flex items-center gap-3">
                    {formData.isVisibleInCommunity ? (
                      <FaEye className="text-green-400 text-xl" />
                    ) : (
                      <FaEyeSlash className="text-gray-400 text-xl" />
                    )}
                    <div>
                      <p className="text-white font-medium">Visible in Community</p>
                      <p className="text-gray-400 text-sm">
                        {formData.isVisibleInCommunity 
                          ? 'Your profile appears in the community directory'
                          : 'Your profile is hidden from the community directory'}
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.isVisibleInCommunity}
                    onChange={(e) => setFormData(prev => ({ ...prev, isVisibleInCommunity: e.target.checked }))}
                    className="w-6 h-6 text-purple-600 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                  />
                </label>
                {formData.role === 'enthusiast' && !formData.isVisibleInCommunity && (
                  <p className="text-gray-400 text-xs mt-2 ml-4">
                    💡 As an enthusiast, hiding your profile is recommended
                  </p>
                )}
              </div>

              {/* Message Permissions */}
              <div>
                <label className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                  <FaEnvelope />
                  Who can message you?
                </label>
                <div className="space-y-3">
                  <label className="flex items-center p-4 bg-gray-800/50 border border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-all">
                    <input
                      type="radio"
                      name="messagePermission"
                      value="everyone"
                      checked={formData.allowMessagesFrom === 'everyone'}
                      onChange={(e) => setFormData(prev => ({ ...prev, allowMessagesFrom: e.target.value as MessagePermission }))}
                      className="w-5 h-5 text-purple-600 border-gray-600 focus:ring-purple-500 focus:ring-2"
                    />
                    <div className="ml-3">
                      <p className="text-white font-medium">Everyone</p>
                      <p className="text-gray-400 text-sm">All users can send you messages</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 bg-gray-800/50 border border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-all">
                    <input
                      type="radio"
                      name="messagePermission"
                      value="members_only"
                      checked={formData.allowMessagesFrom === 'members_only'}
                      onChange={(e) => setFormData(prev => ({ ...prev, allowMessagesFrom: e.target.value as MessagePermission }))}
                      className="w-5 h-5 text-purple-600 border-gray-600 focus:ring-purple-500 focus:ring-2"
                    />
                    <div className="ml-3">
                      <p className="text-white font-medium">Members Only (Recommended)</p>
                      <p className="text-gray-400 text-sm">Only verified musicians can message you directly</p>
                    </div>
                  </label>

                  <label className="flex items-center p-4 bg-gray-800/50 border border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-all">
                    <input
                      type="radio"
                      name="messagePermission"
                      value="no_one"
                      checked={formData.allowMessagesFrom === 'no_one'}
                      onChange={(e) => setFormData(prev => ({ ...prev, allowMessagesFrom: e.target.value as MessagePermission }))}
                      className="w-5 h-5 text-purple-600 border-gray-600 focus:ring-purple-500 focus:ring-2"
                    />
                    <div className="ml-3">
                      <p className="text-white font-medium">No One</p>
                      <p className="text-gray-400 text-sm">Disable all incoming messages</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-700">
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                <FaSave />
                {uploading ? 'Uploading image...' : loading ? 'Saving...' : 'Save Changes'}
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
