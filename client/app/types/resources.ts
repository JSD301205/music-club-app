// TypeScript types for Music Resource Library

export interface Resource {
  id: string
  title: string
  description: string | null
  category: ResourceCategory
  instrument: string | null
  skill_level: SkillLevel
  resource_type: ResourceType
  resource_url: string | null
  file_path: string | null
  file_name: string | null
  file_size: number | null
  thumbnail_url: string | null
  tags: string[] | null
  created_by: string | null
  created_at: string
  updated_at: string
  views_count: number
  is_featured: boolean
  is_published: boolean
}

export type ResourceCategory =
  | 'tutorial'
  | 'sheet_music'
  | 'backing_track'
  | 'lesson'
  | 'other'

export type ResourceType = 'link' | 'file' | 'embedded_video'

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'all'

export interface ResourceFilters {
  category?: ResourceCategory
  instrument?: string
  skill_level?: SkillLevel
  search?: string
  featured?: boolean
}
