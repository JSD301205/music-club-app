'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaQuestionCircle, FaCheck, FaTimes, FaTrophy } from 'react-icons/fa'
import { createClient } from '@/app/lib/supabase-client'
import { User } from '@supabase/supabase-js'

interface QuizCardProps {
  announcement: any
  user: User | null
  onRefresh: () => void
}

interface Question {
  id: number
  question: string
  options: string[]
  correct_answer: string
  explanation: string
  difficulty: string
  category: string
}

interface UserResponse {
  answer: string
  is_correct: boolean
}

export default function QuizCard({ announcement, user, onRefresh }: QuizCardProps) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [userResponse, setUserResponse] = useState<UserResponse | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchQuizData()
  }, [])

  const fetchQuizData = async () => {
    try {
      // Fetch question
      const { data: questionData, error: questionError } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('announcement_id', announcement.id)
        .single()

      if (questionError) throw questionError
      setQuestion(questionData)

      // Fetch user's response if logged in
      if (user) {
        const { data: responseData } = await supabase
          .from('quiz_responses')
          .select('*')
          .eq('question_id', questionData.id)
          .eq('user_id', user.id)
          .single()

        if (responseData) {
          setUserResponse(responseData)
        }
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!user || !question || !selectedAnswer) return

    setSubmitting(true)
    try {
      const isCorrect = selectedAnswer === question.correct_answer

      const { error } = await supabase
        .from('quiz_responses')
        .upsert({
          question_id: question.id,
          user_id: user.id,
          answer: selectedAnswer,
          is_correct: isCorrect,
        })

      if (error) throw error

      setUserResponse({
        answer: selectedAnswer,
        is_correct: isCorrect,
      })
    } catch (error) {
      console.error('Error submitting quiz response:', error)
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

  if (!question) return null

  const difficultyColor = {
    easy: 'text-green-400',
    medium: 'text-yellow-400',
    hard: 'text-red-400',
  }[question.difficulty] || 'text-gray-400'

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-purple-500/50 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <FaQuestionCircle className="text-purple-400 text-2xl" />
          <div>
            <h3 className="text-white font-bold">{announcement.title}</h3>
            <p className="text-sm text-gray-400">Daily Quiz</p>
          </div>
        </div>
        <span className={`text-sm font-semibold ${difficultyColor} uppercase`}>
          {question.difficulty}
        </span>
      </div>

      {/* Question */}
      <p className="text-white text-lg mb-4">{question.question}</p>

      {/* Options */}
      <div className="space-y-2 mb-4">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === option
          const isUserAnswer = userResponse?.answer === option
          const isCorrect = option === question.correct_answer
          const showResult = userResponse !== null

          return (
            <button
              key={index}
              onClick={() => !userResponse && setSelectedAnswer(option)}
              disabled={!!userResponse || submitting}
              className={`
                w-full text-left px-4 py-3 rounded-lg font-medium transition-all
                ${!showResult && isSelected ? 'bg-purple-600 text-white ring-2 ring-purple-400' : ''}
                ${!showResult && !isSelected ? 'bg-white/5 text-gray-300 hover:bg-white/10' : ''}
                ${showResult && isCorrect ? 'bg-green-600/30 text-green-300 ring-2 ring-green-400' : ''}
                ${showResult && isUserAnswer && !isCorrect ? 'bg-red-600/30 text-red-300 ring-2 ring-red-400' : ''}
                ${showResult && !isUserAnswer && !isCorrect ? 'bg-white/5 text-gray-400' : ''}
                ${userResponse ? 'cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-center justify-between">
                <span>{option}</span>
                {showResult && isCorrect && <FaCheck className="text-green-400" />}
                {showResult && isUserAnswer && !isCorrect && <FaTimes className="text-red-400" />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Submit Button */}
      {!userResponse && user && (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer || submitting}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold
                     hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all transform hover:scale-105"
        >
          {submitting ? 'Submitting...' : 'Submit Answer'}
        </button>
      )}

      {!user && (
        <p className="text-center text-gray-400 text-sm">
          Sign in to participate in quizzes
        </p>
      )}

      {/* Result */}
      {userResponse && (
        <div className={`mt-4 p-4 rounded-lg ${userResponse.is_correct ? 'bg-green-600/20 border border-green-500/50' : 'bg-red-600/20 border border-red-500/50'}`}>
          <div className="flex items-center gap-2 mb-2">
            {userResponse.is_correct ? (
              <>
                <FaTrophy className="text-green-400 text-xl" />
                <span className="text-green-300 font-bold">Correct!</span>
              </>
            ) : (
              <>
                <FaTimes className="text-red-400 text-xl" />
                <span className="text-red-300 font-bold">Incorrect</span>
              </>
            )}
          </div>
          {question.explanation && (
            <p className="text-sm text-gray-300">{question.explanation}</p>
          )}
        </div>
      )}

      {/* Category */}
      {question.category && (
        <div className="mt-4 text-sm text-gray-400">
          Category: <span className="text-purple-400 font-semibold">{question.category}</span>
        </div>
      )}
    </motion.div>
  )
}
