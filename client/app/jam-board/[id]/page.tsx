'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { 
  FiArrowLeft, 
  FiMapPin, 
  FiClock, 
  FiMusic, 
  FiUser, 
  FiMessageCircle,
  FiCheckCircle,
  FiX
} from 'react-icons/fi';
import { useAuth } from '@/app/contexts/AuthContext';
import { getJamPostById, respondToJamPost, updateJamPost } from '@/app/lib/api/jam-posts';
import type { JamPostWithAuthor, JamPostResponseWithUser } from '@/app/lib/api/jam-posts';

export default function JamPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useAuth();
  const [post, setPost] = useState<JamPostWithAuthor | null>(null);
  const [responses, setResponses] = useState<JamPostResponseWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [error, setError] = useState('');
  const [hasResponded, setHasResponded] = useState(false);

  const postId = params.id as string;

  useEffect(() => {
    if (postId) {
      loadPost();
    }
  }, [postId]);

  const loadPost = async () => {
    try {
      console.log('Loading post with ID:', postId);
      const data = await getJamPostById(parseInt(postId));
      console.log('Post data loaded:', data);
      setPost(data.post);
      setResponses(data.responses);
      
      // Check if current user has already responded
      if (user) {
        const userResponse = data.responses.find((r: any) => r.user_id === user.id);
        setHasResponded(!!userResponse);
      }
    } catch (error: any) {
      console.error('Error loading post:', error);
      setError(error.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || hasResponded) return;

    setResponding(true);
    setError('');

    try {
      await respondToJamPost(parseInt(postId), user.id, responseMessage);
      setResponseMessage('');
      setHasResponded(true);
      await loadPost(); // Reload to get updated responses
    } catch (error: any) {
      setError(error.message || 'Failed to send response');
    } finally {
      setResponding(false);
    }
  };

  const handleClosePost = async () => {
    if (!post || !user || post.author_id !== user.id) return;

    try {
      await updateJamPost(post.id, user.id, { status: 'closed' });
      await loadPost();
    } catch (error: any) {
      setError('Failed to close post');
    }
  };

  const handleReopenPost = async () => {
    if (!post || !user || post.author_id !== user.id) return;

    try {
      await updateJamPost(post.id, user.id, { status: 'open' });
      await loadPost();
    } catch (error: any) {
      setError('Failed to reopen post');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
          <Link href="/jam-board" className="text-purple-300 hover:text-purple-200">
            Back to Jam Board
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = user?.id === post.author_id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-gray-900 py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          href="/jam-board"
          className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
        >
          <FiArrowLeft />
          <span>Back to Jam Board</span>
        </Link>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Main Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8 mb-6"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  post.status === 'open' 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-gray-500/20 text-gray-300'
                }`}>
                  {post.status.toUpperCase()}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300">
                  {post.type.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{post.title}</h1>
              <div className="flex items-center gap-4 text-white/70 text-sm">
                <div className="flex items-center gap-2">
                  <FiUser className="w-4 h-4" />
                  <Link 
                    href={`/community/${post.username}`}
                    className="hover:text-purple-300 transition-colors"
                  >
                    {post.username}
                  </Link>
                </div>
                <span>•</span>
                <span>{formatDistanceToNow(new Date(post.created_at))} ago</span>
              </div>
            </div>

            {/* Author Actions */}
            {isAuthor && (
              <div className="flex gap-2">
                {post.status === 'open' ? (
                  <button
                    onClick={handleClosePost}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-500/20 text-gray-300 rounded-lg hover:bg-gray-500/30 transition-colors text-sm"
                  >
                    <FiX className="w-4 h-4" />
                    Close Post
                  </button>
                ) : (
                  <button
                    onClick={handleReopenPost}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors text-sm"
                  >
                    <FiCheckCircle className="w-4 h-4" />
                    Reopen Post
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <p className="text-white/90 text-lg mb-6 whitespace-pre-wrap">
            {post.description}
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Instruments Needed */}
            <div>
              <h3 className="text-white/70 text-sm font-semibold mb-2 flex items-center gap-2">
                <FiMusic className="w-4 h-4" />
                Instruments Needed
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.instruments_needed.map((instrument: string) => (
                  <span
                    key={instrument}
                    className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                  >
                    {instrument}
                  </span>
                ))}
              </div>
            </div>

            {/* Genres */}
            <div>
              <h3 className="text-white/70 text-sm font-semibold mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {post.genres.map((genre: string) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Skill Level */}
            <div>
              <h3 className="text-white/70 text-sm font-semibold mb-2">Skill Level</h3>
              <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-sm">
                {post.skill_level.charAt(0).toUpperCase() + post.skill_level.slice(1)}
              </span>
            </div>

            {/* Location */}
            {post.location && (
              <div>
                <h3 className="text-white/70 text-sm font-semibold mb-2 flex items-center gap-2">
                  <FiMapPin className="w-4 h-4" />
                  Location
                </h3>
                <p className="text-white/90">{post.location}</p>
              </div>
            )}
          </div>

          {/* Available Times */}
          {post.available_times && post.available_times.length > 0 && (
            <div>
              <h3 className="text-white/70 text-sm font-semibold mb-2 flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                Available Times
              </h3>
              <div className="flex flex-wrap gap-2">
                {post.available_times.map((time: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-500/20 text-green-300 rounded-lg text-sm"
                  >
                    {time}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Responses Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 p-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <FiMessageCircle />
            Responses ({responses.length})
          </h2>

          {/* Response Form (if not author and not responded) */}
          {user && !isAuthor && !hasResponded && post.status === 'open' && (
            <form onSubmit={handleRespond} className="mb-6">
              <textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                placeholder="Send a message to the author..."
                rows={3}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                required
              />
              <button
                type="submit"
                disabled={responding}
                className="mt-3 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
              >
                {responding ? 'Sending...' : 'Send Response'}
              </button>
            </form>
          )}

          {/* Already Responded Message */}
          {hasResponded && (
            <div className="bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-lg mb-6">
              You've already responded to this post!
            </div>
          )}

          {/* Login Required Message */}
          {!user && (
            <div className="bg-blue-500/20 border border-blue-500/50 text-blue-200 px-4 py-3 rounded-lg mb-6">
              <Link href="/auth/login" className="font-semibold hover:underline">
                Login
              </Link>{' '}
              to respond to this post
            </div>
          )}

          {/* Responses List */}
          {responses.length === 0 ? (
            <p className="text-white/50 text-center py-8">No responses yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <motion.div
                  key={response.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <Link
                      href={`/community/${response.username}`}
                      className="font-semibold text-purple-300 hover:text-purple-200 transition-colors"
                    >
                      {response.username}
                    </Link>
                    <span className="text-white/50 text-sm">
                      {formatDistanceToNow(new Date(response.created_at))} ago
                    </span>
                  </div>
                  {response.message && (
                    <p className="text-white/80">{response.message}</p>
                  )}
                  
                  {/* Contact Button for Author */}
                  {isAuthor && (
                    <Link
                      href={`/community/${response.username}`}
                      className="mt-3 inline-block text-sm text-blue-300 hover:text-blue-200 transition-colors"
                    >
                      View Profile →
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
