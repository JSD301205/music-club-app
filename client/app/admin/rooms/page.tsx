'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaDoorOpen, FaCalendar } from 'react-icons/fa'
import { createClient } from '@/app/lib/supabase-client'
import { useAuth } from '@/app/contexts/AuthContext'

interface PracticeRoom {
  id: number
  name: string
  description: string | null
  capacity: number
  equipment_available: string[]
  image_url: string | null
  is_active: boolean
}

interface RoomBooking {
  id: number
  room_id: number
  booking_date: string
  start_time: string
  end_time: string
  purpose: string | null
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  user_id: string
  profile?: {
    username: string
    full_name: string | null
  }
}

export default function AdminRoomsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  
  const [rooms, setRooms] = useState<PracticeRoom[]>([])
  const [bookings, setBookings] = useState<RoomBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'rooms' | 'bookings'>('rooms')
  const [showRoomForm, setShowRoomForm] = useState(false)
  const [editingRoom, setEditingRoom] = useState<PracticeRoom | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capacity: 1,
    equipment_available: '',
    is_active: true
  })

  useEffect(() => {
    if (!authLoading) {
      if (!user || !profile || (profile.role !== 'admin' && profile.role !== 'lead')) {
        router.push('/')
      } else {
        fetchRooms()
        fetchBookings()
      }
    }
  }, [user, profile, authLoading])

  const fetchRooms = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('practice_rooms')
        .select('*')
        .order('name')

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('room_bookings')
        .select(`
          *,
          profile:profiles!room_bookings_user_id_fkey(username, full_name)
        `)
        .in('status', ['pending', 'approved'])
        .gte('booking_date', new Date().toISOString().split('T')[0])
        .order('booking_date')
        .order('start_time')

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
    }
  }

  const handleSubmitRoom = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const roomData = {
      name: formData.name,
      description: formData.description || null,
      capacity: formData.capacity,
      equipment_available: formData.equipment_available.split(',').map(s => s.trim()).filter(Boolean),
      is_active: formData.is_active
    }

    try {
      if (editingRoom) {
        const { error } = await (supabase as any)
          .from('practice_rooms')
          .update(roomData)
          .eq('id', editingRoom.id)

        if (error) throw error
        alert('Room updated successfully!')
      } else {
        const { error } = await (supabase as any)
          .from('practice_rooms')
          .insert(roomData)

        if (error) throw error
        alert('Room created successfully!')
      }
      
      setShowRoomForm(false)
      setEditingRoom(null)
      setFormData({ name: '', description: '', capacity: 1, equipment_available: '', is_active: true })
      fetchRooms()
    } catch (error) {
      console.error('Error saving room:', error)
      alert('Failed to save room')
    }
  }

  const handleEditRoom = (room: PracticeRoom) => {
    setEditingRoom(room)
    setFormData({
      name: room.name,
      description: room.description || '',
      capacity: room.capacity,
      equipment_available: room.equipment_available.join(', '),
      is_active: room.is_active
    })
    setShowRoomForm(true)
  }

  const handleDeleteRoom = async (id: number) => {
    if (!confirm('Are you sure you want to delete this room?')) return

    try {
      const { error } = await (supabase as any)
        .from('practice_rooms')
        .delete()
        .eq('id', id)

      if (error) throw error
      alert('Room deleted successfully!')
      fetchRooms()
    } catch (error) {
      console.error('Error deleting room:', error)
      alert('Failed to delete room')
    }
  }

  const handleUpdateBooking = async (id: number, status: 'approved' | 'rejected', updates?: any) => {
    try {
      const updateData = {
        status,
        approved_by: user!.id,
        approved_at: new Date().toISOString(),
        ...updates
      }

      const { error } = await (supabase as any)
        .from('room_bookings')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      alert(`Booking ${status} successfully!`)
      fetchBookings()
    } catch (error) {
      console.error('Error updating booking:', error)
      alert('Failed to update booking')
    }
  }

  const handleEditBooking = async (booking: RoomBooking) => {
    const newDate = prompt('Enter new date (YYYY-MM-DD):', booking.booking_date)
    const newStart = prompt('Enter new start time (HH:MM):', booking.start_time)
    const newEnd = prompt('Enter new end time (HH:MM):', booking.end_time)

    if (newDate && newStart && newEnd) {
      handleUpdateBooking(booking.id, booking.status === 'pending' ? 'approved' : 'approved', {
        booking_date: newDate,
        start_time: newStart,
        end_time: newEnd
      })
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
            Practice Rooms Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage practice rooms and booking requests
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-300 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('rooms')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'rooms'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              <FaDoorOpen className="inline mr-2" />
              Rooms ({rooms.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'bookings'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400'
              }`}
            >
              <FaCalendar className="inline mr-2" />
              Bookings ({bookings.length})
            </button>
          </div>
        </div>

        {/* Rooms Tab */}
        {activeTab === 'rooms' && (
          <div>
            <button
              onClick={() => {
                setShowRoomForm(true)
                setEditingRoom(null)
                setFormData({ name: '', description: '', capacity: 1, equipment_available: '', is_active: true })
              }}
              className="mb-6 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2"
            >
              <FaPlus /> Add Room
            </button>

            {/* Rooms List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {rooms.map((room) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {room.name}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        room.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {room.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  {room.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {room.description}
                    </p>
                  )}
                  <p className="text-sm mb-2 text-gray-700 dark:text-gray-300">
                    <strong>Capacity:</strong> {room.capacity}
                  </p>
                  {room.equipment_available.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold mb-1 text-gray-700 dark:text-gray-300">Equipment:</p>
                      <div className="flex flex-wrap gap-1">
                        {room.equipment_available.map((eq, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">
                            {eq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditRoom(room)}
                      className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                    >
                      <FaEdit className="inline mr-1" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                      <FaTrash className="inline mr-1" /> Delete
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Room Form - Positioned Below Rooms */}
            {showRoomForm && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
              >
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </h3>
                <form onSubmit={handleSubmitRoom} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Room Name *
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
                      Capacity *
                    </label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                      min={1}
                      required
                      className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Equipment Available (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formData.equipment_available}
                      onChange={(e) => setFormData({ ...formData, equipment_available: e.target.value })}
                      placeholder="Drum Kit, PA System, Microphones"
                      className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <label className="text-sm text-gray-700 dark:text-gray-300">Active</label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                    >
                      {editingRoom ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoomForm(false)
                        setEditingRoom(null)
                      }}
                      className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <FaCalendar className="mx-auto text-6xl text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No upcoming bookings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => {
                  const room = rooms.find(r => r.id === booking.room_id)
                  return (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                            {room?.name || 'Unknown Room'}
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div>
                              <p><strong>Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
                              <p><strong>Time:</strong> {booking.start_time} - {booking.end_time}</p>
                            </div>
                            <div>
                              <p><strong>Booked by:</strong> {booking.profile?.full_name || booking.profile?.username || 'Unknown'}</p>
                              <p><strong>Status:</strong> <span className={`px-2 py-1 rounded text-xs ${
                                booking.status === 'approved'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              }`}>{booking.status.toUpperCase()}</span></p>
                            </div>
                          </div>
                          {booking.purpose && (
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                              <strong>Purpose:</strong> {booking.purpose}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          {booking.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateBooking(booking.id, 'approved')}
                                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                                title="Approve"
                              >
                                <FaCheck />
                              </button>
                              <button
                                onClick={() => handleUpdateBooking(booking.id, 'rejected')}
                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                                title="Reject"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleEditBooking(booking)}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                            title="Edit Details"
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
    </div>
  )
}
