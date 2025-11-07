'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaGuitar, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaExclamationTriangle, FaBox } from 'react-icons/fa'
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
  image_url: string | null
  is_active: boolean
}

interface BorrowingRequest {
  id: number
  equipment_id: number
  user_id: string
  quantity: number
  borrowed_date: string | null
  due_date: string
  return_date: string | null
  status: 'pending' | 'approved' | 'borrowed' | 'returned' | 'overdue' | 'rejected'
  notes: string | null
  created_at: string
  equipment?: EquipmentItem
}

export default function EquipmentPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  
  const [equipment, setEquipment] = useState<EquipmentItem[]>([])
  const [myBorrowings, setMyBorrowings] = useState<BorrowingRequest[]>([])
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'browse' | 'my-requests'>('browse')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/signin')
      } else {
        fetchEquipment()
        fetchMyBorrowings()
      }
    }
  }, [user, authLoading])

  const fetchEquipment = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('equipment_items')
        .select('*')
        .eq('is_active', true)
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

  const fetchMyBorrowings = async () => {
    if (!user) return

    try {
      const { data, error } = await (supabase as any)
        .from('equipment_borrowing')
        .select(`
          *,
          equipment:equipment_items(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setMyBorrowings(data || [])
    } catch (error) {
      console.error('Error fetching my borrowings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !selectedEquipment) return
    
    if (!dueDate) {
      alert('Please select a due date')
      return
    }

    if (quantity > selectedEquipment.available_quantity) {
      alert(`Only ${selectedEquipment.available_quantity} units available`)
      return
    }

    setSubmitting(true)
    try {
      const { error } = await (supabase as any)
        .from('equipment_borrowing')
        .insert({
          equipment_id: selectedEquipment.id,
          user_id: user.id,
          quantity: quantity,
          due_date: dueDate,
          notes: notes || null,
          status: 'pending'
        })

      if (error) throw error
      
      alert('Equipment borrowed successfully! You can now pick it up.')
      setSelectedEquipment(null)
      setQuantity(1)
      setDueDate('')
      setNotes('')
      fetchEquipment()
      fetchMyBorrowings()
      setActiveTab('my-requests')
    } catch (error) {
      console.error('Error creating borrowing request:', error)
      alert('Failed to create borrowing request')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'borrowed': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
      case 'returned': return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-200'
      case 'overdue': return 'text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-200'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'borrowed': return <FaCheckCircle />
      case 'pending': return <FaHourglassHalf />
      case 'rejected': return <FaTimesCircle />
      case 'returned': return <FaCheckCircle />
      case 'overdue': return <FaExclamationTriangle />
      default: return null
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300'
      case 'good': return 'text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300'
      case 'fair': return 'text-yellow-700 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300'
      case 'needs-repair': return 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300'
      default: return 'text-gray-700'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'instrument': return '🎸'
      case 'amplifier': return '🔊'
      case 'microphone': return '🎤'
      case 'audio-interface': return '🎛️'
      case 'accessory': return '🔌'
      default: return '📦'
    }
  }

  const categories = ['all', 'instrument', 'amplifier', 'microphone', 'audio-interface', 'accessory', 'other']
  
  const filteredEquipment = filterCategory === 'all' 
    ? equipment 
    : equipment.filter(item => item.category === filterCategory)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const minDate = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Equipment Inventory
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse and borrow club equipment for your musical needs
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-300 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'browse'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FaBox className="inline mr-2" />
              Browse Equipment
            </button>
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'my-requests'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FaGuitar className="inline mr-2" />
              My Requests ({myBorrowings.length})
            </button>
          </div>
        </div>

        {/* Browse Equipment Tab */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Equipment List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Available Equipment
                </h2>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1).replace('-', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEquipment.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ scale: 1.02 }}
                    className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-2 cursor-pointer transition-all ${
                      selectedEquipment?.id === item.id
                        ? 'border-primary-600'
                        : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                    onClick={() => setSelectedEquipment(item)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {item.name}
                          </h3>
                        </div>
                        <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                          {item.category.replace('-', ' ').toUpperCase()}
                        </span>
                      </div>
                      {selectedEquipment?.id === item.id && (
                        <FaCheckCircle className="text-primary-600 text-2xl" />
                      )}
                    </div>
                    
                    {item.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Available: {item.available_quantity} / {item.total_quantity}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded font-semibold ${getConditionColor(item.condition)}`}>
                        {item.condition.toUpperCase()}
                      </span>
                    </div>

                    {item.serial_number && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        S/N: {item.serial_number}
                      </p>
                    )}

                    {item.available_quantity === 0 && (
                      <div className="mt-3 p-2 bg-red-100 dark:bg-red-900 rounded text-sm text-red-800 dark:text-red-200">
                        Currently unavailable
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Borrowing Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Borrow Equipment
                </h2>
                
                {!selectedEquipment ? (
                  <p className="text-gray-600 dark:text-gray-400">
                    Select an equipment item to create a borrowing request
                  </p>
                ) : selectedEquipment.available_quantity === 0 ? (
                  <div className="p-4 bg-red-100 dark:bg-red-900 rounded text-red-800 dark:text-red-200">
                    This equipment is currently unavailable. Please check back later.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        {selectedEquipment.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {selectedEquipment.available_quantity} available
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        min={1}
                        max={selectedEquipment.available_quantity}
                        required
                        className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Return Due Date *
                      </label>
                      <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        min={minDate}
                        required
                        className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                        className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Purpose of borrowing, special requirements, etc."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Borrow Equipment'}
                    </button>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      * Equipment will be automatically allocated if available
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Requests Tab */}
        {activeTab === 'my-requests' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              My Borrowing Requests
            </h2>
            
            {myBorrowings.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <FaGuitar className="mx-auto text-6xl text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  You haven't made any borrowing requests yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {myBorrowings.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {request.equipment?.name || 'Equipment'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {request.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        <strong>Quantity:</strong> {request.quantity}
                      </p>
                      <p>
                        <strong>Due Date:</strong> {new Date(request.due_date).toLocaleDateString()}
                      </p>
                      {request.borrowed_date && (
                        <p>
                          <strong>Borrowed:</strong> {new Date(request.borrowed_date).toLocaleDateString()}
                        </p>
                      )}
                      {request.return_date && (
                        <p>
                          <strong>Returned:</strong> {new Date(request.return_date).toLocaleDateString()}
                        </p>
                      )}
                      {request.notes && (
                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                          <strong>Notes:</strong> {request.notes}
                        </p>
                      )}
                    </div>

                    {request.status === 'overdue' && (
                      <div className="mt-4 p-2 bg-orange-100 dark:bg-orange-900 rounded text-sm text-orange-800 dark:text-orange-200">
                        ⚠️ This item is overdue. Please return it as soon as possible.
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
