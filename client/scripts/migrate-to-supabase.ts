import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';
import { pastEvents as events2024 } from '../app/data/events2024';
import { pastEvents as pastEvents2025, upcomingEvents as upcomingEvents2025 } from '../app/data/events2025';
import { galleryItems as gallery2024 } from '../app/data/gallery2024';
import { galleryItems as gallery2025 } from '../app/data/gallery2025';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  console.error('\nYou can find your service role key in:');
  console.error('Supabase Dashboard → Project Settings → API → service_role key');
  process.exit(1);
}

// Use service role key to bypass RLS for migration
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function migrateEvents() {
  console.log('Migrating events...');

  // Migrate 2024 events
  for (const event of events2024) {
    const { error } = await supabase.from('events').insert({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      image: event.image,
      registration_link: event.registrationLink,
      category: event.category,
      youtube_url: event.youtubeUrl,
      view_bands_link: event.viewBandsLink,
      gallery_route: event.galleryRoute,
      year: 2024,
      status: 'past',
      order: event.order || 0
    });

    if (error) {
      console.error('Error migrating event:', event.title, error);
    } else {
      console.log('✓ Migrated:', event.title);
    }
  }

  // Migrate 2025 past events
  for (const event of pastEvents2025) {
    const { error } = await supabase.from('events').insert({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      image: event.image,
      registration_link: event.registrationLink,
      category: event.category,
      youtube_url: event.youtubeUrl,
      view_bands_link: event.viewBandsLink,
      gallery_route: event.galleryRoute,
      year: 2025,
      status: 'past',
      order: event.order || 0
    });

    if (error) {
      console.error('Error migrating event:', event.title, error);
    } else {
      console.log('✓ Migrated:', event.title);
    }
  }

  // Migrate 2025 upcoming events
  for (const event of upcomingEvents2025) {
    const { error } = await supabase.from('events').insert({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      image: event.image,
      registration_link: event.registrationLink,
      category: event.category,
      youtube_url: event.youtubeUrl,
      view_bands_link: event.viewBandsLink,
      gallery_route: event.galleryRoute,
      year: 2025,
      status: 'upcoming',
      order: event.order || 0
    });

    if (error) {
      console.error('Error migrating event:', event.title, error);
    } else {
      console.log('✓ Migrated:', event.title);
    }
  }

  console.log('Events migration complete!');
}

async function migrateGallery() {
  console.log('Migrating gallery items...');

  // Migrate 2024 gallery
  for (const item of gallery2024) {
    const { error } = await supabase.from('gallery_items').insert({
      category: item.category,
      image: item.image,
      title: item.title,
      type: item.type,
      video_url: item.videoUrl,
      event: item.event,
      year: 2024,
      order: item.order || 0
    });

    if (error) {
      console.error('Error migrating gallery item:', item.title, error);
    } else {
      console.log('✓ Migrated:', item.title);
    }
  }

  // Migrate 2025 gallery
  for (const item of gallery2025) {
    const { error } = await supabase.from('gallery_items').insert({
      category: item.category,
      image: item.image,
      title: item.title,
      type: item.type,
      video_url: item.videoUrl,
      event: item.event,
      year: 2025,
      order: item.order || 0
    });

    if (error) {
      console.error('Error migrating gallery item:', item.title, error);
    } else {
      console.log('✓ Migrated:', item.title);
    }
  }

  console.log('Gallery migration complete!');
}

async function main() {
  try {
    await migrateEvents();
    await migrateGallery();
    console.log('✓ All data migrated successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main();