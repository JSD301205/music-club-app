import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function cleanupDuplicates() {
  console.log('Cleaning up duplicate data...\n');
  
  // Delete all events for 2025
  const { error: eventsError } = await supabase
    .from('events')
    .delete()
    .eq('year', 2025);
  
  if (eventsError) {
    console.error('Error deleting events:', eventsError);
  } else {
    console.log('✓ Deleted all 2025 events');
  }
  
  // Delete all gallery items for 2025
  const { error: galleryError } = await supabase
    .from('gallery_items')
    .delete()
    .eq('year', 2025);
  
  if (galleryError) {
    console.error('Error deleting gallery items:', galleryError);
  } else {
    console.log('✓ Deleted all 2025 gallery items');
  }
  
  console.log('\nCleanup complete! Now run: npm run migrate');
}

cleanupDuplicates();
