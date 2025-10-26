import { createClient } from '@/app/lib/supabase-server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { FaGuitar, FaMusic, FaSpotify, FaEnvelope, FaCalendar } from 'react-icons/fa'

export default async function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !profile) {
    notFound()
  }

  // Cast to any to avoid TypeScript errors with Supabase types
  const userProfile: any = profile

  // @ts-ignore - Supabase profile type
  const joinedDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 h-32"></div>

          <div className="px-8 pb-8">
            {/* Profile Picture */}
            <div className="flex flex-col md:flex-row gap-6 items-start -mt-16 mb-6">
              {userProfile.avatar_url ? (
                <Image
                  src={userProfile.avatar_url}
                  alt={userProfile.username}
                  width={150}
                  height={150}
                  className="rounded-full border-8 border-gray-900"
                />
              ) : (
                <div className="w-[150px] h-[150px] rounded-full bg-purple-600 flex items-center justify-center border-8 border-gray-900">
                  <span className="text-white text-5xl font-bold">
                    {userProfile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}

              <div className="flex-1 mt-16 md:mt-20">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white">
                    {userProfile.full_name || userProfile.username}
                  </h1>
                  {/* Role Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      userProfile.role === 'admin'
                        ? 'bg-orange-600 text-white'
                        : userProfile.role === 'member'
                        ? 'bg-purple-600 text-white'
                        : 'bg-pink-600 text-white'
                    }`}
                    title={
                      userProfile.role === 'admin'
                        ? 'Admin'
                        : userProfile.role === 'member'
                        ? 'Musician Member'
                        : 'Music Enthusiast'
                    }
                  >
                    {userProfile.role === 'admin'
                      ? '🛡️ Admin'
                      : userProfile.role === 'member'
                      ? '🎸 Member'
                      : '❤️ Enthusiast'}
                  </span>
                </div>
                <p className="text-gray-300 text-lg mb-4">@{userProfile.username}</p>

                <div className="flex flex-wrap gap-4 items-center">
                  {userProfile.batch_year && (
                    <div className="flex items-center gap-2 text-purple-400">
                      <FaCalendar />
                      <span>Batch {userProfile.batch_year}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaCalendar />
                    <span>Joined {joinedDate}</span>
                  </div>
                </div>
              </div>

              {/* Message Button */}
              {/* Hide Send Message button if viewing own profile */}
              {typeof window !== 'undefined' &&
                userProfile.username !== (typeof window !== 'undefined' ? (window.localStorage.getItem('username') || '') : '') && (
                  <div className="mt-16 md:mt-20">
                    <Link
                      href={`/community/messages?user=${userProfile.username}`}
                      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-all"
                    >
                      <FaEnvelope />
                      Send Message
                    </Link>
                  </div>
                )}
            </div>

            {/* Bio */}
            {userProfile.bio && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">About</h2>
                <p className="text-gray-300 text-lg leading-relaxed">{userProfile.bio}</p>
              </div>
            )}

            {/* Instruments */}
            {(userProfile.instruments as string[])?.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <FaGuitar className="text-purple-400 text-2xl" />
                  <h2 className="text-2xl font-bold text-white">Instruments</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(userProfile.instruments as string[]).map((instrument) => (
                    <span
                      key={instrument}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium"
                    >
                      {instrument}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Musical Interests */}
            {(userProfile.musical_interests as string[])?.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <FaMusic className="text-blue-400 text-2xl" />
                  <h2 className="text-2xl font-bold text-white">Favorite Genres</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(userProfile.musical_interests as string[]).map((genre) => (
                    <span
                      key={genre}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {Array.isArray(userProfile.social_links) && userProfile.social_links.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4">Social Links</h2>
                <div className="flex flex-wrap gap-3">
                  {userProfile.social_links.map((link: any, idx: number) => (
                    link && (link.url || link.title) ? (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all"
                      >
                        {link.title ? link.title : 'Link'}
                      </a>
                    ) : null
                  ))}
                </div>
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
