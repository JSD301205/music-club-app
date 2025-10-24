'use client';

import { motion } from 'framer-motion';
import { FiMusic, FiMapPin, FiClock, FiUsers, FiMessageCircle } from 'react-icons/fi';
import type { JamPostWithAuthor } from '@/app/lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface JamPostCardProps {
  post: JamPostWithAuthor;
  onClick: () => void;
}

const typeLabels = {
  looking_for_members: 'Looking for Members',
  jam_session: 'Jam Session',
  collaboration: 'Collaboration',
  performance: 'Performance',
};

const typeColors = {
  looking_for_members: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  jam_session: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  collaboration: 'bg-green-500/20 text-green-300 border-green-500/30',
  performance: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
};

const skillLevelColors = {
  beginner: 'bg-green-500/10 text-green-300',
  intermediate: 'bg-yellow-500/10 text-yellow-300',
  advanced: 'bg-red-500/10 text-red-300',
  any: 'bg-gray-500/10 text-gray-300',
};

export default function JamPostCard({ post, onClick }: JamPostCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      onClick={onClick}
      className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Author Avatar */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold">
            {post.avatar_url ? (
              <img
                src={post.avatar_url}
                alt={post.full_name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              getInitials(post.full_name)
            )}
          </div>

          {/* Author Info */}
          <div>
            <h4 className="text-white font-medium">{post.full_name}</h4>
            <p className="text-white/50 text-sm">@{post.username}</p>
          </div>
        </div>

        {/* Type Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
            typeColors[post.type]
          }`}
        >
          {typeLabels[post.type]}
        </span>
      </div>

      {/* Title & Description */}
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
        {post.title}
      </h3>
      <p className="text-white/70 mb-4 line-clamp-2">{post.description}</p>

      {/* Instruments Needed */}
      {post.instruments_needed.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <FiMusic className="text-purple-400 flex-shrink-0" />
          <div className="flex flex-wrap gap-1">
            {post.instruments_needed.slice(0, 3).map((instrument, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded text-xs"
              >
                {instrument}
              </span>
            ))}
            {post.instruments_needed.length > 3 && (
              <span className="px-2 py-1 bg-purple-500/10 text-purple-300 rounded text-xs">
                +{post.instruments_needed.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Genres */}
      {post.genres.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {post.genres.slice(0, 3).map((genre, idx) => (
            <span
              key={idx}
              className="px-2 py-1 bg-blue-500/10 text-blue-300 rounded text-xs"
            >
              {genre}
            </span>
          ))}
          {post.genres.length > 3 && (
            <span className="px-2 py-1 bg-blue-500/10 text-blue-300 rounded text-xs">
              +{post.genres.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {/* Skill Level */}
        <div className="flex items-center gap-2 text-sm">
          <FiUsers className="text-white/50 flex-shrink-0" />
          <span className={`px-2 py-1 rounded text-xs ${skillLevelColors[post.skill_level]}`}>
            {post.skill_level.charAt(0).toUpperCase() + post.skill_level.slice(1)}
          </span>
        </div>

        {/* Location */}
        {post.location && (
          <div className="flex items-center gap-2 text-sm text-white/70">
            <FiMapPin className="text-white/50 flex-shrink-0" />
            <span className="truncate">{post.location}</span>
          </div>
        )}
      </div>

      {/* Available Times */}
      {post.available_times && post.available_times.length > 0 && (
        <div className="flex items-center gap-2 mb-4 text-sm text-white/70">
          <FiClock className="text-white/50 flex-shrink-0" />
          <span className="truncate">{post.available_times[0]}</span>
          {post.available_times.length > 1 && (
            <span className="text-white/50">+{post.available_times.length - 1} more</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-sm text-white/50">
          <FiMessageCircle />
          <span>
            {post.responses_count} {post.responses_count === 1 ? 'response' : 'responses'}
          </span>
        </div>
        <span className="text-xs text-white/50">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </span>
      </div>
    </motion.div>
  );
}
