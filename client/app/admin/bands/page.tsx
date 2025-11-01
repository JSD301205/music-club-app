'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase-client'
import { useAuth } from '@/app/contexts/AuthContext'
import { Band, BandMember, BandWithMembers } from '@/app/types/bands-team.types'
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaUsers, FaArrowUp, FaArrowDown } from 'react-icons/fa'
import ImageUpload from '../components/ImageUpload'

export default function AdminBandsPage() {
  const { user, profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  const [bands, setBands] = useState<BandWithMembers[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedBandId, setExpandedBandId] = useState<number | null>(null)
  
  // Band form state
  const [formData, setFormData] = useState<Partial<Band>>({
    name: '',
    image: '',
    description: '',
    order: 0,
    is_published: true,
  })
  const [editFormData, setEditFormData] = useState<BandWithMembers | null>(null)

  // Member form state
  const [showAddMemberForm, setShowAddMemberForm] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null)
  const [memberFormData, setMemberFormData] = useState<Partial<BandMember>>({
    name: '',
    instrument: '',
    image: '',
    order: 0,
  })

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
      fetchBands()
    }
  }, [profile])

  const fetchBands = async () => {
    try {
      // @ts-ignore
      const { data, error } = await supabase
        .from('bands')
        .select('*, band_members(*)')
        .order('order', { ascending: true })

      if (error) throw error
      
      // Sort members by order
      const bandsWithSortedMembers = (data || []).map((band: any) => ({
        ...band,
        band_members: (band.band_members || []).sort((a: BandMember, b: BandMember) => a.order - b.order)
      }))
      
      setBands(bandsWithSortedMembers)
    } catch (error) {
      console.error('Error fetching bands:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
    const filePath = `bands/${fileName}`

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
      if (!formData.name || !formData.image) {
        alert('Name and image are required')
        return
      }

      // @ts-ignore
      const { error } = await supabase.from('bands').insert([formData])

      if (error) throw error

      setShowAddForm(false)
      setFormData({
        name: '',
        image: '',
        description: '',
        order: 0,
        is_published: true,
      })
      fetchBands()
    } catch (error) {
      console.error('Error adding band:', error)
      alert('Failed to add band')
    }
  }

  const handleEdit = (band: BandWithMembers) => {
    setEditFormData(band)
    setEditingId(band.id)
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
        .from('bands')
        // @ts-ignore
        .update({
          name: editFormData.name,
          image: editFormData.image,
          description: editFormData.description,
          order: editFormData.order,
          is_published: editFormData.is_published,
        })
        .eq('id', editFormData.id)

      if (error) throw error

      setEditFormData(null)
      setEditingId(null)
      fetchBands()
    } catch (error) {
      console.error('Error updating band:', error)
      alert('Failed to update band')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this band? This will also delete all members.')) return

    try {
      // @ts-ignore
      const { error } = await supabase.from('bands').delete().eq('id', id)

      if (error) throw error
      fetchBands()
    } catch (error) {
      console.error('Error deleting band:', error)
      alert('Failed to delete band')
    }
  }

  const handleReorder = async (id: number, direction: 'up' | 'down') => {
    const currentIndex = bands.findIndex(b => b.id === id)
    if (currentIndex === -1) return
    if (direction === 'up' && currentIndex === 0) return
    if (direction === 'down' && currentIndex === bands.length - 1) return

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    const currentBand = bands[currentIndex]
    const targetBand = bands[targetIndex]

    try {
      // Swap orders
      // @ts-ignore
      await supabase.from('bands').update({ order: targetBand.order }).eq('id', currentBand.id)
      // @ts-ignore
      await supabase.from('bands').update({ order: currentBand.order }).eq('id', targetBand.id)
      
      fetchBands()
    } catch (error) {
      console.error('Error reordering bands:', error)
    }
  }

  // Member management functions
  const handleAddMember = async (bandId: number) => {
    try {
      if (!memberFormData.name || !memberFormData.instrument) {
        alert('Name and instrument are required')
        return
      }

      // @ts-ignore
      const { error } = await supabase.from('band_members').insert([
        { ...memberFormData, band_id: bandId }
      ])

      if (error) throw error

      setShowAddMemberForm(false)
      setMemberFormData({
        name: '',
        instrument: '',
        image: '',
        order: 0,
      })
      fetchBands()
    } catch (error) {
      console.error('Error adding member:', error)
      alert('Failed to add member')
    }
  }

  const handleUpdateMember = async () => {
    if (!editingMemberId) return

    try {
      // @ts-ignore
      const { error } = await supabase
        .from('band_members')
        // @ts-ignore
        .update(memberFormData)
        .eq('id', editingMemberId)

      if (error) throw error

      setEditingMemberId(null)
      setMemberFormData({
        name: '',
        instrument: '',
        image: '',
        order: 0,
      })
      fetchBands()
    } catch (error) {
      console.error('Error updating member:', error)
      alert('Failed to update member')
    }
  }

  const handleDeleteMember = async (memberId: number) => {
    if (!confirm('Are you sure you want to delete this member?')) return

    try {
      // @ts-ignore
      const { error } = await supabase.from('band_members').delete().eq('id', memberId)

      if (error) throw error
      fetchBands()
    } catch (error) {
      console.error('Error deleting member:', error)
      alert('Failed to delete member')
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Bands</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <FaPlus /> Add Band
          </button>
        </div>

        {/* Add Band Form */}
        {showAddForm && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add New Band</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Band Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter band name"
                />
              </div>

              <div>
                <ImageUpload
                  onImageUpload={async (file) => {
                    const url = await handleImageUpload(file)
                    setFormData({ ...formData, image: url })
                    return url
                  }}
                  currentImageUrl={formData.image}
                  label="Band Image *"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                  rows={3}
                  placeholder="Enter band description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_published"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="is_published" className="text-sm text-gray-700 dark:text-gray-300">
                  Published
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FaSave /> Save
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bands List */}
        <div className="space-y-4">
          {bands.map((band) => (
            <div key={band.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {editingId === band.id ? (
                // Edit Form
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Edit Band</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Band Name *
                      </label>
                      <input
                        type="text"
                        value={editFormData?.name}
                        onChange={(e) => setEditFormData({ ...editFormData!, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <ImageUpload
                        onImageUpload={async (file) => {
                          const url = await handleImageUpload(file)
                          setEditFormData({ ...editFormData!, image: url })
                          return url
                        }}
                        currentImageUrl={editFormData?.image}
                        label="Band Image *"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={editFormData?.description}
                        onChange={(e) => setEditFormData({ ...editFormData!, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Order
                      </label>
                      <input
                        type="number"
                        value={editFormData?.order}
                        onChange={(e) => setEditFormData({ ...editFormData!, order: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`edit_published_${band.id}`}
                        checked={editFormData?.is_published}
                        onChange={(e) => setEditFormData({ ...editFormData!, is_published: e.target.checked })}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor={`edit_published_${band.id}`} className="text-sm text-gray-700 dark:text-gray-300">
                        Published
                      </label>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdate}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <FaSave /> Update
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                      >
                        <FaTimes /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Display View
                <>
                  <div className="p-6">
                    <div className="flex items-start gap-6">
                      <img
                        src={band.image}
                        alt={band.name}
                        className="w-32 h-32 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                              {band.name}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mt-1">
                              {band.description}
                            </p>
                            <div className="flex gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                              <span>Order: {band.order}</span>
                              <span className={band.is_published ? 'text-green-600' : 'text-red-600'}>
                                {band.is_published ? 'Published' : 'Unpublished'}
                              </span>
                              <span className="flex items-center gap-1">
                                <FaUsers /> {band.band_members?.length || 0} members
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReorder(band.id, 'up')}
                              className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title="Move up"
                            >
                              <FaArrowUp />
                            </button>
                            <button
                              onClick={() => handleReorder(band.id, 'down')}
                              className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title="Move down"
                            >
                              <FaArrowDown />
                            </button>
                            <button
                              onClick={() => handleEdit(band)}
                              className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(band.id)}
                              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Members Section */}
                    <div className="mt-6">
                      <button
                        onClick={() => setExpandedBandId(expandedBandId === band.id ? null : band.id)}
                        className="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                      >
                        <FaUsers />
                        {expandedBandId === band.id ? 'Hide' : 'Show'} Members ({band.band_members?.length || 0})
                      </button>

                      {expandedBandId === band.id && (
                        <div className="mt-4 space-y-4">
                          <button
                            onClick={() => {
                              setMemberFormData({ ...memberFormData, band_id: band.id })
                              setShowAddMemberForm(true)
                            }}
                            className="flex items-center gap-2 bg-primary-600 text-white px-3 py-1.5 rounded text-sm hover:bg-primary-700"
                          >
                            <FaPlus /> Add Member
                          </button>

                          {/* Add Member Form */}
                          {showAddMemberForm && memberFormData.band_id === band.id && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Add New Member</h4>
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  placeholder="Name *"
                                  value={memberFormData.name}
                                  onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                                />
                                <input
                                  type="text"
                                  placeholder="Instrument *"
                                  value={memberFormData.instrument}
                                  onChange={(e) => setMemberFormData({ ...memberFormData, instrument: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                                />
                                <ImageUpload
                                  onImageUpload={async (file) => {
                                    const url = await handleImageUpload(file)
                                    setMemberFormData({ ...memberFormData, image: url })
                                    return url
                                  }}
                                  currentImageUrl={memberFormData.image}
                                  label="Member Image"
                                />
                                <input
                                  type="number"
                                  placeholder="Order"
                                  value={memberFormData.order}
                                  onChange={(e) => setMemberFormData({ ...memberFormData, order: parseInt(e.target.value) })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAddMember(band.id)}
                                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
                                  >
                                    <FaSave /> Save
                                  </button>
                                  <button
                                    onClick={() => {
                                      setShowAddMemberForm(false)
                                      setMemberFormData({ name: '', instrument: '', image: '', order: 0 })
                                    }}
                                    className="flex items-center gap-2 bg-gray-600 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700"
                                  >
                                    <FaTimes /> Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Members List */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {band.band_members?.map((member) => (
                              <div key={member.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 flex items-center gap-3">
                                {member.image && (
                                  <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-16 h-16 object-cover rounded-lg"
                                  />
                                )}
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                                  <div className="text-sm text-gray-600 dark:text-gray-400">{member.instrument}</div>
                                  <div className="text-xs text-gray-500">Order: {member.order}</div>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingMemberId(member.id)
                                      setMemberFormData(member)
                                    }}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                                  >
                                    <FaEdit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteMember(member.id)}
                                    className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  >
                                    <FaTrash size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Edit Member Form */}
                          {editingMemberId && (
                            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                              <h4 className="font-semibold mb-3 text-gray-900 dark:text-white">Edit Member</h4>
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  placeholder="Name *"
                                  value={memberFormData.name}
                                  onChange={(e) => setMemberFormData({ ...memberFormData, name: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                                />
                                <input
                                  type="text"
                                  placeholder="Instrument *"
                                  value={memberFormData.instrument}
                                  onChange={(e) => setMemberFormData({ ...memberFormData, instrument: e.target.value })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                                />
                                <ImageUpload
                                  onImageUpload={async (file) => {
                                    const url = await handleImageUpload(file)
                                    setMemberFormData({ ...memberFormData, image: url })
                                    return url
                                  }}
                                  currentImageUrl={memberFormData.image}
                                  label="Member Image"
                                />
                                <input
                                  type="number"
                                  placeholder="Order"
                                  value={memberFormData.order}
                                  onChange={(e) => setMemberFormData({ ...memberFormData, order: parseInt(e.target.value) })}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-800 dark:text-white"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={handleUpdateMember}
                                    className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700"
                                  >
                                    <FaSave /> Update
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingMemberId(null)
                                      setMemberFormData({ name: '', instrument: '', image: '', order: 0 })
                                    }}
                                    className="flex items-center gap-2 bg-gray-600 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-700"
                                  >
                                    <FaTimes /> Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {bands.length === 0 && (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No bands found. Add your first band to get started!
          </div>
        )}
      </div>
    </div>
  )
}
