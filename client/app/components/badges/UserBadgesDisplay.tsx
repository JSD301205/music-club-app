'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/app/lib/supabase-client'
import { Badge, UserBadge } from '@/app/types/badges.types'
import BadgeDisplay from './BadgeDisplay'
import { FaTrophy } from 'react-icons/fa'

interface UserBadgesDisplayProps {
  userId: string
}

export default function UserBadgesDisplay({ userId }: UserBadgesDisplayProps) {
  const [userBadges, setUserBadges] = useState<(UserBadge & { badge: Badge })[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUserBadges()
  }, [userId])

  const fetchUserBadges = async () => {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select(`
          *,
          badge:badges(*)
        `)
        .eq('user_id', userId)
        .order('awarded_at', { ascending: false })

      if (error) throw error

      // @ts-ignore - Supabase types
      setUserBadges(data || [])
    } catch (error) {
      console.error('Error fetching badges:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-gray-700 rounded-xl"></div>
          ))}
        </div>
      </div>
    )
  }

  if (userBadges.length === 0) {
    return null // Don't show section if no badges
  }

  // Group badges by category
  const badgesByCategory = userBadges.reduce((acc, ub) => {
    const category = ub.badge.category
    if (!acc[category]) acc[category] = []
    acc[category].push(ub)
    return acc
  }, {} as Record<string, typeof userBadges>)

  const categoryNames = {
    events: '🎤 Event Badges',
    jam_sessions: '🎸 Jam Session Badges',
    performances: '🎭 Performance Badges',
    community: '💬 Community Badges',
    milestones: '🎯 Milestone Badges',
    special: '⭐ Special Badges',
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <FaTrophy className="text-yellow-400 text-2xl" />
        <h2 className="text-2xl font-bold text-white">
          Achievements & Badges ({userBadges.length})
        </h2>
      </div>

      {/* Show all badges in categories */}
      {Object.entries(badgesByCategory).map(([category, badges]) => (
        <div key={category} className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">
            {categoryNames[category as keyof typeof categoryNames]}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {badges.map((userBadge) => (
              <BadgeDisplay
                key={userBadge.id}
                badge={userBadge.badge}
                awardedAt={userBadge.awarded_at}
                size="md"
                showTooltip={true}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-white">{userBadges.length}</div>
            <div className="text-sm text-gray-400">Total Badges</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-purple-400">
              {badgesByCategory['performances']?.length || 0}
            </div>
            <div className="text-sm text-gray-400">Performances</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-400">
              {badgesByCategory['events']?.length || 0}
            </div>
            <div className="text-sm text-gray-400">Events</div>
          </div>
          <div className="bg-white/5 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-400">
              {Object.keys(badgesByCategory).length}
            </div>
            <div className="text-sm text-gray-400">Categories</div>
          </div>
        </div>
      </div>
    </div>
  )
}
