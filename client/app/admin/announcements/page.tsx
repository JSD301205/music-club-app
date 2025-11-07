'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash } from 'react-icons/fa'
import { createClient } from '@/app/lib/supabase-client'
import { checkIsAuthenticated } from '@/app/lib/api/auth'
import AdminLogin from '../components/AdminLogin'
import AnnouncementForm from './components/AnnouncementForm'
import QuizForm from './components/QuizForm'
import PollForm from './components/PollForm'

interface Announcement {
  id: number
  type: 'quiz' | 'poll' | 'announcement' | 'event'
  title: string
  description: string | null
  is_active: boolean
  priority: number
  start_date: string | null
  end_date: string | null
  created_at: string
  metadata: any
}

export default function AnnouncementsAdminPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'quiz' | 'poll' | 'announcement'>('all')
  const [showForm, setShowForm] = useState(false)
  const [formType, setFormType] = useState<'quiz' | 'poll' | 'announcement' | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      fetchAnnouncements()
    }
  }, [isAuthenticated])

  const checkAuth = async () => {
    const authenticated = await checkIsAuthenticated()
    setIsAuthenticated(authenticated)
    setLoading(false)
  }

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchAnnouncements()
    } catch (error) {
      console.error('Error deleting announcement:', error)
      alert('Failed to delete item')
    }
  }

  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error
      await fetchAnnouncements()
    } catch (error) {
      console.error('Error toggling active status:', error)
      alert('Failed to update status')
    }
  }

  const handleCreateNew = (type: 'quiz' | 'poll' | 'announcement') => {
    setFormType(type)
    setEditingId(null)
    setShowForm(true)
  }

  const handleEdit = (announcement: Announcement) => {
    setFormType(announcement.type as any)
    setEditingId(announcement.id)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setFormType(null)
    setEditingId(null)
    fetchAnnouncements()
  }

  if (loading) {
    return <div className="p-4 text-gray-900 dark:text-white">Loading...</div>
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  const filteredAnnouncements = activeTab === 'all'
    ? announcements
    : announcements.filter(a => a.type === activeTab)

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Manage Announcements
        </h1>
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
        >
          Back to Admin
        </button>
      </div>

      {/* Create New Buttons */}
      {!showForm && (
        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={() => handleCreateNew('quiz')}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <FaPlus /> Create Quiz
          </button>
          <button
            onClick={() => handleCreateNew('poll')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <FaPlus /> Create Poll
          </button>
          <button
            onClick={() => handleCreateNew('announcement')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <FaPlus /> Create Announcement
          </button>
        </div>
      )}

      {/* Forms */}
      {showForm && formType === 'quiz' && (
        <QuizForm
          announcementId={editingId}
          onClose={handleFormClose}
        />
      )}
      {showForm && formType === 'poll' && (
        <PollForm
          announcementId={editingId}
          onClose={handleFormClose}
        />
      )}
      {showForm && formType === 'announcement' && (
        <AnnouncementForm
          announcementId={editingId}
          onClose={handleFormClose}
        />
      )}

      {/* Tabs */}
      {!showForm && (
        <>
          <div className="mb-6 border-b border-gray-300 dark:border-gray-700">
            <div className="flex gap-4">
              {['all', 'quiz', 'poll', 'announcement'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                    activeTab === tab
                      ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab !== 'all' && ` (${announcements.filter(a => a.type === tab).length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Announcements List */}
          <div className="space-y-4">
            {filteredAnnouncements.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No {activeTab !== 'all' ? activeTab + 's' : 'announcements'} found. Create one to get started!
              </div>
            ) : (
              filteredAnnouncements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-l-4 ${
                    announcement.type === 'quiz' ? 'border-purple-600' :
                    announcement.type === 'poll' ? 'border-blue-600' :
                    'border-green-600'
                  } ${!announcement.is_active ? 'opacity-60' : ''}`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${
                          announcement.type === 'quiz' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          announcement.type === 'poll' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {announcement.type.toUpperCase()}
                        </span>
                        {!announcement.is_active && (
                          <span className="px-2 py-1 text-xs font-semibold rounded bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                            INACTIVE
                          </span>
                        )}
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          Priority: {announcement.priority}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {announcement.title}
                      </h3>
                      {announcement.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                          {announcement.description}
                        </p>
                      )}
                      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {announcement.start_date && (
                          <span>Start: {new Date(announcement.start_date).toLocaleDateString()}</span>
                        )}
                        {announcement.end_date && (
                          <span>End: {new Date(announcement.end_date).toLocaleDateString()}</span>
                        )}
                        <span>Created: {new Date(announcement.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleActive(announcement.id, announcement.is_active)}
                        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                          announcement.is_active ? 'text-green-600' : 'text-gray-400'
                        }`}
                        title={announcement.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {announcement.is_active ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
                      </button>
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                        title="Edit"
                      >
                        <FaEdit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                        title="Delete"
                      >
                        <FaTrash size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
