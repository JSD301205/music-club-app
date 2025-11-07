'use client'

import { motion } from 'framer-motion'
import { FaBullhorn, FaCalendar, FaTrophy } from 'react-icons/fa'

interface AnnouncementCardProps {
  announcement: any
}

export default function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const getIcon = () => {
    switch (announcement.type) {
      case 'event':
        return <FaCalendar className="text-green-400 text-2xl" />
      case 'achievement':
        return <FaTrophy className="text-yellow-400 text-2xl" />
      default:
        return <FaBullhorn className="text-orange-400 text-2xl" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-orange-500/50 transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        {getIcon()}
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{announcement.title}</h3>
          <p className="text-sm text-gray-400">
            {formatDate(announcement.created_at)}
          </p>
        </div>
      </div>

      {/* Description */}
      {announcement.description && (
        <p className="text-gray-300 leading-relaxed mb-4">
          {announcement.description}
        </p>
      )}

      {/* Metadata */}
      {announcement.metadata && Object.keys(announcement.metadata).length > 0 && (
        <div className="space-y-2">
          {announcement.metadata.link && (
            <a
              href={announcement.metadata.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Learn more</span>
              <span>→</span>
            </a>
          )}
          {announcement.metadata.tags && (
            <div className="flex flex-wrap gap-2">
              {announcement.metadata.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white/10 text-xs text-gray-300 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Priority badge */}
      {announcement.priority > 5 && (
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 border border-red-500/50 rounded-full">
          <span className="text-red-400 text-sm font-semibold">Important</span>
        </div>
      )}
    </motion.div>
  )
}
