'use client';

import { useState, useEffect } from 'react';
import GallerySection from '../components/sections/GallerySection';
import { getGalleryItems } from '../lib/api/gallery';
import { GalleryItem } from '../lib/supabase';

// Convert filter to URL-friendly format
const filterToHash = (filter: string): string => {
  return filter.toLowerCase();
};

// Convert hash to filter
const hashToFilter = (hash: string): string => {
  const validFilters = ['all', 'performances', 'workshops', 'jams', 'covers', 'team'];
  return validFilters.includes(hash) ? hash : 'all';
};

export default function Gallery2025Page() {
  const [activeFilter, setActiveFilter] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      return hash ? hashToFilter(hash) : 'all';
    }
    return 'all';
  });

  // State for gallery items from database
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch gallery items from Supabase
  useEffect(() => {
    async function fetchGalleryItems() {
      try {
        setLoading(true);
        const items = await getGalleryItems(2025);
        // Items are already sorted by ID descending (newest first)
        setGalleryItems(items);
        setError(null);
      } catch (err) {
        console.error('Error fetching gallery items:', err);
        setError('Failed to load gallery. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchGalleryItems();
  }, []);

  // Handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        const filter = hashToFilter(hash);
        setActiveFilter(filter);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Update URL hash when filter changes
  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    const hash = filterToHash(filter);
    window.history.pushState(null, '', `#${hash}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading gallery...</div>
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

  return (
    <GallerySection 
      activeFilter={activeFilter}
      setActiveFilter={handleFilterChange}
      showAllImages={true}
      showFilters={true}
      items={galleryItems}
    />
  );
}