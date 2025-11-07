'use client'

import { useState, useEffect } from 'react'
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa'
import { createClient } from '@/app/lib/supabase-client'

interface PollFormProps {
  announcementId: number | null
  onClose: () => void
}

export default function PollForm({ announcementId, onClose }: PollFormProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  
  const [pollQuestion, setPollQuestion] = useState('')
  const [pollOptions, setPollOptions] = useState(['', ''])
  const [allowMultiple, setAllowMultiple] = useState(false)

  useEffect(() => {
    if (announcementId) {
      loadExistingPoll()
    }
  }, [announcementId])

  const loadExistingPoll = async () => {
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

      const { data: pollData } = await supabase
        .from('polls')
        .select('*')
        .eq('announcement_id', announcementId)
        .single()

      if (pollData) {
        const poll = pollData as any
        setPollQuestion(poll.question)
        setPollOptions(poll.options as string[])
        setAllowMultiple(poll.allow_multiple)
      }
    } catch (error) {
      console.error('Error loading poll:', error)
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions]
    newOptions[index] = value
    setPollOptions(newOptions)
  }

  const addOption = () => {
    setPollOptions([...pollOptions, ''])
  }

  const removeOption = (index: number) => {
    if (pollOptions.length <= 2) {
      alert('A poll must have at least 2 options')
      return
    }
    setPollOptions(pollOptions.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !pollQuestion || pollOptions.filter(o => o.trim()).length < 2) {
      alert('Please fill in all required fields with at least 2 options')
      return
    }

    setLoading(true)
    try {
      let announcementData: any = {
        type: 'poll',
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
        const { error } = await supabase
          .from('announcements')
          .update(announcementData as any)
          .eq('id', announcementId)

        if (error) throw error

        // Update poll
        const { error: pollError } = await supabase
          .from('polls')
          .update({
            question: pollQuestion,
            options: pollOptions.filter(o => o.trim()),
            allow_multiple: allowMultiple
          } as any)
          .eq('announcement_id', announcementId)

        if (pollError) throw pollError
      } else {
        // Create new announcement
        const { data: newAnnouncement, error } = await supabase
          .from('announcements')
          .insert(announcementData as any)
          .select()
          .single()

        if (error) throw error
        finalAnnouncementId = (newAnnouncement as any).id

        // Create poll
        const { error: pollError } = await supabase
          .from('polls')
          .insert({
            announcement_id: finalAnnouncementId,
            question: pollQuestion,
            options: pollOptions.filter(o => o.trim()),
            allow_multiple: allowMultiple
          } as any)

        if (pollError) throw pollError
      }

      alert(announcementId ? 'Poll updated successfully!' : 'Poll created successfully!')
      onClose()
    } catch (error) {
      console.error('Error saving poll:', error)
      alert('Failed to save poll')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {announcementId ? 'Edit Poll' : 'Create New Poll'}
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
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Poll Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Community Poll: Your Favorite Genre"
              required
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
            placeholder="Help us understand your music preferences!"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Poll Question */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Poll Question</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Question *
            </label>
            <textarea
              value={pollQuestion}
              onChange={(e) => setPollQuestion(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={2}
              placeholder="What's your favorite music genre?"
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
              {pollOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="flex-1 p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder={`Option ${index + 1}`}
                  />
                  {pollOptions.length > 2 && (
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

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Allow users to select multiple options
              </span>
            </label>
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
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : announcementId ? 'Update Poll' : 'Create Poll'}
          </button>
        </div>
      </form>
    </div>
  )
}
