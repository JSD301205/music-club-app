'use client'

import { Badge } from '@/app/types/badges.types'

interface BadgeDisplayProps {
  badge: Badge
  awardedAt?: string
  size?: 'sm' | 'md' | 'lg'
  showTooltip?: boolean
}

const colorClasses = {
  blue: 'bg-blue-500/20 border-blue-500 text-blue-400',
  purple: 'bg-purple-500/20 border-purple-500 text-purple-400',
  green: 'bg-green-500/20 border-green-500 text-green-400',
  orange: 'bg-orange-500/20 border-orange-500 text-orange-400',
  gold: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
  pink: 'bg-pink-500/20 border-pink-500 text-pink-400',
  yellow: 'bg-yellow-500/20 border-yellow-500 text-yellow-400',
  cyan: 'bg-cyan-500/20 border-cyan-500 text-cyan-400',
  red: 'bg-red-500/20 border-red-500 text-red-400',
}

const sizeClasses = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-4xl',
}

export default function BadgeDisplay({ badge, awardedAt, size = 'md', showTooltip = true }: BadgeDisplayProps) {
  const colorClass = colorClasses[badge.color as keyof typeof colorClasses] || colorClasses.purple
  const sizeClass = sizeClasses[size]

  const formattedDate = awardedAt
    ? new Date(awardedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div className="group relative">
      <div
        className={`
          ${colorClass}
          border-2 rounded-xl p-4 flex flex-col items-center justify-center
          transition-all duration-300 hover:scale-110 hover:shadow-lg
          ${size === 'sm' ? 'p-2' : size === 'lg' ? 'p-6' : 'p-4'}
        `}
      >
        <div className={sizeClass}>{badge.icon}</div>
        {size !== 'sm' && (
          <div className="mt-2 text-center">
            <p className="font-semibold text-sm text-white">{badge.name}</p>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-xl border border-gray-700 min-w-max max-w-xs">
            <p className="font-bold text-sm mb-1">{badge.name}</p>
            <p className="text-xs text-gray-300 mb-1">{badge.description}</p>
            {formattedDate && (
              <p className="text-xs text-gray-400">Earned on {formattedDate}</p>
            )}
          </div>
          <div className="w-2 h-2 bg-gray-900 transform rotate-45 absolute left-1/2 -translate-x-1/2 -bottom-1 border-r border-b border-gray-700"></div>
        </div>
      )}
    </div>
  )
}
