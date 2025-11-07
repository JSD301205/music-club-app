'use client'

import { useState, useEffect } from 'react'
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa'
import { createClient } from '@/app/lib/supabase-client'

interface QuizFormProps {
  announcementId: number | null
  onClose: () => void
}

interface QuizQuestion {
  question: string
  options: string[]
  correct_answer: string
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
}

export default function QuizForm({ announcementId, onClose }: QuizFormProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const [question, setQuestion] = useState<QuizQuestion>({
    question: '',
    options: ['', '', '', ''],
    correct_answer: '',
    explanation: '',
    difficulty: 'medium',
    category: 'theory'
  })

  useEffect(() => {
    if (announcementId) {
      loadExistingQuiz()
    }
  }, [announcementId])

  const loadExistingQuiz = async () => {
    if (!announcementId) return
    
    try {
      const { data: announcement } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', announcementId)
        .single()

      if (announcement) {
        const ann = announcement as any
        setTitle(ann.title)
        setDescription(ann.description || '')
        setPriority(ann.priority)
        setIsActive(ann.is_active)
        setStartDate(ann.start_date ? ann.start_date.split('T')[0] : '')
        setEndDate(ann.end_date ? ann.end_date.split('T')[0] : '')
      }

      const { data: quizData } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('announcement_id', announcementId)
        .single()

      if (quizData) {
        const quiz = quizData as any
        setQuestion({
          question: quiz.question,
          options: quiz.options as string[],
          correct_answer: quiz.correct_answer,
          explanation: quiz.explanation || '',
          difficulty: quiz.difficulty as any,
          category: quiz.category || 'theory'
        })
      }
    } catch (error) {
      console.error('Error loading quiz:', error)
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...question.options]
    newOptions[index] = value
    setQuestion({ ...question, options: newOptions })
  }

  const addOption = () => {
    setQuestion({ ...question, options: [...question.options, ''] })
  }

  const removeOption = (index: number) => {
    if (question.options.length <= 2) {
      alert('A quiz must have at least 2 options')
      return
    }
    const newOptions = question.options.filter((_, i) => i !== index)
    setQuestion({ ...question, options: newOptions })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !question.question || question.options.filter(o => o.trim()).length < 2 || !question.correct_answer) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      let announcementData: any = {
        type: 'quiz',
        title,
        description: description || null,
        priority,
        is_active: isActive,
        start_date: startDate || null,
        end_date: endDate || null,
      }

      let finalAnnouncementId = announcementId

      if (announcementId) {
        // Update existing announcement
        const { error } = await (supabase as any)
          .from('announcements')
          .update(announcementData)
          .eq('id', announcementId)

        if (error) throw error

        // Update quiz question
        const { error: quizError } = await (supabase as any)
          .from('quiz_questions')
          .update({
            question: question.question,
            options: question.options.filter(o => o.trim()),
            correct_answer: question.correct_answer,
            explanation: question.explanation || null,
            difficulty: question.difficulty,
            category: question.category
          })
          .eq('announcement_id', announcementId)

        if (quizError) throw quizError
      } else {
        // Create new announcement
        const { data: newAnnouncement, error } = await (supabase as any)
          .from('announcements')
          .insert(announcementData)
          .select()
          .single()

        if (error) throw error
        finalAnnouncementId = newAnnouncement.id

        // Create quiz question
        const { error: quizError } = await (supabase as any)
          .from('quiz_questions')
          .insert({
            announcement_id: finalAnnouncementId,
            question: question.question,
            options: question.options.filter(o => o.trim()),
            correct_answer: question.correct_answer,
            explanation: question.explanation || null,
            difficulty: question.difficulty,
            category: question.category
          })

        if (quizError) throw quizError
      }

      alert(announcementId ? 'Quiz updated successfully!' : 'Quiz created successfully!')
      onClose()
    } catch (error) {
      console.error('Error saving quiz:', error)
      alert('Failed to save quiz')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {announcementId ? 'Edit Quiz' : 'Create New Quiz'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <FaTimes size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Announcement Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quiz Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Daily Music Theory Quiz"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <input
              type="text"
              value={question.category}
              onChange={(e) => setQuestion({ ...question, category: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="theory, ear-training, rhythm"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={2}
            placeholder="Test your music theory knowledge!"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Difficulty
            </label>
            <select
              value={question.difficulty}
              onChange={(e) => setQuestion({ ...question, difficulty: e.target.value as any })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <input
              type="number"
              value={priority}
              onChange={(e) => setPriority(parseInt(e.target.value) || 0)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={isActive ? 'active' : 'inactive'}
              onChange={(e) => setIsActive(e.target.value === 'active')}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date (Optional)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date (Optional)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Quiz Question */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quiz Question</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question *
            </label>
            <textarea
              value={question.question}
              onChange={(e) => setQuestion({ ...question, question: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="What is the fifth note in the C major scale?"
              required
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Options * (minimum 2)
              </label>
              <button
                type="button"
                onClick={addOption}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <FaPlus /> Add Option
              </button>
            </div>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={`Option ${index + 1}`}
                  />
                  {question.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correct Answer *
            </label>
            <select
              value={question.correct_answer}
              onChange={(e) => setQuestion({ ...question, correct_answer: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            >
              <option value="">Select the correct answer</option>
              {question.options.filter(o => o.trim()).map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              value={question.explanation}
              onChange={(e) => setQuestion({ ...question, explanation: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              placeholder="The C major scale consists of C-D-E-F-G-A-B-C. The fifth note is G."
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : announcementId ? 'Update Quiz' : 'Create Quiz'}
          </button>
        </div>
      </form>
    </div>
  )
}
