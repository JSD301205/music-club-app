'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FaCalendar, FaClock, FaDoorOpen, FaUsers, FaCheck, FaTimes, FaHourglassHalf } from 'react-icons/fa'
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
  user_id: string
  booking_date: string
  start_time: string
  end_time: string
  purpose: string | null
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  created_at: string
  room?: PracticeRoom
  profile?: {
    username: string
    full_name: string | null
  }
}

export default function RoomBookingsPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()
  const supabase = createClient()
  
  const [rooms, setRooms] = useState<PracticeRoom[]>([])
  const [myBookings, setMyBookings] = useState<RoomBooking[]>([])
  const [selectedRoom, setSelectedRoom] = useState<PracticeRoom | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [purpose, setPurpose] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'book' | 'my-bookings'>('book')

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/signin')
      } else {
        fetchRooms()
        fetchMyBookings()
      }
    }
  }, [user, authLoading])

  const fetchRooms = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('practice_rooms')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setRooms(data || [])
    } catch (error) {
      console.error('Error fetching rooms:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyBookings = async () => {
    if (!user) return

    try {
      const { data, error } = await (supabase as any)
        .from('room_bookings')
        .select(`
          *,
          room:practice_rooms(*)
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false })
        .order('start_time', { ascending: false })

      if (error) throw error
      setMyBookings(data || [])
    } catch (error) {
      console.error('Error fetching my bookings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !selectedRoom) return
    
    if (!selectedDate || !startTime || !endTime) {
      alert('Please fill in all required fields')
      return
    }

    if (startTime >= endTime) {
      alert('End time must be after start time')
      return
    }

    setSubmitting(true)
    try {
      const { error } = await (supabase as any)
        .from('room_bookings')
        .insert({
          room_id: selectedRoom.id,
          user_id: user.id,
          booking_date: selectedDate,
          start_time: startTime,
          end_time: endTime,
          purpose: purpose || null,
          status: 'pending'
        })

      if (error) {
        if (error.message.includes('no_overlap')) {
          alert('This time slot is already booked. Please choose a different time.')
        } else {
          throw error
        }
      } else {
        alert('Booking request submitted successfully! Awaiting admin approval.')
        setSelectedRoom(null)
        setSelectedDate('')
        setStartTime('')
        setEndTime('')
        setPurpose('')
        fetchMyBookings()
        setActiveTab('my-bookings')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Failed to create booking')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return

    try {
      const { error } = await (supabase as any)
        .from('room_bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (error) throw error
      alert('Booking cancelled successfully')
      fetchMyBookings()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      alert('Failed to cancel booking')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
      case 'rejected': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
      case 'cancelled': return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <FaCheck />
      case 'pending': return <FaHourglassHalf />
      case 'rejected': return <FaTimes />
      case 'cancelled': return <FaTimes />
      default: return null
    }
  }

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
            Practice Room Booking
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Book practice rooms for your jam sessions and rehearsals
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-300 dark:border-gray-700">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('book')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'book'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FaDoorOpen className="inline mr-2" />
              Book a Room
            </button>
            <button
              onClick={() => setActiveTab('my-bookings')}
              className={`px-4 py-2 font-medium transition-colors border-b-2 ${
                activeTab === 'my-bookings'
                  ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <FaCalendar className="inline mr-2" />
              My Bookings ({myBookings.length})
            </button>
          </div>
        </div>

        {/* Book a Room Tab */}
        {activeTab === 'book' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Rooms List */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Available Rooms
              </h2>
              {rooms.map((room) => (
                <motion.div
                  key={room.id}
                  whileHover={{ scale: 1.02 }}
                  className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border-2 cursor-pointer transition-all ${
                    selectedRoom?.id === room.id
                      ? 'border-primary-600'
                      : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedRoom(room)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {room.name}
                      </h3>
                      {room.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-3">
                          {room.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <FaUsers /> Capacity: {room.capacity}
                        </span>
                      </div>
                      {room.equipment_available && room.equipment_available.length > 0 && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Available Equipment:
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {room.equipment_available.map((eq, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200 text-xs rounded"
                              >
                                {eq}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    {selectedRoom?.id === room.id && (
                      <FaCheck className="text-primary-600 text-2xl" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Booking Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Book {selectedRoom ? selectedRoom.name : 'a Room'}
                </h2>
                
                {!selectedRoom ? (
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a room to begin booking
                  </p>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Date *
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={minDate}
                        required
                        className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Start Time *
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        required
                        className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        End Time *
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        required
                        className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Purpose (Optional)
                      </label>
                      <textarea
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                        rows={3}
                        className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Band practice, solo rehearsal, etc."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {submitting ? 'Submitting...' : 'Submit Booking Request'}
                    </button>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      * Your booking request will be sent to admins for approval
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

        {/* My Bookings Tab */}
        {activeTab === 'my-bookings' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              My Booking History
            </h2>
            
            {myBookings.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
                <FaCalendar className="mx-auto text-6xl text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400">
                  You haven't made any bookings yet
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myBookings.map((booking) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {booking.room?.name || 'Room'}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <FaCalendar />
                        <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaClock />
                        <span>{booking.start_time} - {booking.end_time}</span>
                      </div>
                      {booking.purpose && (
                        <p className="mt-2 text-gray-700 dark:text-gray-300">
                          <strong>Purpose:</strong> {booking.purpose}
                        </p>
                      )}
                    </div>

                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancelBooking(booking.id)}
                        className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg transition-colors"
                      >
                        Cancel Booking
                      </button>
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
