'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { FaCalendar, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { Event } from '../../data/events2024';
import { Event as SupabaseEvent } from '../../lib/supabase';
import Link from 'next/link';
import LazyYoutubeEmbed from './LazyYoutubeEmbed';

interface EventCardProps {
  event: Event | SupabaseEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Helper functions to handle both camelCase (2024) and snake_case (2025 Supabase) properties
  const getRegistrationLink = () => {
    return (event as any).registrationLink || (event as any).registration_link;
  };

  const getYoutubeUrl = () => {
    return (event as any).youtubeUrl || (event as any).youtube_url;
  };

  const getViewBandsLink = () => {
    return (event as any).viewBandsLink || (event as any).view_bands_link;
  };

  const getGalleryRoute = () => {
    return (event as any).galleryRoute || (event as any).gallery_route;
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Extract event name from title (e.g., "Rolling in the Deep (Orientation)" -> "Orientation")
  const getEventName = (title: string) => {
    const match = title.match(/\((.*?)\)/);
    return match ? match[1] : '';
  };

  const shouldShowGalleryButton = (event: Event | SupabaseEvent) => {
    // Don't show gallery for these specific events
    if (event.title === "Unofficial Open Mic Night") return false;
    if (event.title === "Spooky Symphonies: Battle of Bands Meraki") return false;
    
    // Show gallery button if the event has a gallery route
    const galleryRoute = getGalleryRoute();
    if (!galleryRoute) return false;
    
    // Show for Open Mics, Competitions, Workshops, or specific club performances
    const eventsWithGallery = [
      "4th [Unofficial] Open Mic Night",
      "Republic Day (Club Performance)",
      "CVIP (Club Performance)",
      "Meraki (Club Performance)",
      "Ganesh Chaturthi (Club Performance)",
      "Blastroduction (Club Performance)",
      "Orientation (Club Performance)",
      "Independence Day (Club Performance)",
      "Onam (Club Performance)",
      "Workshop: How to form a Band",
      "Winter Concert (Club Performance)",
      "1st Open Mic Night"
    ];
    
    return event.category === 'Open Mics' || 
           event.category === 'Competitions' || 
           event.category === 'Workshops' ||
           eventsWithGallery.includes(event.title);
  };

  const isSpookySymponies = event.title === "Spooky Symphonies: Battle of Bands Meraki";

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
      >
        <div className="relative aspect-square w-full">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-semibold text-white">{event.title.replace(/\(.*?\)/, '').trim()}</h3>
            {event.category === 'Performances' && (
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-center">
                {getEventName(event.title)}
              </span>
            )}
          </div>
          <div className="space-y-2 text-gray-300">
            <p className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {event.date}
            </p>
            <p className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {event.time}
            </p>
            <p className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {event.location}
            </p>
          </div>
          <p className="mt-4 text-gray-400">{event.description}</p>
          <div className="mt-6 space-y-3">
            {/* For club performances with YouTube video */}
            {event.category === 'Performances' && getYoutubeUrl() && !getGalleryRoute() ? (
              <button
                onClick={() => setIsVideoOpen(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                </svg>
                Watch Video
              </button>
            ) : /* For Spooky Symphonies special case */
            isSpookySymponies ? (
              <div className="grid grid-cols-2 gap-3">
                {getRegistrationLink() && (
                  <a
                    href={getRegistrationLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                  >
                    Register Now
                  </a>
                )}
                {getViewBandsLink() && (
                  <Link
                    href={getViewBandsLink()}
                    className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                  >
                    View Bands
                  </Link>
                )}
              </div>
            ) : /* For club performances with gallery route */
            event.category === 'Performances' && getGalleryRoute() ? (
              <Link
                href={getGalleryRoute()}
                className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                Gallery
              </Link>
            ) : /* For Open Mics, Competitions, Workshops with gallery */
            shouldShowGalleryButton(event) ? (
              <div className="grid grid-cols-2 gap-3">
                {getRegistrationLink() && (
                  <a
                    href={getRegistrationLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
                  >
                    Register Now
                  </a>
                )}
                {getGalleryRoute() && (
                  <Link
                    href={getGalleryRoute()}
                    className={`w-full bg-secondary-600 hover:bg-secondary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center ${
                      !getRegistrationLink() ? 'col-span-2' : ''
                    }`}
                  >
                    Gallery
                  </Link>
                )}
              </div>
            ) : /* Fallback: just registration link if available */
            getRegistrationLink() ? (
              <a
                href={getRegistrationLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300 flex items-center justify-center"
              >
                Register Now
              </a>
            ) : null}
          </div>
        </div>
      </motion.div>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            onClick={() => setIsVideoOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl bg-gray-900 rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 rounded-full p-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="relative w-full" style={{ 
                maxHeight: isMobile ? '80vh' : '90vh'
              }}>
                {getYoutubeUrl() && (
                  <LazyYoutubeEmbed youtubeUrl={getYoutubeUrl()} title={event.title} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}