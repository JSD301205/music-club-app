'use client'

import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { FaUser, FaCog, FaSignOutAlt, FaEnvelope, FaUserPlus } from 'react-icons/fa'
import { useUnreadCount } from '@/app/hooks/useChat'

export default function ProfileDropdown() {
  const { user, profile, signOut } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const unreadCount = useUnreadCount(user?.id)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
    router.refresh()
  }

  // If no user, don't show anything
  if (!user) return null

  // If user exists but no profile, show a basic dropdown with sign out
  if (!profile) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 focus:outline-none"
        >
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center border-2 border-purple-500">
            <span className="text-white font-semibold">
              {user.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <span className="text-white font-medium hidden md:block">{user.email?.split('@')[0]}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-lg rounded-lg shadow-2xl border border-gray-700 py-2 z-50">
            <div className="px-4 py-3 border-b border-gray-700">
              <p className="text-sm font-semibold text-white">{user.email}</p>
              <p className="text-xs text-yellow-400">Profile not set up</p>
            </div>

            <Link
              href="/auth/setup-profile"
              className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <FaUser className="mr-3" />
              Complete Profile
            </Link>

            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
            >
              <FaSignOutAlt className="mr-3" />
              Sign Out
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 focus:outline-none"
      >
        <div className="relative">
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.username}
              width={40}
              height={40}
              className="rounded-full border-2 border-purple-500"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center border-2 border-purple-500">
              <span className="text-white font-semibold">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>
        <span className="text-white font-medium hidden md:block">{profile.username}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-lg rounded-lg shadow-2xl border border-gray-700 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">{profile.full_name || profile.username}</p>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  profile.role === 'member'
                    ? 'bg-purple-600 text-white'
                    : 'bg-pink-600 text-white'
                }`}
                title={profile.role === 'member' ? 'Musician Member' : 'Music Enthusiast'}
              >
                {profile.role === 'member' ? '🎸' : '❤️'}
              </span>
            </div>
            <p className="text-xs text-gray-400 truncate">{user.email}</p>
          </div>

          <Link
            href={`/community/${profile.username}`}
            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <FaUser className="mr-3" />
            My Profile
          </Link>

          <Link
            href="/community/messages"
            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors relative"
            onClick={() => setIsOpen(false)}
          >
            <FaEnvelope className="mr-3" />
            Messages
            {unreadCount > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                {unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/community/message-requests"
            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <FaUserPlus className="mr-3" />
            Message Requests
          </Link>

          <Link
            href="/settings"
            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <FaCog className="mr-3" />
            Settings
          </Link>

          <div className="border-t border-gray-700 my-2"></div>

          <button
            onClick={handleSignOut}
            className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
          >
            <FaSignOutAlt className="mr-3" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
