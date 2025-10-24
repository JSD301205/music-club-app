'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiPlus, FiSearch, FiFilter, FiX } from 'react-icons/fi';
import { useAuth } from '@/app/contexts/AuthContext';
import JamPostCard from '@/app/components/jam-board/JamPostCard';
import CreateJamPostModal from '@/app/components/jam-board/CreateJamPostModal';
import {
  getJamPosts,
  createJamPost,
  type CreateJamPostData,
  type JamPostFilters,
} from '@/app/lib/api/jam-posts';
import type { JamPostWithAuthor } from '@/app/lib/supabase';
import { INSTRUMENTS, GENRES } from '@/app/constants/music';

export default function JamBoardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [posts, setPosts] = useState<JamPostWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('open');
  const [skillLevelFilter, setSkillLevelFilter] = useState<string>('');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  useEffect(() => {
    loadPosts();
  }, [searchQuery, typeFilter, statusFilter, skillLevelFilter, selectedInstruments, selectedGenres]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const filters: JamPostFilters = {
        search: searchQuery || undefined,
        type: typeFilter || undefined,
        status: statusFilter || undefined,
        skill_level: skillLevelFilter || undefined,
        instruments: selectedInstruments.length > 0 ? selectedInstruments : undefined,
        genres: selectedGenres.length > 0 ? selectedGenres : undefined,
      };
      const data = await getJamPosts(filters);
      setPosts(data);
    } catch (error) {
      console.error('Error loading jam posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (data: CreateJamPostData) => {
    if (!user) return;
    await createJamPost(user.id, data);
    await loadPosts();
  };

  const toggleInstrumentFilter = (instrument: string) => {
    setSelectedInstruments((prev) =>
      prev.includes(instrument)
        ? prev.filter((i) => i !== instrument)
        : [...prev, instrument]
    );
  };

  const toggleGenreFilter = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('');
    setStatusFilter('open');
    setSkillLevelFilter('');
    setSelectedInstruments([]);
    setSelectedGenres([]);
  };

  const activeFiltersCount =
    (typeFilter ? 1 : 0) +
    (statusFilter && statusFilter !== 'open' ? 1 : 0) +
    (skillLevelFilter ? 1 : 0) +
    selectedInstruments.length +
    selectedGenres.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 pt-20 pb-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🎸 Jam Board</h1>
              <p className="text-white/70">
                Find musicians, jam sessions, and collaboration opportunities
              </p>
            </div>

            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
              >
                <FiPlus />
                Create Post
              </button>
            )}
          </motion.div>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8"
        >
          {/* Search Bar */}
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search posts..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              <FiFilter />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 pt-4 border-t border-white/10"
            >
              {/* Type Filter */}
              <div>
                <label className="block text-white font-medium mb-2">Post Type</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTypeFilter('')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      typeFilter === ''
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    All
                  </button>
                  {[
                    { value: 'looking_for_members', label: 'Looking for Members' },
                    { value: 'jam_session', label: 'Jam Session' },
                    { value: 'collaboration', label: 'Collaboration' },
                    { value: 'performance', label: 'Performance' },
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setTypeFilter(type.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        typeFilter === type.value
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-white font-medium mb-2">Status</label>
                <div className="flex gap-2">
                  {[
                    { value: 'open', label: 'Open' },
                    { value: 'filled', label: 'Filled' },
                    { value: 'closed', label: 'Closed' },
                  ].map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setStatusFilter(status.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        statusFilter === status.value
                          ? 'bg-green-600 text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skill Level Filter */}
              <div>
                <label className="block text-white font-medium mb-2">Skill Level</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSkillLevelFilter('')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      skillLevelFilter === ''
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    All
                  </button>
                  {[
                    { value: 'beginner', label: 'Beginner' },
                    { value: 'intermediate', label: 'Intermediate' },
                    { value: 'advanced', label: 'Advanced' },
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setSkillLevelFilter(level.value)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        skillLevelFilter === level.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Instruments Filter */}
              <div>
                <label className="block text-white font-medium mb-2">Instruments</label>
                <div className="flex flex-wrap gap-2">
                  {INSTRUMENTS.map((instrument) => (
                    <button
                      key={instrument}
                      onClick={() => toggleInstrumentFilter(instrument)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedInstruments.includes(instrument)
                          ? 'bg-purple-600 text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {instrument}
                    </button>
                  ))}
                </div>
              </div>

              {/* Genres Filter */}
              <div>
                <label className="block text-white font-medium mb-2">Genres</label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleGenreFilter(genre)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedGenres.includes(genre)
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  <FiX />
                  Clear All Filters
                </button>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-white/70 text-lg mb-4">
              No posts found matching your filters
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-purple-300 hover:text-purple-200 font-medium"
              >
                Clear filters to see all posts
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <JamPostCard
                  post={post}
                  onClick={() => router.push(`/jam-board/${post.id}`)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      <CreateJamPostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
}
