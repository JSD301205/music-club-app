'use client'

import { useState } from 'react'
import { FaGuitar, FaHeart, FaQuestionCircle } from 'react-icons/fa'
import { UserRole } from '@/app/types/database.types'

interface RoleSelectorProps {
  selectedRole: UserRole
  onRoleChange: (role: UserRole) => void
}

export default function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  const [showMemberTooltip, setShowMemberTooltip] = useState(false)
  const [showEnthusiastTooltip, setShowEnthusiastTooltip] = useState(false)

  const roles = [
    {
      value: 'member' as UserRole,
      icon: FaGuitar,
      title: 'Member',
      description: 'I play instruments or sing',
      tooltip: 'Members are Crew, i.e. Musicians who play instruments, sing, or actively create music. You\'ll be visible in the community directory and can connect with fellow musicians.',
      features: [
        'Visible in community',
        'Message other members',
        'Post on jam board',
        'Join music sessions',
      ],
      color: 'purple',
    },
    {
      value: 'enthusiast' as UserRole,
      icon: FaHeart,
      title: 'Enthusiast',
      description: 'I appreciate and love music',
      tooltip: 'Music Enthusiasts are people who love music but may not actively play instruments. You can explore, learn, and request to connect with members.',
      features: [
        'Browse community',
        'View events',
        'Request to message members',
        'Learn and explore',
      ],
      color: 'blue',
    },
  ]

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-white mb-2">
        Choose Your Role
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => {
          const Icon = role.icon
          const isSelected = selectedRole === role.value

          return (
            <div key={role.value} className="relative">
              <button
                type="button"
                onClick={() => onRoleChange(role.value)}
                className={`w-full p-6 rounded-xl border-2 transition-all text-left relative ${
                  isSelected
                    ? `bg-${role.color}-600/20 border-${role.color}-500 ring-2 ring-${role.color}-500`
                    : 'bg-gray-800/30 border-gray-600 hover:border-gray-500'
                }`}
              >
                {/* Radio indicator */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? `border-${role.color}-500 bg-${role.color}-500`
                        : 'border-gray-500'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                </div>

                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
                    isSelected
                      ? `bg-${role.color}-500`
                      : 'bg-gray-700'
                  }`}
                >
                  <Icon className="text-white text-xl" />
                </div>

                {/* Title with tooltip */}
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-white">{role.title}</h3>
                  <div className="relative">
                    <FaQuestionCircle
                      className="text-gray-400 hover:text-gray-300 cursor-help text-sm"
                      onMouseEnter={() =>
                        role.value === 'member'
                          ? setShowMemberTooltip(true)
                          : setShowEnthusiastTooltip(true)
                      }
                      onMouseLeave={() => {
                        setShowMemberTooltip(false)
                        setShowEnthusiastTooltip(false)
                      }}
                    />
                    {((role.value === 'member' && showMemberTooltip) ||
                      (role.value === 'enthusiast' && showEnthusiastTooltip)) && (
                      <div className="absolute left-0 top-6 w-64 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl z-10 text-sm">
                        <p className="text-gray-300 mb-2">{role.tooltip}</p>
                        <ul className="space-y-1 text-gray-400 text-xs">
                          {role.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                              <span className={`text-${role.color}-500`}>✓</span>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-3">{role.description}</p>

                {/* Features list */}
                <ul className="space-y-1">
                  {role.features.slice(0, 2).map((feature, idx) => (
                    <li
                      key={idx}
                      className="text-gray-400 text-xs flex items-center gap-2"
                    >
                      <span className={`text-${role.color}-500`}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            </div>
          )
        })}
      </div>

      <p className="text-gray-400 text-xs text-center mt-4">
        💡 You can change your role later in settings
      </p>
    </div>
  )
}

