'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaPoll, FaChartBar } from 'react-icons/fa'
import { createClient } from '@/app/lib/supabase-client'
import { User } from '@supabase/supabase-js'

interface PollCardProps {
  announcement: any
  user: User | null
  onRefresh: () => void
}

interface Poll {
  id: number
  question: string
  options: string[]
  allow_multiple: boolean
}

interface PollVote {
  selected_options: number[]
}

export default function PollCard({ announcement, user, onRefresh }: PollCardProps) {
  const [poll, setPoll] = useState<Poll | null>(null)
  const [userVote, setUserVote] = useState<PollVote | null>(null)
  const [selectedOptions, setSelectedOptions] = useState<number[]>([])
  const [votesCounts, setVotesCounts] = useState<number[]>([])
  const [totalVotes, setTotalVotes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchPollData()
  }, [])

  const fetchPollData = async () => {
    try {
      // Fetch poll
      const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .select('*')
        .eq('announcement_id', announcement.id)
        .single()

      if (pollError) throw pollError
      
      const poll = pollData as any
      setPoll(poll)

      // Fetch all votes for results
      const { data: votesData } = await supabase
        .from('poll_votes')
        .select('selected_options')
        .eq('poll_id', poll.id)

      if (votesData) {
        // Count votes for each option
        const counts = new Array(poll.options.length).fill(0)
        votesData.forEach((vote: any) => {
          vote.selected_options.forEach((optionIndex: number) => {
            counts[optionIndex]++
          })
        })
        setVotesCounts(counts)
        setTotalVotes(votesData.length)
      }

      // Fetch user's vote if logged in
      if (user) {
        const { data: voteData } = await supabase
          .from('poll_votes')
          .select('*')
          .eq('poll_id', poll.id)
          .eq('user_id', user.id)
          .single()

        if (voteData) {
          const vote = voteData as any
          setUserVote(vote)
          setSelectedOptions(vote.selected_options)
        }
      }
    } catch (error) {
      console.error('Error fetching poll data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOptionToggle = (index: number) => {
    if (userVote) return // Can't change vote after submitting

    if (poll?.allow_multiple) {
      setSelectedOptions(prev =>
        prev.includes(index)
          ? prev.filter(i => i !== index)
          : [...prev, index]
      )
    } else {
      setSelectedOptions([index])
    }
  }

  const handleSubmit = async () => {
    if (!user || !poll || selectedOptions.length === 0) return

    setSubmitting(true)
    try {
      const { error } = await supabase
        .from('poll_votes')
        .upsert({
          poll_id: poll.id,
          user_id: user.id,
          selected_options: selectedOptions,
        } as any)

      if (error) throw error

      // Refresh poll data to show updated results
      await fetchPollData()
    } catch (error) {
      console.error('Error submitting poll vote:', error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/20 rounded w-3/4"></div>
          <div className="h-4 bg-white/20 rounded w-full"></div>
          <div className="h-4 bg-white/20 rounded w-full"></div>
        </div>
      </div>
    )
  }

  if (!poll) return null

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-500/50 transition-all"
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-4">
        <FaPoll className="text-blue-400 text-2xl mt-1" />
        <div className="flex-1">
          <h3 className="text-white font-bold">{announcement.title}</h3>
          <p className="text-sm text-gray-400">
            {poll.allow_multiple ? 'Select multiple' : 'Select one'}
          </p>
        </div>
      </div>

      {/* Question */}
      <p className="text-white text-lg mb-4">{poll.question}</p>

      {/* Options */}
      <div className="space-y-3 mb-4">
        {poll.options.map((option, index) => {
          const isSelected = selectedOptions.includes(index)
          const voteCount = votesCounts[index] || 0
          const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0

          return (
            <div key={index} className="relative">
              <button
                onClick={() => handleOptionToggle(index)}
                disabled={!!userVote || submitting}
                className={`
                  w-full text-left px-4 py-3 rounded-lg font-medium transition-all relative z-10
                  ${isSelected && !userVote ? 'bg-blue-600 text-white ring-2 ring-blue-400' : ''}
                  ${!isSelected && !userVote ? 'bg-white/5 text-gray-300 hover:bg-white/10' : ''}
                  ${userVote ? 'bg-transparent text-white' : ''}
                  ${userVote ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {userVote && (
                    <div className="flex items-center gap-2">
                      <FaChartBar className="text-blue-400" />
                      <span className="text-sm font-semibold">{percentage.toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Vote bar background */}
              {userVote && (
                <div
                  className="absolute top-0 left-0 h-full bg-blue-600/30 rounded-lg transition-all duration-500"
                  style={{ width: `${percentage}%` }}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Submit Button */}
      {!userVote && user && (
        <button
          onClick={handleSubmit}
          disabled={selectedOptions.length === 0 || submitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold
                     hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all transform hover:scale-105"
        >
          {submitting ? 'Submitting...' : 'Submit Vote'}
        </button>
      )}

      {!user && (
        <p className="text-center text-gray-400 text-sm">
          Sign in to vote in polls
        </p>
      )}

      {/* Total Votes */}
      {userVote && (
        <div className="mt-4 text-center text-gray-400 text-sm">
          Total votes: <span className="text-white font-semibold">{totalVotes}</span>
        </div>
      )}
    </motion.div>
  )
}
