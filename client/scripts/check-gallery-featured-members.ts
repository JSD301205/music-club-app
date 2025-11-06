/**
 * Diagnostic script to check gallery items and their featured_members
 * This helps identify if there are issues with username matching
 */

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkGalleryFeaturedMembers() {
  console.log('🔍 Checking gallery items and their featured members...\n')

  // Get all gallery items with featured_members
  const { data: items, error } = await supabase
    .from('gallery_items')
    .select('id, title, event, year, featured_members')
    .not('featured_members', 'is', null)
    .order('year', { ascending: false })

  if (error) {
    console.error('❌ Error fetching gallery items:', error)
    return
  }

  console.log(`📊 Found ${items?.length || 0} gallery items with featured members\n`)

  // Check for Meera and RMeera specifically
  const meeraItems = items?.filter((item: any) => 
    item.featured_members && 
    (item.featured_members.includes('Meera') || 
     item.featured_members.includes('RMeera') ||
     item.featured_members.includes('MeeraR'))
  )

  console.log('🎭 Items featuring Meera variants:')
  console.log('=' .repeat(80))
  
  meeraItems?.forEach((item: any) => {
    console.log(`\nID: ${item.id}`)
    console.log(`Title: ${item.title}`)
    console.log(`Event: ${item.event || 'N/A'}`)
    console.log(`Year: ${item.year}`)
    console.log(`Featured Members: [${item.featured_members.join(', ')}]`)
  })

  console.log('\n' + '='.repeat(80))
  console.log(`\n📈 Summary:`)
  
  const meeraCount = items?.filter((item: any) => 
    item.featured_members?.includes('Meera')
  ).length || 0
  
  const rmeeraCount = items?.filter((item: any) => 
    item.featured_members?.includes('RMeera')
  ).length || 0
  
  const meeraRCount = items?.filter((item: any) => 
    item.featured_members?.includes('MeeraR')
  ).length || 0

  console.log(`Items with "Meera": ${meeraCount}`)
  console.log(`Items with "RMeera": ${rmeeraCount}`)
  console.log(`Items with "MeeraR": ${meeraRCount}`)

  // Check for duplicate or similar usernames
  console.log('\n🔎 Checking for potential duplicate usernames...\n')
  
  const allUsernames = new Set<string>()
  items?.forEach((item: any) => {
    item.featured_members?.forEach((username: string) => {
      allUsernames.add(username)
    })
  })

  const usernameArray = Array.from(allUsernames).sort()
  const potentialDuplicates: string[] = []

  usernameArray.forEach((username, i) => {
    usernameArray.forEach((otherUsername, j) => {
      if (i !== j) {
        if (username.toLowerCase().includes(otherUsername.toLowerCase()) ||
            otherUsername.toLowerCase().includes(username.toLowerCase())) {
          if (!potentialDuplicates.includes(`${username} vs ${otherUsername}`)) {
            potentialDuplicates.push(`${username} vs ${otherUsername}`)
          }
        }
      }
    })
  })

  if (potentialDuplicates.length > 0) {
    console.log('⚠️  Potential duplicate/similar usernames found:')
    potentialDuplicates.forEach(dup => {
      console.log(`  - ${dup}`)
    })
  } else {
    console.log('✅ No obvious duplicate usernames found')
  }

  // List all unique usernames
  console.log(`\n📋 All unique usernames in featured_members (${usernameArray.length} total):`)
  console.log('=' .repeat(80))
  usernameArray.forEach(username => {
    const count = items?.filter((item: any) => 
      item.featured_members?.includes(username)
    ).length || 0
    console.log(`  ${username.padEnd(30)} (${count} appearances)`)
  })
}

// Run the check
checkGalleryFeaturedMembers()
  .then(() => {
    console.log('\n✅ Check complete!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Error running check:', err)
    process.exit(1)
  })
