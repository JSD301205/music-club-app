import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function reverseExistingPastEvents() {
  console.log('Reversing order of existing past events...\n');

  // Step 1: Get all 2025 past events sorted by ID
  const { data: pastEvents, error: fetchError } = await supabase
    .from('events')
    .select('*')
    .eq('year', 2025)
    .eq('status', 'past')
    .order('id', { ascending: true });

  if (fetchError) {
    console.error('Error fetching past events:', fetchError);
    return;
  }

  if (!pastEvents || pastEvents.length === 0) {
    console.log('No past events found to reverse');
    return;
  }

  console.log(`Found ${pastEvents.length} past events\n`);

  // Step 2: Identify migrated events (lower IDs) vs admin panel events (higher IDs)
  const sortedIds = pastEvents.map(e => e.id).sort((a, b) => a - b);
  console.log('Current IDs:', sortedIds.join(', '));
  
  // Find the cutoff - if there's a gap > 5 between consecutive IDs, that's the split
  let cutoffId = sortedIds[sortedIds.length - 1];
  for (let i = 0; i < sortedIds.length - 1; i++) {
    if (sortedIds[i + 1] - sortedIds[i] > 5) {
      cutoffId = sortedIds[i];
      break;
    }
  }

  const migratedEvents = pastEvents.filter(event => event.id <= cutoffId);
  const adminEvents = pastEvents.filter(event => event.id > cutoffId);

  console.log(`\nMigrated events (to reverse): ${migratedEvents.length} events (IDs <= ${cutoffId})`);
  console.log(`Admin panel events (keep as is): ${adminEvents.length} events (IDs > ${cutoffId})\n`);

  // Step 3: Reverse only the migrated events
  const reversedMigrated = [...migratedEvents].reverse();

  console.log('Step 1: Deleting all past events for 2025...');
  const { error: deleteError } = await supabase
    .from('events')
    .delete()
    .eq('year', 2025)
    .eq('status', 'past');

  if (deleteError) {
    console.error('Error deleting events:', deleteError);
    return;
  }
  console.log('✓ Deleted all past events\n');

  // Step 4: Re-insert in new order: reversed migrated events first, then admin events
  console.log('Step 2: Re-inserting events in new order...\n');
  
  console.log('Inserting reversed migrated events:');
  for (const event of reversedMigrated) {
    const { id, created_at, updated_at, ...eventData } = event;
    const { error: insertError } = await supabase
      .from('events')
      .insert(eventData);

    if (insertError) {
      console.error(`Error inserting "${event.title}":`, insertError);
    } else {
      console.log(`  ✓ ${event.title}`);
    }
  }

  if (adminEvents.length > 0) {
    console.log('\nInserting admin panel events (maintaining their position):');
    for (const event of adminEvents) {
      const { id, created_at, updated_at, ...eventData } = event;
      const { error: insertError } = await supabase
        .from('events')
        .insert(eventData);

      if (insertError) {
        console.error(`Error inserting "${event.title}":`, insertError);
      } else {
        console.log(`  ✓ ${event.title}`);
      }
    }
  }

  console.log('\n✓ Order reversal completed!\n');

  // Verify
  console.log('Verifying new order (sorted by ID DESC - how they appear on page):');
  const { data: verifyData, error: verifyError } = await supabase
    .from('events')
    .select('id, title, status')
    .eq('year', 2025)
    .eq('status', 'past')
    .order('id', { ascending: false });

  if (verifyError) {
    console.error('Error verifying:', verifyError);
  } else {
    console.log('\nPast Events (newest first):');
    verifyData?.forEach((event, index) => {
      console.log(`  ${index + 1}. ID: ${event.id} | ${event.title}`);
    });
  }
}

reverseExistingPastEvents();
