import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkData() {
  // console.log('Checking Supabase data...\n');
  
  // Check 2025 events
  const { data: events2025, error: eventsError } = await supabase
    .from('events')
    .select('*')
    .eq('year', 2025);
  
  if (eventsError) {
    console.error('Error fetching 2025 events:', eventsError);
  } else {
    // console.log(`Found ${events2025?.length || 0} events for 2025:`);
    // events2025?.forEach(event => {
    //   console.log(`  - ${event.title} (${event.status})`);
    // });
  }
  
  // console.log('');
  
  // Check 2025 gallery items with ID ordering
  const { data: gallery2025, error: galleryError } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('year', 2025)
    .order('id', { ascending: false });
  
  if (galleryError) {
    console.error('Error fetching 2025 gallery items:', galleryError);
  } else {
    // console.log(`Found ${gallery2025?.length || 0} gallery items for 2025 (sorted by ID desc):`);
    // gallery2025?.slice(0, 10).forEach(item => {
    //   console.log(`  - ID: ${item.id} | ${item.title} | Created: ${item.created_at}`);
    // });
    // if (gallery2025 && gallery2025.length > 10) {
    //   console.log(`  ... and ${gallery2025.length - 10} more items`);
    // }
  }
}

checkData();
