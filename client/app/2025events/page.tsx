'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AnimatedSection from '../components/layout/AnimatedSection';
import EventCard from '../components/ui/EventCard';
import { getEvents } from '../lib/api/events';
import { Event } from '../lib/supabase';

type EventCategory = 'All' | 'Performances' | 'Open Mics' | 'Competitions' | 'Workshops';

// Convert category to URL-friendly format
const categoryToHash = (category: EventCategory): string => {
  return category.toLowerCase().replace(/\s+/g, '-');
};

// Convert hash to category
const hashToCategory = (hash: string): EventCategory => {
  const categoryMap: Record<string, EventCategory> = {
    'all': 'All',
    'performances': 'Performances',
    'open-mics': 'Open Mics',
    'competitions': 'Competitions',
    'workshops': 'Workshops'
  };
  
  return categoryMap[hash] || 'All';
};

export default function Events2025Page() {
  const [activeTab, setActiveTab] = useState<'past' | 'upcoming'>('upcoming');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      return hash ? hashToCategory(hash) : 'All';
    }
    return 'All';
  });

  // State for events from database
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories: EventCategory[] = ['All', 'Performances', 'Open Mics', 'Competitions', 'Workshops'];

  // Fetch events from Supabase
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        console.log('Fetching events for year 2025...');
        const [past, upcoming] = await Promise.all([
          getEvents(2025, 'past'),
          getEvents(2025, 'upcoming')
        ]);
        console.log('Past events fetched:', past);
        console.log('Upcoming events fetched:', upcoming);
        setPastEvents(past);
        setUpcomingEvents(upcoming);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const category = hashToCategory(hash);
        setSelectedCategory(category);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Update URL hash when category changes
  const handleCategoryChange = (category: EventCategory) => {
    setSelectedCategory(category);
    const hash = categoryToHash(category);
    window.history.pushState(null, '', `#${hash}`);
  };

  // Filter events based on selected category
  const filterEventsByCategory = (events: Event[]) => {
    if (selectedCategory === 'All') return events;
    return events.filter(event => event.category === selectedCategory);
  };

  const filteredPastEvents = filterEventsByCategory(pastEvents);
  const filteredUpcomingEvents = filterEventsByCategory(upcomingEvents);

  console.log('Current state:', {
    loading,
    error,
    pastEventsCount: pastEvents.length,
    upcomingEventsCount: upcomingEvents.length,
    filteredPastCount: filteredPastEvents.length,
    filteredUpcomingCount: filteredUpcomingEvents.length,
    activeTab,
    selectedCategory
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading events...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">{error}</div>
      </div>
    );
  }

  const filteredEvents = activeTab === 'past' ? filteredPastEvents : filteredUpcomingEvents;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <AnimatedSection id="events-page" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 via-purple-400 to-secondary-400">
              2025 Events
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-6">
              Join us for exciting musical experiences and workshops
            </p>
            <a 
              href="/2025events/calendar" 
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              View Calendar
            </a>
          </motion.div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex rounded-lg bg-gray-800/50 backdrop-blur-sm p-1 shadow-lg">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'upcoming'
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setActiveTab('past')}
                className={`px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                  activeTab === 'past'
                    ? 'bg-gradient-to-r from-primary-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                }`}
              >
                Past Events
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-primary-500 via-purple-500 to-secondary-500 text-white shadow-lg shadow-purple-500/20'
                    : 'bg-gray-800/50 backdrop-blur-sm text-gray-300 hover:text-white hover:bg-gray-700/50 hover:shadow-md'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {activeTab === 'past' && filteredPastEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center text-gray-300 py-16 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50"
            >
              <p className="text-2xl font-medium mb-3">No past events for 2025 yet.</p>
              <p className="text-gray-400">Check out our upcoming events!</p>
            </motion.div>
          ) : activeTab === 'upcoming' && filteredUpcomingEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center text-gray-300 py-16 bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50"
            >
              <p className="text-2xl font-medium mb-3">No upcoming events at the moment.</p>
              <p className="text-gray-400">Check back later for new events!</p>
            </motion.div>
          ) : (
            <motion.div
              key={`${activeTab}-${selectedCategory}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </motion.div>
          )}
        </div>
      </AnimatedSection>
    </main>
  );
}