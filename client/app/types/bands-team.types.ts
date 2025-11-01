// Database types for Bands and Team Members

export interface Band {
  id: number
  name: string
  image: string
  description: string
  order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface BandMember {
  id: number
  band_id: number
  name: string
  instrument: string
  image: string
  order: number
  created_at: string
  updated_at: string
}

export interface BandWithMembers extends Band {
  band_members: BandMember[]
}

export interface TeamMember {
  id: number
  name: string
  role: string // 'Core', 'Coordinator', 'Crew', 'Mentor'
  position: string | null // Specific position like 'Pianist', 'Vocalist'
  image: string
  bio: string
  year: number // 2024, 2025, etc.
  category: 'core' | 'coordinator' | 'crew' | 'mentor'
  social_links: {
    github?: string
    linkedin?: string
    instagram?: string
  }
  order: number
  is_published: boolean
  created_at: string
  updated_at: string
}

// Request/Response types for API/hooks
export interface CreateBandInput {
  name: string
  image: string
  description: string
  order?: number
  is_published?: boolean
}

export interface UpdateBandInput extends Partial<CreateBandInput> {
  id: number
}

export interface CreateBandMemberInput {
  band_id: number
  name: string
  instrument: string
  image: string
  order?: number
}

export interface UpdateBandMemberInput extends Partial<Omit<CreateBandMemberInput, 'band_id'>> {
  id: number
}

export interface CreateTeamMemberInput {
  name: string
  role: string
  position?: string | null
  image: string
  bio: string
  year: number
  category: 'core' | 'coordinator' | 'crew' | 'mentor'
  social_links?: {
    github?: string
    linkedin?: string
    instagram?: string
  }
  order?: number
  is_published?: boolean
}

export interface UpdateTeamMemberInput extends Partial<CreateTeamMemberInput> {
  id: number
}

// Filter types
export interface BandsFilter {
  is_published?: boolean
  search?: string
}

export interface TeamMembersFilter {
  year?: number
  category?: 'core' | 'coordinator' | 'crew' | 'mentor'
  is_published?: boolean
  search?: string
}
