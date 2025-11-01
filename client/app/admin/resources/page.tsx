'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase-client'
import { useAuth } from '@/app/contexts/AuthContext'
import { Resource, ResourceCategory, SkillLevel, ResourceType } from '@/app/types/resources'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaExternalLinkAlt } from 'react-icons/fa'

export default function AdminResourcesPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState<Partial<Resource>>({
    title: '',
    description: '',
    category: 'tutorial',
    instrument: 'general',
    skill_level: 'all',
    resource_type: 'link',
    resource_url: '',
    tags: [],
    is_featured: false,
    is_published: true,
  })
  const [editFormData, setEditFormData] = useState<Resource | null>(null)

  useEffect(() => {
    // Debug logging
    console.log('Admin Resources - Auth State:', { 
      authLoading, 
      user: !!user, 
      profile: profile,
      profileRole: profile?.role,
      email: user?.email 
    })

    if (!authLoading) {
      if (!user) {
        console.log('No user found, redirecting...')
        router.push('/')
      } else if (profile !== null && profile.role !== 'admin') {
        console.log('User is not admin, role is:', profile.role, 'redirecting...')
        router.push('/')
      } else if (profile !== null && profile.role === 'admin') {
        console.log('User is admin, access granted')
      } else {
        console.log('Profile still loading, waiting...')
      }
    }
  }, [user, profile, authLoading, router])

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchResources()
    }
  }, [profile])

  const fetchResources = async () => {
    try {
      // @ts-ignore - Resources table types not yet generated
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setResources(data || [])
    } catch (error) {
      console.error('Error fetching resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      // @ts-ignore - Resources table types not yet generated
      const { error } = await supabase.from('resources').insert([
        {
          ...formData,
          created_by: user?.id,
        },
      ])

      if (error) throw error

      setShowAddForm(false)
      setFormData({
        title: '',
        description: '',
        category: 'tutorial',
        instrument: 'general',
        skill_level: 'all',
        resource_type: 'link',
        resource_url: '',
        tags: [],
        is_featured: false,
        is_published: true,
      })
      fetchResources()
    } catch (error) {
      console.error('Error adding resource:', error)
      alert('Failed to add resource')
    }
  }

  const handleEdit = (resource: Resource) => {
    setEditFormData(resource)
    setEditingId(resource.id)
  }

  const handleCancelEdit = () => {
    setEditFormData(null)
    setEditingId(null)
  }

  const handleUpdate = async () => {
    if (!editFormData) return

    try {
      // @ts-ignore - Resources table types not yet generated
      const { error } = await supabase
        .from('resources')
        // @ts-ignore - Resources table types not yet generated
        .update({
          title: editFormData.title,
          description: editFormData.description,
          category: editFormData.category,
          instrument: editFormData.instrument,
          skill_level: editFormData.skill_level,
          resource_type: editFormData.resource_type,
          resource_url: editFormData.resource_url,
          tags: editFormData.tags,
          is_featured: editFormData.is_featured,
          is_published: editFormData.is_published,
        })
        .eq('id', editFormData.id)

      if (error) throw error

      setEditFormData(null)
      setEditingId(null)
      fetchResources()
    } catch (error) {
      console.error('Error updating resource:', error)
      alert('Failed to update resource')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return

    try {
      // @ts-ignore - Resources table types not yet generated
      const { error } = await supabase.from('resources').delete().eq('id', id)

      if (error) throw error

      fetchResources()
    } catch (error) {
      console.error('Error deleting resource:', error)
      alert('Failed to delete resource')
    }
  }

  const handleFieldChange = (id: string, field: keyof Resource, value: any) => {
    setResources(
      resources.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!user || profile?.role !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Manage Resources
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Add, edit, and delete music learning resources
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            {showAddForm ? <FaTimes /> : <FaPlus />}
            {showAddForm ? 'Cancel' : 'Add Resource'}
          </button>
        </div>

        {/* Add Resource Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Add New Resource
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Title *"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as ResourceCategory,
                  })
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="tutorial">Tutorial</option>
                <option value="sheet_music">Sheet Music</option>
                <option value="backing_track">Backing Track</option>
                <option value="lesson">Lesson</option>
                <option value="other">Other</option>
              </select>
              <input
                type="text"
                placeholder="Instrument (e.g., guitar, piano)"
                value={formData.instrument || ''}
                onChange={(e) =>
                  setFormData({ ...formData, instrument: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <select
                value={formData.skill_level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    skill_level: e.target.value as SkillLevel,
                  })
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              <select
                value={formData.resource_type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    resource_type: e.target.value as ResourceType,
                  })
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              >
                <option value="link">Link</option>
                <option value="file">File</option>
                <option value="embedded_video">Embedded Video</option>
              </select>
              <input
                type="url"
                placeholder="Resource URL *"
                value={formData.resource_url || ''}
                onChange={(e) =>
                  setFormData({ ...formData, resource_url: e.target.value })
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
              />
              <input
                type="text"
                placeholder="Tags (comma separated)"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tags: e.target.value.split(',').map((t) => t.trim()),
                  })
                }
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white md:col-span-2"
              />
              <textarea
                placeholder="Description"
                value={formData.description || ''}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white md:col-span-2"
              />
              <div className="flex items-center gap-4 md:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) =>
                      setFormData({ ...formData, is_featured: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) =>
                      setFormData({ ...formData, is_published: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Published</span>
                </label>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleAdd}
                disabled={!formData.title || !formData.resource_url}
                className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaSave />
                Add Resource
              </button>
            </div>
          </div>
        )}

        {/* Edit Resource Modal */}
        {editFormData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Edit Resource
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Title *"
                    value={editFormData.title || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, title: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <select
                    value={editFormData.category}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        category: e.target.value as ResourceCategory,
                      })
                    }
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="tutorial">Tutorial</option>
                    <option value="sheet_music">Sheet Music</option>
                    <option value="backing_track">Backing Track</option>
                    <option value="lesson">Lesson</option>
                    <option value="other">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Instrument (e.g., guitar, piano)"
                    value={editFormData.instrument || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, instrument: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <select
                    value={editFormData.skill_level}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        skill_level: e.target.value as SkillLevel,
                      })
                    }
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Levels</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                  <select
                    value={editFormData.resource_type}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        resource_type: e.target.value as ResourceType,
                      })
                    }
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  >
                    <option value="link">Link</option>
                    <option value="file">File</option>
                    <option value="embedded_video">Embedded Video</option>
                  </select>
                  <input
                    type="url"
                    placeholder="Resource URL *"
                    value={editFormData.resource_url || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, resource_url: e.target.value })
                    }
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="Tags (comma separated)"
                    value={editFormData.tags?.join(', ') || ''}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        tags: e.target.value.split(',').map((t) => t.trim()),
                      })
                    }
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white md:col-span-2"
                  />
                  <textarea
                    placeholder="Description"
                    value={editFormData.description || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, description: e.target.value })
                    }
                    rows={3}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white md:col-span-2"
                  />
                  <div className="flex items-center gap-4 md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.is_featured}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, is_featured: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Featured</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.is_published}
                        onChange={(e) =>
                          setEditFormData({ ...editFormData, is_published: e.target.checked })
                        }
                        className="w-4 h-4"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Published</span>
                    </label>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2 px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdate}
                    disabled={!editFormData.title || !editFormData.resource_url}
                    className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaSave />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resources List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Instrument
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {resources.map((resource) => (
                <tr key={resource.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {resource.title}
                        </div>
                        {resource.is_featured && (
                          <span className="text-xs text-orange-500">⭐ Featured</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {resource.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {resource.instrument || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                      {resource.skill_level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        resource.is_published
                          ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {resource.is_published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {resource.resource_url && (
                        <a
                          href={resource.resource_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Open resource"
                        >
                          <FaExternalLinkAlt />
                        </a>
                      )}
                      <button
                        onClick={() => handleEdit(resource)}
                        className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                        title="Edit resource"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(resource.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete resource"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {resources.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No resources yet. Add your first resource to get started!
          </div>
        )}
      </div>
    </div>
  )
}
