'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase-client'
import { notFound, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FaArrowLeft, FaCalendar, FaImage, FaVideo } from 'react-icons/fa'
import GalleryItem from '@/app/components/ui/GalleryItem'
import { motion } from 'framer-motion'

interface GalleryItemType {
  id: number
  category: string
  image: string
  title: string
  type: 'image' | 'video'
  videoUrl?: string
  video_url?: string
  event?: string
  year: number
  order: number
  featured_members?: string[]
  created_at: string
  updated_at: string
}

interface Profile {
  id: string
  username: string
  full_name?: string
  avatar_url?: string
}

export default function UserGalleryPage() {
  const params = useParams()
  const username = params.username as string
  const supabase = createClient()
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [items, setItems] = useState<GalleryItemType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .eq('username', username)
          .single()

        if (profileError || !profileData) {
          setError('User not found')
          return
        }

        setProfile(profileData as Profile)

        // Get all gallery items where this user is featured
        const { data: galleryItems, error: galleryError } = await supabase
          .from('gallery_items')
          .select('*')
          .contains('featured_members', [username])
          .order('year', { ascending: false })
          .order('created_at', { ascending: false })

        // Map to match GalleryItem component structure
        const mappedItems = (galleryItems || []).map(item => ({
          ...item,
          videoUrl: item.video_url // Map video_url to videoUrl for component compatibility
        })) as GalleryItemType[]

        setItems(mappedItems)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to load gallery')
      } finally {
        setLoading(false)
      }
    }

    if (username) {
      fetchData()
    }
  }, [username])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Loading gallery...</div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-2xl">{error || 'User not found'}</div>
      </div>
    )
  }

  // Group by year
  const itemsByYear = items.reduce((acc, item) => {
    const year = item.year
    if (!acc[year]) acc[year] = []
    acc[year].push(item)
    return acc
  }, {} as Record<number, typeof items>)

  const years = Object.keys(itemsByYear).sort((a, b) => parseInt(b) - parseInt(a))

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href={`/community/${username}`}
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4 transition-colors"
          >
            <FaArrowLeft />
            Back to Profile
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.username}
                width={80}
                height={80}
                className="rounded-full border-4 border-purple-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center border-4 border-purple-500">
                <span className="text-white text-3xl font-bold">
                  {profile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold text-white">
                {profile.full_name || profile.username}'s Gallery
              </h1>
              <p className="text-gray-300 text-lg">
                {items.length} {items.length === 1 ? 'performance' : 'performances'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Gallery Content */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20"
          >
            <FaImage className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Performances Yet</h2>
            <p className="text-gray-300">
              {profile.full_name || profile.username} hasn't been featured in any gallery items yet.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-12">
            {years.map((year, yearIndex) => (
              <motion.div
                key={year}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + yearIndex * 0.1 }}
              >
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaCalendar className="text-purple-400" />
                  {year}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {itemsByYear[parseInt(year)].map((item, itemIndex) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: itemIndex * 0.05 }}
                    >
                      <GalleryItem item={item} />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-12 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
          >
            <h3 className="text-xl font-bold text-white mb-4">Performance Stats</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{items.length}</div>
                <div className="text-sm text-gray-300">Total</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">
                  {items.filter(i => i.type === 'image').length}
                </div>
                <div className="text-sm text-gray-300">Photos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">
                  {items.filter(i => i.type === 'video').length}
                </div>
                <div className="text-sm text-gray-300">Videos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{years.length}</div>
                <div className="text-sm text-gray-300">Years Active</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
