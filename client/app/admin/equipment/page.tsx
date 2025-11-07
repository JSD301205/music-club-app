'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaBox, FaGuitar } from 'react-icons/fa'
import { createClient } from '@/app/lib/supabase-client'
import { useAuth } from '@/app/contexts/AuthContext'

interface EquipmentItem {
  id: number
  name: string
  category: 'instrument' | 'amplifier' | 'microphone' | 'audio-interface' | 'accessory' | 'other'
  description: string | null
  serial_number: string | null
  condition: 'excellent' | 'good' | 'fair' | 'needs-repair'
  total_quantity: number
  available_quantity: number
  is_active: boolean
}

interface BorrowingRequest {
  id: number
  equipment_id: number
  quantity: number
  borrowed_date: string | null
  due_date: string
  return_date: string | null
  purpose: string | null
  notes: string | null
  status: 'pending' | 'approved' | 'borrowed' | 'returned' | 'overdue' | 'rejected'
  user_id: string
  profile?: {
    username: string
    full_name: string | null
  }
}

export default function AdminEquipmentPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [borrowings, setBorrowings] = useState<BorrowingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'equipment' | 'borrowings'>('equipment')
  const [showEquipmentForm, setShowEquipmentForm] = useState(false)
  const [editingEquipment, setEditingEquipment] = useState<EquipmentItem | null>(null)
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string
    category: 'instrument' | 'amplifier' | 'microphone' | 'audio-interface' | 'accessory' | 'other'
    description: string
    serial_number: string
    condition: 'excellent' | 'good' | 'fair' | 'needs-repair'
    total_quantity: number
    available_quantity: number
    is_active: boolean
  }>({
    name: '',
    category: 'instrument',
    description: '',
    serial_number: '',
    condition: 'good',
    total_quantity: 1,
    available_quantity: 1,
    is_active: true
  })

  useEffect(() => {
    if (!authLoading) {
      if (!user || !profile) {
        router.push('/')
        return
      }
      if (profile.role !== 'admin' && profile.role !== 'lead') {
        router.push('/')
        return
      }
      fetchEquipment()
      fetchBorrowings()
    }
  }, [user, profile, authLoading, router])

  const fetchEquipment = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('equipment_items')
        .select('*')
        .order('category')
        .order('name')

      if (error) throw error
      setEquipment(data || [])
    } catch (error) {
      console.error('Error fetching equipment:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBorrowings = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('equipment_borrowing')
        .select(`
          *,
          profile:profiles!equipment_borrowing_user_id_fkey(username, full_name)
        `)
        .in('status', ['pending', 'borrowed', 'overdue'])
        .order('due_date')

      if (error) throw error
      setBorrowings(data || [])
    } catch (error) {
      console.error('Error fetching borrowings:', error)
    }
  }

  const handleSubmitEquipment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const equipmentData = {
      name: formData.name,
      category: formData.category,
      description: formData.description || null,
      serial_number: formData.serial_number || null,
      condition: formData.condition,
      total_quantity: formData.total_quantity,
      available_quantity: formData.available_quantity,
      is_active: formData.is_active
    }

    try {
      if (editingEquipment) {
        const { error } = await (supabase as any)
          .from('equipment_items')
          .update(equipmentData)
          .eq('id', editingEquipment.id)

        if (error) throw error
        alert('Equipment updated successfully!')
      } else {
        const { error } = await (supabase as any)
          .from('equipment_items')
          .insert(equipmentData)

        if (error) throw error
        alert('Equipment created successfully!')
      }
      
      setShowEquipmentForm(false)
      setEditingEquipment(null)
      setFormData({
        name: '',
        category: 'instrument',
        description: '',
        serial_number: '',
        condition: 'good',
        total_quantity: 1,
        available_quantity: 1,
        is_active: true
      })
      fetchEquipment()
    } catch (error) {
      console.error('Error saving equipment:', error)
      alert('Failed to save equipment')
    }
  }

  const handleEditEquipment = (item: EquipmentItem) => {
    setEditingEquipment(item)
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      serial_number: item.serial_number || '',
      condition: item.condition,
      total_quantity: item.total_quantity,
      available_quantity: item.available_quantity,
      is_active: item.is_active
    })
    setShowEquipmentForm(true)
  }

  const handleDeleteEquipment = async (id: number) => {
    if (!confirm('Are you sure you want to delete this equipment?')) return

    try {
      const { error } = await (supabase as any)
        .from('equipment_items')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Equipment deleted successfully!')
      fetchEquipment()
    } catch (error) {
      console.error('Error deleting equipment:', error)
      alert('Failed to delete equipment')
    }
  }

  const handleUpdateBorrowing = async (id: number, status: 'approved' | 'rejected' | 'borrowed' | 'returned', updates?: any) => {
    try {
      const updateData: any = {
        status,
        approved_by: user!.id,
        ...updates
      }

      if (status === 'borrowed' && !updates?.borrowed_date) {
        updateData.borrowed_date = new Date().toISOString().split('T')[0]
        updateData.approved_at = new Date().toISOString()
      }

      if (status === 'returned') {
        updateData.return_date = new Date().toISOString().split('T')[0]
      }

      const { error } = await (supabase as any)
        .from('equipment_borrowing')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      alert(`Request ${status} successfully!`)
      fetchBorrowings()
      fetchEquipment()
    } catch (error) {
      console.error('Error updating borrowing:', error)
      alert('Failed to update request')
    }
  }

  const handleEditDueDate = (borrowing: BorrowingRequest) => {
    const newDueDate = prompt('Enter new due date (YYYY-MM-DD):', borrowing.due_date)
    if (newDueDate) {
      handleUpdateBorrowing(borrowing.id, borrowing.status as any, { due_date: newDueDate })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'borrowed': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'overdue': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200'
      default: return 'text-gray-600'
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-700 bg-green-100'
      case 'good': return 'text-blue-700 bg-blue-100'
      case 'fair': return 'text-yellow-700 bg-yellow-100'
      case 'needs-repair': return 'text-red-700 bg-red-100'
      default: return 'text-gray-700'
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Equipment Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage equipment inventory and borrowing requests
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-300 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('equipment')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'equipment'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              <FaBox className="inline mr-2" />
              Equipment ({equipment.length})
            </button>
            <button
              onClick={() => setActiveTab('borrowings')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'borrowings'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              <FaGuitar className="inline mr-2" />
              Borrowings ({borrowings.length})
            </button>
          </div>
        </div>

        {/* Equipment Tab */}
        {activeTab === 'equipment' && (
          <div>
            <button
              onClick={() => {
                setShowEquipmentForm(true)
                setEditingEquipment(null)
                setFormData({
                  name: '',
                  category: 'instrument',
                  description: '',
                  serial_number: '',
                  condition: 'good',
                  total_quantity: 1,
                  available_quantity: 1,
                  is_active: true
                })
              }}
              className="mb-6 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2"
            >
              <FaPlus /> Add Equipment
            </button>

            {/* Equipment List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {equipment.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {item.name}
                      </h3>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {item.category.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${getConditionColor(item.condition)}`}>
                          {item.condition.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {item.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {item.description}
                    </p>
                  )}
                  <div className="space-y-1 text-sm mb-3 text-gray-700 dark:text-gray-300">
                    <p><strong>Quantity:</strong> {item.available_quantity} / {item.total_quantity}</p>
                    {item.serial_number && <p><strong>S/N:</strong> {item.serial_number}</p>}
                    <p><strong>Status:</strong> <span className={item.is_active ? 'text-green-600' : 'text-red-600'}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span></p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditEquipment(item)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                    >
                      <FaEdit className="inline mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteEquipment(item.id)}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                      <FaTrash className="inline mr-1" /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Borrowings Tab */}
        {activeTab === 'borrowings' && (
          <div className="space-y-4">
            {borrowings.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <FaGuitar className="mx-auto text-6xl text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No active borrowing requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {borrowings.map((borrowing) => {
                  const item = equipment.find(e => e.id === borrowing.equipment_id)
                  return (
                    <motion.div
                      key={borrowing.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {item?.name || 'Unknown Equipment'}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div>
                              <p><strong>Quantity:</strong> {borrowing.quantity}</p>
                              <p><strong>Due:</strong> {new Date(borrowing.due_date).toLocaleDateString()}</p>
                              {borrowing.borrowed_date && (
                                <p><strong>Borrowed:</strong> {new Date(borrowing.borrowed_date).toLocaleDateString()}</p>
                              )}
                            </div>
                            <div>
                              <p><strong>User:</strong> {borrowing.profile?.full_name || borrowing.profile?.username || 'Unknown'}</p>
                              <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${getStatusColor(borrowing.status)}`}>
                                {borrowing.status.toUpperCase()}
                              </span></p>
                            </div>
                          </div>
                          {borrowing.notes && (
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                              <strong>Notes:</strong> {borrowing.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {borrowing.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateBorrowing(borrowing.id, 'borrowed')}
                                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                                title="Approve & Mark Borrowed"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleUpdateBorrowing(borrowing.id, 'rejected')}
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                                title="Reject"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          {(borrowing.status === 'borrowed' || borrowing.status === 'overdue') && (
                            <button
                              onClick={() => handleUpdateBorrowing(borrowing.id, 'returned')}
                              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                              title="Mark Returned"
                            >
                              Return
                            </button>
                          )}
                          <button
                            onClick={() => handleEditDueDate(borrowing)}
                            className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                            title="Edit Due Date"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Equipment Form Modal */}
      {showEquipmentForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingEquipment ? 'Edit Equipment' : 'Add New Equipment'}
            </h3>
            <form onSubmit={handleSubmitEquipment} className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="instrument">Instrument</option>
                  <option value="amplifier">Amplifier</option>
                  <option value="microphone">Microphone</option>
                  <option value="audio-interface">Audio Interface</option>
                  <option value="accessory">Accessory</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Condition *
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData({ ...formData, condition: e.target.value as any })}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="needs-repair">Needs Repair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Total Quantity *
                </label>
                <input
                  type="number"
                  value={formData.total_quantity}
                  onChange={(e) => setFormData({ ...formData, total_quantity: parseInt(e.target.value) })}
                  min={1}
                  required
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Available Quantity *
                </label>
                <input
                  type="number"
                  value={formData.available_quantity}
                  onChange={(e) => setFormData({ ...formData, available_quantity: parseInt(e.target.value) })}
                  min={0}
                  max={formData.total_quantity}
                  required
                  className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label className="text-sm text-gray-700 dark:text-gray-300">Active</label>
              </div>
              <div className="col-span-2 flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                >
                  {editingEquipment ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEquipmentForm(false)
                    setEditingEquipment(null)
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
