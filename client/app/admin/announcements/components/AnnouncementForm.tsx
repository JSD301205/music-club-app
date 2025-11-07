'use client'

import { useState, useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import { createClient } from '@/app/lib/supabase-client'

interface AnnouncementFormProps {
  announcementId: number | null
  onClose: () => void
}

export default function AnnouncementForm({ announcementId, onClose }: AnnouncementFormProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState(0)
  const [isActive, setIsActive] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [announcementType, setAnnouncementType] = useState<'announcement' | 'event'>('announcement')

  useEffect(() => {
    if (announcementId) {
      loadExistingAnnouncement()
    }
  }, [announcementId])

  const loadExistingAnnouncement = async () => {
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
        setAnnouncementType(ann.type || 'announcement')
      }
    } catch (error) {
      console.error('Error loading announcement:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !description) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)
    try {
      let announcementData: any = {
        type: announcementType,
        title,
        description,
        priority,
        is_active: isActive,
        start_date: startDate || null,
        end_date: endDate || null,
      }

      if (announcementId) {
        // Update existing announcement
        const { error } = await (supabase as any)
          .from('announcements')
          .update(announcementData)
          .eq('id', announcementId)

        if (error) throw error
      } else {
        // Create new announcement
        const { error} = await (supabase as any)
          .from('announcements')
          .insert(announcementData)

        if (error) throw error
      }

      alert(announcementId ? 'Announcement updated successfully!' : 'Announcement created successfully!')
      onClose()
    } catch (error) {
      console.error('Error saving announcement:', error)
      alert('Failed to save announcement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {announcementId ? 'Edit Announcement' : 'Create New Announcement'}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
        >
          <FaTimes size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Important Club Update"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            rows={4}
            placeholder="Enter the full announcement details..."
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={announcementType}
              onChange={(e) => setAnnouncementType(e.target.value as any)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="announcement">General Announcement</option>
              <option value="event">Event Announcement</option>
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
              placeholder="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Higher = shown first
            </p>
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Show from this date onwards
            </p>
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Hide after this date
            </p>
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
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : announcementId ? 'Update Announcement' : 'Create Announcement'}
          </button>
        </div>
      </form>
    </div>
  )
}
