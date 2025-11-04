'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLogin from './components/AdminLogin';
import ImageUpload from './components/ImageUpload';
import { checkIsAuthenticated, signOut } from '../lib/api/auth';
import { createEvent, uploadEventImage } from '../lib/api/events';
import { createGalleryItem, uploadGalleryImage } from '../lib/api/gallery';
import { Event, GalleryItem } from '../lib/supabase';

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await checkIsAuthenticated();
    setIsAuthenticated(authenticated);
    setLoading(false);
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    await signOut();
    setIsAuthenticated(false);
    // Reload to ensure auth state is cleared
    setTimeout(() => {
      window.location.reload()
    }, 600)
  };

  // Gallery form state
  const [selectedYear, setSelectedYear] = useState<'2024' | '2025'>('2025');
  const [newGalleryItem, setNewGalleryItem] = useState<Partial<GalleryItem>>({
    category: 'performances',
    title: '',
    type: 'image',
    video_url: '',
    event: '',
    year: 2025,
    order: 0,
    featured_members: []
  });
  const [galleryImageFile, setGalleryImageFile] = useState<File | null>(null);

  // Event form state
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    category: 'Performances',
    registration_link: '',
    youtube_url: '',
    view_bands_link: '',
    gallery_route: '',
    year: 2025,
    status: 'upcoming',
    order: 0
  });
  const [eventImageFile, setEventImageFile] = useState<File | null>(null);

  // Results state
  const [galleryResult, setGalleryResult] = useState<string>('');
  const [eventResult, setEventResult] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  // Handle gallery image upload
  const handleGalleryImageUpload = async (file: File): Promise<string> => {
    setGalleryImageFile(file);
    const url = await uploadGalleryImage(file);
    setNewGalleryItem({ ...newGalleryItem, image: url });
    return url;
  };

  // Handle event image upload
  const handleEventImageUpload = async (file: File): Promise<string> => {
    setEventImageFile(file);
    const url = await uploadEventImage(file);
    setNewEvent({ ...newEvent, image: url });
    return url;
  };

  // Handle adding a new gallery item
  const handleAddGalleryItem = async () => {
    if (!newGalleryItem.image || !newGalleryItem.title) {
      setGalleryResult('Error: Image and title are required');
      return;
    }

    setSubmitting(true);
    try {
      const item = await createGalleryItem({
        ...newGalleryItem,
        year: parseInt(selectedYear),
      } as Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'>);

      setGalleryResult(`Success! Gallery item created with ID: ${item.id}`);
      
      // Reset form
      setNewGalleryItem({
        category: 'performances',
        title: '',
        type: 'image',
        video_url: '',
        event: '',
        year: parseInt(selectedYear),
        order: 0,
        featured_members: []
      });
      setGalleryImageFile(null);

      // Refresh the page after 2 seconds
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      setGalleryResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle adding a new event
  const handleAddEvent = async () => {
    if (!newEvent.image || !newEvent.title || !newEvent.date) {
      setEventResult('Error: Image, title, and date are required');
      return;
    }

    setSubmitting(true);
    try {
      const event = await createEvent({
        ...newEvent,
        year: parseInt(selectedYear),
      } as Omit<Event, 'id' | 'created_at' | 'updated_at'>);

      setEventResult(`Success! Event created with ID: ${event.id}`);
      
      // Reset form
      setNewEvent({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        category: 'Performances',
        registration_link: '',
        youtube_url: '',
        view_bands_link: '',
        gallery_route: '',
        year: parseInt(selectedYear),
        status: 'upcoming',
        order: 0
      });
      setEventImageFile(null);

      // Refresh the page after 2 seconds
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } catch (error) {
      setEventResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-900 dark:text-white">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (!isClient) {
    return <div className="p-4 text-gray-900 dark:text-white">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Music Club Admin Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="btn-secondary"
        >
          Logout
        </button>
      </div>

      {/* Quick Navigation */}
      <div className="mb-8 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => router.push('/admin/bands')}
            className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Manage Bands
          </button>
          <button
            onClick={() => router.push('/admin/team')}
            className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Manage Team
          </button>
          <button
            onClick={() => router.push('/admin/team-username-mappings')}
            className="p-3 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Team Profile Links
          </button>
          <button
            onClick={() => router.push('/admin/band-member-mappings')}
            className="p-3 bg-secondary-600 hover:bg-secondary-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Band Profile Links
          </button>
          <button
            onClick={() => router.push('/admin/resources')}
            className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Manage Resources
          </button>
          <button
            onClick={() => window.location.reload()}
            className="p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Add Events/Gallery
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Gallery Item Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-h-[85vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white sticky top-0 bg-white dark:bg-gray-800 pb-2">
            Add New Gallery Item
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                const year = e.target.value as '2024' | '2025';
                setSelectedYear(year);
                setNewGalleryItem({ ...newGalleryItem, year: parseInt(year) });
              }}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <ImageUpload
            onImageUpload={handleGalleryImageUpload}
            currentImageUrl={newGalleryItem.image}
            label="Gallery Image"
          />

          <div className="mb-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={newGalleryItem.category}
              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, category: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="performances">Performances</option>
              <option value="workshops">Workshops</option>
              <option value="jams">Jam Sessions</option>
              <option value="covers">Covers</option>
              <option value="team">Team</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={newGalleryItem.title}
              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, title: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Type
            </label>
            <select
              value={newGalleryItem.type}
              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, type: e.target.value as 'image' | 'video' })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          {newGalleryItem.type === 'video' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Video URL
              </label>
              <input
                type="text"
                value={newGalleryItem.video_url}
                onChange={(e) => setNewGalleryItem({ ...newGalleryItem, video_url: e.target.value })}
                className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="https://www.youtube.com/embed/..."
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Event Name (Optional)
            </label>
            <input
              type="text"
              value={newGalleryItem.event}
              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, event: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="e.g., Meraki (Club Performance)"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Must match the exact event title
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured Members (Cast)
            </label>
            <input
              type="text"
              value={(newGalleryItem.featured_members as string[] || []).join(', ')}
              onChange={(e) => {
                const members = e.target.value.split(',').map(m => m.trim()).filter(m => m);
                setNewGalleryItem({ ...newGalleryItem, featured_members: members });
              }}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="username1, username2, username3"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Enter usernames separated by commas. These members will appear in the photo/video and earn badges.
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order (Optional)
            </label>
            <input
              type="number"
              value={newGalleryItem.order}
              onChange={(e) => setNewGalleryItem({ ...newGalleryItem, order: parseInt(e.target.value) || 0 })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Display order (0 = default, lower numbers appear first)
            </p>
          </div>

          <button
            onClick={handleAddGalleryItem}
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? 'Adding...' : 'Add Gallery Item'}
          </button>

          {galleryResult && (
            <div className={`mt-4 p-3 rounded ${
              galleryResult.startsWith('Success') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {galleryResult}
            </div>
          )}
        </div>

        {/* Event Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-h-[85vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white sticky top-0 bg-white dark:bg-gray-800 pb-2">
            Add New Event
          </h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => {
                const year = e.target.value as '2024' | '2025';
                setSelectedYear(year);
                setNewEvent({ ...newEvent, year: parseInt(year) });
              }}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>
          </div>

          <ImageUpload
            onImageUpload={handleEventImageUpload}
            currentImageUrl={newEvent.image}
            label="Event Image"
          />

          <div className="mb-4 mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="text"
              value={newEvent.date}
              onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="October 20, 2025"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time
            </label>
            <input
              type="text"
              value={newEvent.time}
              onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="6:00 PM"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location
            </label>
            <input
              type="text"
              value={newEvent.location}
              onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={newEvent.description}
              onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={newEvent.category}
              onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="Performances">Performances</option>
              <option value="Open Mics">Open Mics</option>
              <option value="Competitions">Competitions</option>
              <option value="Workshops">Workshops</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              value={newEvent.status}
              onChange={(e) => setNewEvent({ ...newEvent, status: e.target.value as 'past' | 'upcoming' })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Gallery Route (Optional)
            </label>
            <input
              type="text"
              value={newEvent.gallery_route}
              onChange={(e) => setNewEvent({ ...newEvent, gallery_route: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="/2025events/event-slug"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Example: /2025events/meraki-2025
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Registration Link (Optional)
            </label>
            <input
              type="text"
              value={newEvent.registration_link}
              onChange={(e) => setNewEvent({ ...newEvent, registration_link: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://forms.gle/..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              For Open Mics, Competitions, Workshops
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              YouTube Video URL (Optional)
            </label>
            <input
              type="text"
              value={newEvent.youtube_url}
              onChange={(e) => setNewEvent({ ...newEvent, youtube_url: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="https://www.youtube.com/embed/..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              For club performances with video
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              View Bands Link (Optional)
            </label>
            <input
              type="text"
              value={newEvent.view_bands_link}
              onChange={(e) => setNewEvent({ ...newEvent, view_bands_link: e.target.value })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="/meraki2024/bands"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              For competitions with band listings
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Order (Optional)
            </label>
            <input
              type="number"
              value={newEvent.order}
              onChange={(e) => setNewEvent({ ...newEvent, order: parseInt(e.target.value) || 0 })}
              className="w-full p-2 border rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Display order (0 = default)
            </p>
          </div>

          <button
            onClick={handleAddEvent}
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? 'Adding...' : 'Add Event'}
          </button>

          {eventResult && (
            <div className={`mt-4 p-3 rounded ${
              eventResult.startsWith('Success') 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {eventResult}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}