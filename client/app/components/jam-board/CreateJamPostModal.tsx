'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiMusic, FiMapPin, FiClock, FiPlus } from 'react-icons/fi';
import type { CreateJamPostData } from '@/app/lib/api/jam-posts';

interface CreateJamPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJamPostData) => Promise<void>;
}

const INSTRUMENTS = [
  'Guitar', 'Bass', 'Drums', 'Piano', 'Keyboard', 'Violin', 'Vocals',
  'Saxophone', 'Trumpet', 'Flute', 'Tabla', 'Harmonium', 'Sitar', 'DJ',
];

const GENRES = [
  'Rock', 'Pop', 'Jazz', 'Classical', 'Hip Hop', 'EDM', 'Blues', 'Country',
  'R&B', 'Metal', 'Indie', 'Folk', 'Reggae', 'Soul', 'Fusion',
];

export default function CreateJamPostModal({ isOpen, onClose, onSubmit }: CreateJamPostModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<CreateJamPostData['type']>('jam_session');
  const [skillLevel, setSkillLevel] = useState<CreateJamPostData['skill_level']>('any');
  const [location, setLocation] = useState('');
  const [instrumentsNeeded, setInstrumentsNeeded] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [newTime, setNewTime] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (instrumentsNeeded.length === 0) {
      setError('Please select at least one instrument');
      return;
    }

    if (genres.length === 0) {
      setError('Please select at least one genre');
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        title,
        description,
        type,
        skill_level: skillLevel,
        location: location || undefined,
        instruments_needed: instrumentsNeeded,
        genres,
        available_times: availableTimes.length > 0 ? availableTimes : undefined,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setType('jam_session');
      setSkillLevel('any');
      setLocation('');
      setInstrumentsNeeded([]);
      setGenres([]);
      setAvailableTimes([]);
      setNewTime('');

      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const toggleInstrument = (instrument: string) => {
    setInstrumentsNeeded((prev) =>
      prev.includes(instrument)
        ? prev.filter((i) => i !== instrument)
        : [...prev, instrument]
    );
  };

  const toggleGenre = (genre: string) => {
    setGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const addTime = () => {
    if (newTime.trim() && !availableTimes.includes(newTime.trim())) {
      setAvailableTimes([...availableTimes, newTime.trim()]);
      setNewTime('');
    }
  };

  const removeTime = (time: string) => {
    setAvailableTimes(availableTimes.filter((t) => t !== time));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <h2 className="text-2xl font-bold text-white">Create Jam Post</h2>
                  <button
                    onClick={onClose}
                    className="text-white/50 hover:text-white transition-colors"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Post Type */}
                  <div>
                    <label className="block text-white font-medium mb-2">Post Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { value: 'looking_for_members', label: 'Looking for Members' },
                        { value: 'jam_session', label: 'Jam Session' },
                        { value: 'collaboration', label: 'Collaboration' },
                        { value: 'performance', label: 'Performance' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setType(option.value as any)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            type === option.value
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-white font-medium mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      maxLength={100}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Looking for guitarist for rock band"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-white font-medium mb-2">
                      Description *
                    </label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                      placeholder="Describe what you're looking for..."
                    />
                    <p className="text-white/50 text-sm mt-1">
                      {description.length}/500 characters
                    </p>
                  </div>

                  {/* Instruments Needed */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      <FiMusic className="inline mr-2" />
                      Instruments Needed *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {INSTRUMENTS.map((instrument) => (
                        <button
                          key={instrument}
                          type="button"
                          onClick={() => toggleInstrument(instrument)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            instrumentsNeeded.includes(instrument)
                              ? 'bg-purple-600 text-white'
                              : 'bg-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {instrument}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Genres */}
                  <div>
                    <label className="block text-white font-medium mb-2">Genres *</label>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map((genre) => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => toggleGenre(genre)}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                            genres.includes(genre)
                              ? 'bg-blue-600 text-white'
                              : 'bg-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skill Level */}
                  <div>
                    <label className="block text-white font-medium mb-2">Skill Level</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 'any', label: 'Any' },
                        { value: 'beginner', label: 'Beginner' },
                        { value: 'intermediate', label: 'Intermediate' },
                        { value: 'advanced', label: 'Advanced' },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSkillLevel(option.value as any)}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            skillLevel === option.value
                              ? 'bg-green-600 text-white'
                              : 'bg-white/5 text-white/70 hover:bg-white/10'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-white font-medium mb-2">
                      <FiMapPin className="inline mr-2" />
                      Location (optional)
                    </label>
                    <input
                      type="text"
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g., Music Room, Campus"
                    />
                  </div>

                  {/* Available Times */}
                  <div>
                    <label className="block text-white font-medium mb-2">
                      <FiClock className="inline mr-2" />
                      Available Times (optional)
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newTime}
                        onChange={(e) => setNewTime(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTime())}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., Weekends 4-6 PM"
                      />
                      <button
                        type="button"
                        onClick={addTime}
                        className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        <FiPlus />
                      </button>
                    </div>
                    {availableTimes.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {availableTimes.map((time, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm flex items-center gap-2"
                          >
                            {time}
                            <button
                              type="button"
                              onClick={() => removeTime(time)}
                              className="text-blue-300 hover:text-white"
                            >
                              <FiX size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Creating...' : 'Create Post'}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
