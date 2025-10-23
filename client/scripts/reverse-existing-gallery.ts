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

async function reverseExistingGallery() {
  console.log('Reversing order of existing gallery items...\n');

  // Step 1: Get all 2025 gallery items sorted by ID
  const { data: items, error: fetchError } = await supabase
    .from('gallery_items')
    .select('*')
    .eq('year', 2025)
    .order('id', { ascending: true });

  if (fetchError) {
    console.error('Error fetching items:', fetchError);
    return;
  }

  if (!items || items.length === 0) {
    console.log('No items found to reverse');
    return;
  }

  console.log(`Found ${items.length} items\n`);

  // Step 2: Identify which items are from migration (lower IDs) vs admin panel (higher IDs)
  // Items from migration will have IDs up to around 550s based on your data
  // Items added from admin panel will have IDs 557+
  
  // Find the gap - admin panel items typically have much higher IDs
  const sortedIds = items.map(i => i.id).sort((a, b) => a - b);
  console.log('Current IDs:', sortedIds.join(', '));
  
  // Find the cutoff - if there's a gap > 5 between consecutive IDs, that's the split
  let cutoffId = sortedIds[sortedIds.length - 1]; // Default to last ID
  for (let i = 0; i < sortedIds.length - 1; i++) {
    if (sortedIds[i + 1] - sortedIds[i] > 5) {
      cutoffId = sortedIds[i];
      break;
    }
  }

  const migratedItems = items.filter(item => item.id <= cutoffId);
  const adminItems = items.filter(item => item.id > cutoffId);

  console.log(`\nMigrated items (to reverse): ${migratedItems.length} items (IDs <= ${cutoffId})`);
  console.log(`Admin panel items (keep as is): ${adminItems.length} items (IDs > ${cutoffId})\n`);

  // Step 3: Reverse only the migrated items
  const reversedMigrated = [...migratedItems].reverse();

  console.log('Step 1: Deleting all items...');
  const { error: deleteError } = await supabase
    .from('gallery_items')
    .delete()
    .eq('year', 2025);

  if (deleteError) {
    console.error('Error deleting items:', deleteError);
    return;
  }
  console.log('✓ Deleted all items\n');

  // Step 4: Re-insert in new order: reversed migrated items first, then admin items
  console.log('Step 2: Re-inserting items in new order...\n');
  
  console.log('Inserting reversed migrated items:');
  for (const item of reversedMigrated) {
    const { id, created_at, updated_at, ...itemData } = item;
    const { error: insertError } = await supabase
      .from('gallery_items')
      .insert(itemData);

    if (insertError) {
      console.error(`Error inserting "${item.title}":`, insertError);
    } else {
      console.log(`  ✓ ${item.title}`);
    }
  }

  console.log('\nInserting admin panel items (maintaining their position):');
  for (const item of adminItems) {
    const { id, created_at, updated_at, ...itemData } = item;
    const { error: insertError } = await supabase
      .from('gallery_items')
      .insert(itemData);

    if (insertError) {
      console.error(`Error inserting "${item.title}":`, insertError);
    } else {
      console.log(`  ✓ ${item.title}`);
    }
  }

  console.log('\n✓ Order reversal completed!\n');

  // Verify
  console.log('Verifying new order (sorted by ID DESC - how they appear on page):');
  const { data: verifyData, error: verifyError } = await supabase
    .from('gallery_items')
    .select('id, title')
    .eq('year', 2025)
    .order('id', { ascending: false });

  if (verifyError) {
    console.error('Error verifying:', verifyError);
  } else {
    verifyData?.forEach((item, index) => {
      console.log(`  ${index + 1}. ID: ${item.id} | ${item.title}`);
    });
  }
}

reverseExistingGallery();
