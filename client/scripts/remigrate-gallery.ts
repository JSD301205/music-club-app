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

// Import gallery data
const galleryItems2025 = [
  {
    category: "performances",
    image: "/events/events2025-26/Meraki_2025/Meraki_1.jpg",
    title: "Sun Raha Hai Cover",
    type: 'video' as const,
    videoUrl: "https://www.youtube.com/embed/lrr-fozvjyM",
    event: "Meraki (Club Performance)",
    id: 11,
    order: 1
  },
  {
    category: "performances",
    image: "/events/events2025-26/Meraki_2025/Meraki_1.jpg",
    title: "Neruppu Da Cover",
    type: 'video' as const,
    videoUrl: "https://www.youtube.com/embed/hmY0YhsioKc",
    event: "Meraki (Club Performance)",
    id: 12,
    order: 2
  },
  {
    category: "performances",
    image: "/events/events2025-26/Blastroduction_2025/Blastroduction_1.JPG",
    title: "Maatae Vinadhuga Rock Cover",
    type: 'video' as const,
    videoUrl: "https://www.youtube.com/embed/8YeY7iXA6Oc",
    event: "Blastroduction (Club Performance)",
    id: 10,
    order: 3
  },
  {
    category: "performances",
    image: "/events/events2025-26/Blastroduction_2025/Blastroduction_1.JPG",
    title: "Zinda Cover",
    type: 'video' as const,
    videoUrl: "https://www.youtube.com/embed/l1fRImnl7Jo",
    event: "Blastroduction (Club Performance)",
    id: 9,
    order: 4
  },
  {
    category: "jams",
    image: "/gallery/gallery2024-25/Team2025-26/Music Club.jpg",
    title: "Garaj Garaj Cover",
    type: 'video' as const,
    videoUrl: "https://www.youtube.com/embed/VeJ8v_iVLAg",
    event: "",
    id: 8,
    order: 5
  },
  {
    category: "performances",
    image: "/events/events2025-26/Ganesh_Chaturthi_2025/Ganesh Chaturthi.jpg",
    title: "Phulpakharu Cover",
    type: 'video' as const,
    videoUrl: "https://www.youtube.com/embed/JXOr_CA6Wm4",
    event: "Ganesh Chaturthi (Club Performance)",
    id: 7,
    order: 6
  },
  { 
    category: "performances",
    image: "/events/events2025-26/Ganesh_Chaturthi_2025/Ganesh Chaturthi.jpg",
    title: "Garaj Garaj Rock Cover",
    type: 'video' as const,
    videoUrl: "https://www.youtube.com/embed/262dRYmsPc0",
    event: "Ganesh Chaturthi (Club Performance)",
    id: 6,
    order: 7
  },
  {
    category: "performances",
    image: "/events/events2025-26/Ganesh_Chaturthi_2025/Ganesh Chaturthi_2.jpg",
    title: "Teri Deewani Cover",
    type: 'video' as const,
    videoUrl: "https://www.youtube.com/embed/zhYIK5OMXaI",
    event: "Ganesh Chaturthi (Club Performance)",
    id: 5,
    order: 8
  },
  {
    category: "performances",
    image: "/events/events2025-26/Ganesh_Chaturthi_2025/Ganesh Chaturthi_2.jpg",
    title: "Atach Bayee Cover",
    type: 'video' as const,
    videoUrl: "https://www.youtube.com/embed/UcxsdDxzbBI",
    event: "Ganesh Chaturthi (Club Performance)",
    id: 4,
    order: 9
  },
  {
    category: "performances",
    image: "/events/events2025-26/Independence_Day_2025/Independence Day2025_1.png",
    title: "Teri Mitti Cover",
    type: 'video' as const,
    videoUrl: "https://www.youtube.com/embed/6ToECouP3Oo",
    event: "Independence Day (Club Performance)",
    id: 3,
    order: 10
  },
  {
    category: "performances",
    image: "/events/events2025-26/Independence_Day_2025/Independence Day2025_2.png",
    title: "Rang De Basanti Rock Cover",
    type: 'video' as const,
    videoUrl: "https://www.youtube.com/embed/qh1ehMfgvKA",
    event: "Independence Day (Club Performance)",
    id: 2,
    order: 11
  },
  {
    category: "performances",
    image: "/events/events2025-26/Independence_Day_2025/Independence Day2025_3.png",
    title: "Challa Rock Cover",
    type: 'video' as const,
    videoUrl: "https://www.youtube.com/embed/fL-jYC7M5IM",
    event: "Independence Day (Club Performance)",
    id: 1,
    order: 12
  },
];

async function remigrateGallery() {
  console.log('Starting gallery re-migration...\n');

  // Step 1: Delete all 2025 gallery items
  console.log('Step 1: Deleting existing 2025 gallery items...');
  const { error: deleteError } = await supabase
    .from('gallery_items')
    .delete()
    .eq('year', 2025);

  if (deleteError) {
    console.error('Error deleting gallery items:', deleteError);
    return;
  }
  console.log('✓ Deleted all 2025 gallery items\n');

  // Step 2: Sort items by order property
  const sortedItems = [...galleryItems2025].sort((a, b) => a.order - b.order);
  console.log('Step 2: Sorted items by order property\n');

  // Step 3: Insert items one by one to maintain order
  console.log('Step 3: Inserting gallery items in order...');
  for (const item of sortedItems) {
    const galleryItem = {
      category: item.category,
      image: item.image,
      title: item.title,
      type: item.type,
      video_url: item.videoUrl || null,
      event: item.event || null,
      year: 2025,
      order: item.order
    };

    const { error: insertError } = await supabase
      .from('gallery_items')
      .insert(galleryItem);

    if (insertError) {
      console.error(`Error inserting "${item.title}":`, insertError);
    } else {
      console.log(`  ✓ Inserted: ${item.title} (order: ${item.order})`);
    }
  }

  console.log('\n✓ Gallery re-migration completed!');
  
  // Verify the data
  console.log('\nVerifying data...');
  const { data: verifyData, error: verifyError } = await supabase
    .from('gallery_items')
    .select('id, title, order')
    .eq('year', 2025)
    .order('id', { ascending: true });

  if (verifyError) {
    console.error('Error verifying data:', verifyError);
  } else {
    console.log(`\nFound ${verifyData?.length || 0} items in database:`);
    verifyData?.forEach(item => {
      console.log(`  - ID: ${item.id} | Order: ${item.order} | ${item.title}`);
    });
  }
}

remigrateGallery();
