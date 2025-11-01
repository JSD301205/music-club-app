'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useResources } from '../hooks/useResources'
import { ResourceCategory, SkillLevel, ResourceFilters } from '../types/resources'
import { FaBook, FaMusic, FaFileAudio, FaGraduationCap, FaExternalLinkAlt, FaDownload, FaEye, FaTag } from 'react-icons/fa'

const CATEGORIES: { value: ResourceCategory; label: string; icon: any }[] = [
  { value: 'tutorial', label: 'Tutorials', icon: FaGraduationCap },
  { value: 'sheet_music', label: 'Sheet Music', icon: FaFileAudio },
  { value: 'backing_track', label: 'Backing Tracks', icon: FaMusic },
  { value: 'lesson', label: 'Lessons', icon: FaBook },
  { value: 'other', label: 'Other', icon: FaTag },
]

const INSTRUMENTS = [
  'All',
  'Guitar',
  'Piano',
  'Drums',
  'Bass',
  'Vocals',
  'Violin',
  'General',
]

const SKILL_LEVELS: { value: SkillLevel | 'all'; label: string }[] = [
  { value: 'all', label: 'All Levels' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export default function ResourcesPage() {
  const [filters, setFilters] = useState<ResourceFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const { resources, loading, error } = useResources(filters)

  const handleCategoryFilter = (category: ResourceCategory | undefined) => {
    setFilters({ ...filters, category })
  }

  const handleInstrumentFilter = (instrument: string) => {
    setFilters({ ...filters, instrument: instrument === 'All' ? undefined : instrument.toLowerCase() })
  }

  const handleSkillLevelFilter = (level: SkillLevel | 'all') => {
    setFilters({ ...filters, skill_level: level === 'all' ? undefined : level })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setFilters({ ...filters, search: searchQuery || undefined })
  }

  const getCategoryIcon = (category: string) => {
    const cat = CATEGORIES.find(c => c.value === category)
    return cat?.icon || FaTag
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      tutorial: 'bg-blue-100 text-blue-700',
      sheet_music: 'bg-purple-100 text-purple-700',
      backing_track: 'bg-green-100 text-green-700',
      lesson: 'bg-orange-100 text-orange-700',
      other: 'bg-gray-100 text-gray-700',
    }
    return colors[category] || colors.other
  }

  const getSkillLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      beginner: 'bg-green-50 text-green-600 border-green-200',
      intermediate: 'bg-yellow-50 text-yellow-600 border-yellow-200',
      advanced: 'bg-red-50 text-red-600 border-red-200',
      all: 'bg-blue-50 text-blue-600 border-blue-200',
    }
    return colors[level] || colors.all
  }

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(1)} KB`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black pt-20">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Music Resource Library
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Curated collection of tutorials, sheet music, backing tracks, and more
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
          {/* Search */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Search
              </button>
              {filters.search && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setFilters({ ...filters, search: undefined })
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Category Filter */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryFilter(undefined)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  !filters.category
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => handleCategoryFilter(cat.value)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    filters.category === cat.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <cat.icon size={16} />
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Instrument Filter */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Instrument</h3>
            <div className="flex flex-wrap gap-2">
              {INSTRUMENTS.map((inst) => (
                <button
                  key={inst}
                  onClick={() => handleInstrumentFilter(inst)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    (inst === 'All' && !filters.instrument) || filters.instrument === inst.toLowerCase()
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {inst}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Level Filter */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Skill Level</h3>
            <div className="flex flex-wrap gap-2">
              {SKILL_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => handleSkillLevelFilter(level.value)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    (!filters.skill_level && level.value === 'all') || filters.skill_level === level.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
            {resources.length} {resources.length === 1 ? 'resource' : 'resources'} found
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading resources...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Resources Grid */}
        {!loading && !error && resources.length === 0 && (
          <div className="text-center py-12">
            <FaBook className="mx-auto h-16 w-16 text-gray-400" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">No resources found with current filters</p>
          </div>
        )}

        {!loading && !error && resources.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => {
              const CategoryIcon = getCategoryIcon(resource.category)
              return (
                <div
                  key={resource.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200 dark:border-gray-700"
                >
                  {/* Featured Badge */}
                  {resource.is_featured && (
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-semibold px-3 py-1">
                      ⭐ Featured
                    </div>
                  )}

                  <div className="p-6">
                    {/* Category & Type */}
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(resource.category)}`}>
                        <CategoryIcon size={12} />
                        {resource.category.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSkillLevelColor(resource.skill_level)}`}>
                        {resource.skill_level}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {resource.title}
                    </h3>

                    {/* Description */}
                    {resource.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {resource.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      {resource.instrument && (
                        <span className="capitalize">{resource.instrument}</span>
                      )}
                      {resource.views_count > 0 && (
                        <span className="flex items-center gap-1">
                          <FaEye size={12} />
                          {resource.views_count}
                        </span>
                      )}
                      {resource.file_size && (
                        <span>{formatFileSize(resource.file_size)}</span>
                      )}
                    </div>

                    {/* Tags */}
                    {resource.tags && resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {resource.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {resource.tags.length > 3 && (
                          <span className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                            +{resource.tags.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Button */}
                    {resource.resource_url && (
                      <a
                        href={resource.resource_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 w-full justify-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        {resource.resource_type === 'file' ? (
                          <>
                            <FaDownload size={16} />
                            Download
                          </>
                        ) : (
                          <>
                            <FaExternalLinkAlt size={16} />
                            View Resource
                          </>
                        )}
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
