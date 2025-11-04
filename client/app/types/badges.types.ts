export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  category: 'events' | 'jam_sessions' | 'performances' | 'community' | 'milestones' | 'special'
  requirement_type: 'event_attendance' | 'jam_posts' | 'performances' | 'gallery_appearances' | 'messages_sent' | 'custom'
  requirement_count: number
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  awarded_at: string
  progress: number
  badge?: Badge // Populated when joining with badges table
}

export interface BadgeStats {
  total_badges: number
  badges_by_category: {
    events: number
    jam_sessions: number
    performances: number
    community: number
    milestones: number
    special: number
  }
  recent_badges: UserBadge[]
}
