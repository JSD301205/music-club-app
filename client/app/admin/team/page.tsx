'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase-client'
import { useAuth } from '@/app/contexts/AuthContext'
import { TeamMember } from '@/app/types/bands-team.types'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaArrowUp, FaArrowDown, FaFilter } from 'react-icons/fa'
import ImageUpload from '../components/ImageUpload'

export default function AdminTeamPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  
  // Filter state
  const [filterYear, setFilterYear] = useState<number | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  
  // Form state
  const [formData, setFormData] = useState<Partial<TeamMember>>({
    name: '',
    role: '',
    position: '',
    image: '',
    bio: '',
    year: 2025,
    category: 'core',
    social_links: {},
    order: 0,
    is_published: true,
  })
  const [editFormData, setEditFormData] = useState<TeamMember | null>(null)

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/')
      } else if (profile !== null && profile.role !== 'admin') {
        router.push('/')
      }
    }
  }, [user, profile, authLoading, router])

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchTeamMembers()
    }
  }, [profile, filterYear, filterCategory])

  const fetchTeamMembers = async () => {
    try {
      let query = supabase
        .from('team_members')
        .select('*')
        .order('year', { ascending: false })
        .order('order', { ascending: true })

      if (filterYear !== 'all') {
        // @ts-ignore
        query = query.eq('year', filterYear)
      }

      if (filterCategory !== 'all') {
        // @ts-ignore
        query = query.eq('category', filterCategory)
      }

      // @ts-ignore
      const { data, error } = await query

      if (error) throw error
      setTeamMembers(data || [])
    } catch (error) {
      console.error('Error fetching team members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `crew/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleAdd = async () => {
    try {
      if (!formData.name || !formData.role) {
        alert('Name and role are required')
        return
      }

      // @ts-ignore
      const { error } = await supabase.from('team_members').insert([formData])

      if (error) throw error

      setShowAddForm(false)
      setFormData({
        name: '',
        role: '',
        position: '',
        image: '',
        bio: '',
        year: 2025,
        category: 'core',
        social_links: {},
        order: 0,
        is_published: true,
      })
      fetchTeamMembers()
    } catch (error) {
      console.error('Error adding team member:', error)
      alert('Failed to add team member')
    }
  }

  const handleEdit = (member: TeamMember) => {
    setEditFormData(member)
    setEditingId(member.id)
  }

  const handleCancelEdit = () => {
    setEditFormData(null)
    setEditingId(null)
  }

  const handleUpdate = async () => {
    if (!editFormData) return

    try {
      // @ts-ignore
      const { error } = await supabase
        .from('team_members')
        // @ts-ignore
        .update({
          name: editFormData.name,
          role: editFormData.role,
          position: editFormData.position,
          image: editFormData.image,
          bio: editFormData.bio,
          year: editFormData.year,
          category: editFormData.category,
          social_links: editFormData.social_links,
          order: editFormData.order,
          is_published: editFormData.is_published,
        })
        .eq('id', editFormData.id)

      if (error) throw error

      setEditFormData(null)
      setEditingId(null)
      fetchTeamMembers()
    } catch (error) {
      console.error('Error updating team member:', error)
      alert('Failed to update team member')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this team member?')) return

    try {
      // @ts-ignore
      const { error } = await supabase.from('team_members').delete().eq('id', id)

      if (error) throw error
      fetchTeamMembers()
    } catch (error) {
      console.error('Error deleting team member:', error)
      alert('Failed to delete team member')
    }
  }

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = teamMembers.findIndex(m => m.id === id)
    if (currentIndex === -1) return
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === teamMembers.length - 1) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const currentMember = teamMembers[currentIndex]
    const targetMember = teamMembers[targetIndex]

    try {
      // Swap orders
      // @ts-ignore
      await supabase.from('team_members').update({ order: targetMember.order }).eq('id', currentMember.id)
      // @ts-ignore
      await supabase.from('team_members').update({ order: currentMember.order }).eq('id', targetMember.id)
      
      fetchTeamMembers()
    } catch (error) {
      console.error('Error reordering team members:', error)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!profile || profile.role !== 'admin') {
    return null
  }

  const renderForm = (data: Partial<TeamMember> | TeamMember, setData: Function, onSave: Function, onCancel: Function, isEdit: boolean) => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Name *
          </label>
          <input
            type="text"
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="Enter name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Role *
          </label>
          <input
            type="text"
            value={data.role}
            onChange={(e) => setData({ ...data, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., Core, Lead, Coordinator"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Position
          </label>
          <input
            type="text"
            value={data.position || ''}
            onChange={(e) => setData({ ...data, position: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
            placeholder="e.g., President, Technical Lead"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Year *
          </label>
          <select
            value={data.year}
            onChange={(e) => setData({ ...data, year: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category *
          </label>
          <select
            value={data.category}
            onChange={(e) => setData({ ...data, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="core">Core</option>
            <option value="coordinator">Coordinator</option>
            <option value="crew">Crew</option>
            <option value="mentor">Mentor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Order
          </label>
          <input
            type="number"
            value={data.order}
            onChange={(e) => setData({ ...data, order: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <ImageUpload
          onImageUpload={async (file) => {
            const url = await handleImageUpload(file)
            setData({ ...data, image: url })
            return url
          }}
          currentImageUrl={data.image}
          label="Member Image"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Bio
        </label>
        <textarea
          value={data.bio}
          onChange={(e) => setData({ ...data, bio: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
          rows={4}
          placeholder="Enter bio"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Social Links (JSON)
        </label>
        <textarea
          value={JSON.stringify(data.social_links || {}, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value)
              setData({ ...data, social_links: parsed })
            } catch (err) {
              // Invalid JSON, don't update
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
          rows={5}
          placeholder='{"linkedin": "url", "github": "url"}'
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`published_${isEdit ? 'edit' : 'add'}`}
          checked={data.is_published}
          onChange={(e) => setData({ ...data, is_published: e.target.checked })}
          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label htmlFor={`published_${isEdit ? 'edit' : 'add'}`} className="text-sm text-gray-700 dark:text-gray-300">
          Published
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onSave()}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <FaSave /> {isEdit ? 'Update' : 'Save'}
        </button>
        <button
          onClick={() => onCancel()}
          className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          <FaTimes /> Cancel
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Team Members</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FaPlus /> Add Member
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
            </div>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Years</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="core">Core</option>
              <option value="coordinator">Coordinator</option>
              <option value="crew">Crew</option>
              <option value="mentor">Mentor</option>
            </select>
            <span className="text-sm text-gray-500">
              {teamMembers.length} member{teamMembers.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Team Member</h2>
            {renderForm(formData, setFormData, handleAdd, () => setShowAddForm(false), false)}
          </div>
        )}

        {/* Team Members List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <div key={member.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {editingId === member.id ? (
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Member</h3>
                  {renderForm(editFormData!, setEditFormData, handleUpdate, handleCancelEdit, true)}
                </div>
              ) : (
                <>
                  {member.image && (
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {member.name}
                        </h3>
                        <p className="text-sm text-primary-600 dark:text-primary-400">
                          {member.role}
                        </p>
                        {member.position && (
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {member.position}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {member.bio && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                        {member.bio}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mb-3 text-xs">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                        {member.year}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded capitalize">
                        {member.category}
                      </span>
                      <span className={`px-2 py-1 rounded ${member.is_published ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`}>
                        {member.is_published ? 'Published' : 'Unpublished'}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded">
                        Order: {member.order}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReorder(member.id, 'up')}
                        className="flex-1 p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                        title="Move up"
                      >
                        <FaArrowUp className="mx-auto" />
                      </button>
                      <button
                        onClick={() => handleReorder(member.id, 'down')}
                        className="flex-1 p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-sm"
                        title="Move down"
                      >
                        <FaArrowDown className="mx-auto" />
                      </button>
                      <button
                        onClick={() => handleEdit(member)}
                        className="flex-1 p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded text-sm"
                      >
                        <FaEdit className="mx-auto" />
                      </button>
                      <button
                        onClick={() => handleDelete(member.id)}
                        className="flex-1 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-sm"
                      >
                        <FaTrash className="mx-auto" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {teamMembers.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No team members found. Add your first team member to get started!
          </div>
        )}
      </div>
    </div>
  )
}
