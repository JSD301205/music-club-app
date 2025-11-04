import { createClient } from '@/app/lib/supabase-server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FaArrowLeft, FaCalendar, FaImage, FaVideo } from 'react-icons/fa'

interface GalleryItem {
  id: number
  category: string
  image: string
  title: string
  type: 'image' | 'video'
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

export default async function UserGalleryPage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .eq('username', username)
    .single()

  if (profileError || !profile) {
    notFound()
  }

  const userProfile = profile as Profile

  // Get all gallery items where this user is featured
  const { data: galleryItems, error: galleryError } = await supabase
    .from('gallery_items')
    .select('*')
    .contains('featured_members', [username])
    .order('year', { ascending: false })
    .order('created_at', { ascending: false })

  const items = (galleryItems as GalleryItem[]) || []

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
        <div className="mb-8">
          <Link
            href={`/community/${username}`}
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-4 transition-colors"
          >
            <FaArrowLeft />
            Back to Profile
          </Link>
          
          <div className="flex items-center gap-4 mb-4">
            {userProfile.avatar_url ? (
              <Image
                src={userProfile.avatar_url}
                alt={userProfile.username}
                width={80}
                height={80}
                className="rounded-full border-4 border-purple-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center border-4 border-purple-500">
                <span className="text-white text-3xl font-bold">
                  {userProfile.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold text-white">
                {userProfile.full_name || userProfile.username}'s Gallery
              </h1>
              <p className="text-gray-300 text-lg">
                {items.length} {items.length === 1 ? 'performance' : 'performances'}
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Content */}
        {items.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
            <FaImage className="text-6xl text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No Performances Yet</h2>
            <p className="text-gray-300">
              {userProfile.full_name || userProfile.username} hasn't been featured in any gallery items yet.
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {years.map(year => (
              <div key={year}>
                <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
                  <FaCalendar className="text-purple-400" />
                  {year}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {itemsByYear[parseInt(year)].map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden hover:transform hover:scale-105 transition-all duration-300 border border-white/20"
                    >
                      {/* Image/Video Preview */}
                      <div className="relative h-48 bg-gray-800">
                        {item.type === 'image' ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <FaVideo className="text-6xl text-purple-400" />
                          </div>
                        )}
                        
                        {/* Type Badge */}
                        <div className="absolute top-2 right-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            item.type === 'image' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-red-500 text-white'
                          }`}>
                            {item.type === 'image' ? (
                              <span className="flex items-center gap-1">
                                <FaImage /> Photo
                              </span>
                            ) : (
                              <span className="flex items-center gap-1">
                                <FaVideo /> Video
                              </span>
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-white mb-2">{item.title}</h3>
                        
                        {item.event && (
                          <p className="text-sm text-purple-400 mb-2">
                            📍 {item.event}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400 capitalize">
                            {item.category}
                          </span>
                          
                          {item.type === 'video' && item.video_url && (
                            <a
                              href={item.video_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-purple-400 hover:text-purple-300 underline"
                            >
                              Watch Video
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        {items.length > 0 && (
          <div className="mt-12 bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
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
          </div>
        )}
      </div>
    </div>
  )
}
