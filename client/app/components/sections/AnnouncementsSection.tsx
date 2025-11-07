'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaBullhorn, FaQuestionCircle, FaPoll, FaTrophy } from 'react-icons/fa'
import { createClient } from '@/app/lib/supabase-client'
import { useAuth } from '@/app/contexts/AuthContext'
import QuizCard from './QuizCard'
import PollCard from './PollCard'
import AnnouncementCard from './AnnouncementCard'

interface Announcement {
  id: number
  type: 'quiz' | 'poll' | 'announcement' | 'event'
  title: string
  description: string
  is_active: boolean
  priority: number
  start_date: string | null
  end_date: string | null
  created_at: string
  metadata: any
}

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'quiz' | 'poll' | 'announcement'>('all')
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .or(`start_date.is.null,start_date.lte.${now}`)
        .or(`end_date.is.null,end_date.gte.${now}`)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error

      setAnnouncements(data || [])
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAnnouncements = activeTab === 'all' 
    ? announcements 
    : announcements.filter(a => a.type === activeTab)

  const tabs = [
    { id: 'all', label: 'All', icon: FaBullhorn },
    { id: 'quiz', label: 'Quizzes', icon: FaQuestionCircle },
    { id: 'poll', label: 'Polls', icon: FaPoll },
    { id: 'announcement', label: 'News', icon: FaTrophy },
  ]

  return (
    <section id="announcements" className="py-20 bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Bulletin Board
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Stay updated with the latest quizzes, polls, and announcements from the Music Club
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const count = tab.id === 'all' 
              ? announcements.length 
              : announcements.filter(a => a.type === tab.id).length
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full font-semibold
                  transition-all duration-300 transform hover:scale-105
                  ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }
                `}
              >
                <Icon className="text-xl" />
                <span>{tab.label}</span>
                {count > 0 && (
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center py-20"
          >
            <FaBullhorn className="text-6xl text-gray-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No {activeTab === 'all' ? 'announcements' : activeTab + 's'} yet</h3>
            <p className="text-gray-400">Check back later for updates!</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map((announcement, index) => (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                {announcement.type === 'quiz' ? (
                  <QuizCard announcement={announcement} user={user} onRefresh={fetchAnnouncements} />
                ) : announcement.type === 'poll' ? (
                  <PollCard announcement={announcement} user={user} onRefresh={fetchAnnouncements} />
                ) : (
                  <AnnouncementCard announcement={announcement} />
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
