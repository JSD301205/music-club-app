/**
 * Migration Script: Populate Bands and Team Members tables
 * Run this script after executing add-bands-and-team.sql
 * 
 * Usage:
 *   npx tsx scripts/migrate-bands-team-to-db.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { bands, merakiBands } from '../app/data/bands'
import { 
  coreMembers, 
  coordinators, 
  crew, 
  mentors 
} from '../app/data/team'
import { 
  coreMembers2024, 
  coordinators2024, 
  crew2024, 
  mentors2024 
} from '../app/data/team2024'
import { 
  coreMembers2025, 
  leads2025,
  coordinators2025, 
  crew2025, 
  mentors2025,
  externalMentors2025
} from '../app/data/team2025'

// Load environment variables from .env.local
config({ path: resolve(__dirname, '../.env.local') })

// Initialize Supabase client with service role key (bypasses RLS for migrations)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please ensure the following are set in .env.local:')
  console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  console.error('  - SUPABASE_SERVICE_ROLE_KEY (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  console.error('')
  console.error('Note: Using SERVICE_ROLE_KEY bypasses RLS and is recommended for migrations.')
  console.error('You can find it in Supabase Dashboard → Settings → API → service_role key')
  console.error(`Looking for .env.local at: ${resolve(__dirname, '../.env.local')}`)
  console.error(`Current directory: ${process.cwd()}`)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function migrateBands() {
  console.log('\n📚 Migrating Bands...')
  
  for (const band of bands) {
    try {
      // Insert band
      const { data: bandData, error: bandError } = await supabase
        .from('bands')
        .insert({
          name: band.name,
          image: band.image,
          description: band.description,
          order: band.id,
          is_published: true
        })
        .select()
        .single()

      if (bandError) {
        console.error(`  ❌ Error inserting band "${band.name}":`, bandError.message)
        continue
      }

      console.log(`  ✅ Inserted band: ${band.name}`)

      // Insert band members
      if (band.members && band.members.length > 0) {
        const membersToInsert = band.members.map((member) => ({
          band_id: bandData.id,
          name: member.name,
          instrument: member.instrument,
          image: member.image,
          order: member.id
        }))

        const { error: membersError } = await supabase
          .from('band_members')
          .insert(membersToInsert)

        if (membersError) {
          console.error(`    ❌ Error inserting members for "${band.name}":`, membersError.message)
        } else {
          console.log(`    ✅ Inserted ${band.members.length} members`)
        }
      }
    } catch (error: any) {
      console.error(`  ❌ Error processing band "${band.name}":`, error.message)
    }
  }

  console.log(`\n✅ Migrated ${bands.length} bands`)
}

async function migrateTeamMembers() {
  console.log('\n👥 Migrating Team Members...')

  const teamData = [
    // 2024 Team
    ...coreMembers2024.map(m => ({ ...m, year: 2024, category: 'core' as const, role: 'Core', position: m.role })),
    ...coordinators2024.map(m => ({ ...m, year: 2024, category: 'coordinator' as const, role: 'Coordinator', position: m.role })),
    ...crew2024.map(m => ({ ...m, year: 2024, category: 'crew' as const, role: 'Crew', position: m.role })),
    ...mentors2024.map(m => ({ ...m, year: 2024, category: 'mentor' as const, role: 'Mentor', position: m.role })),
    
    // 2025 Team  
    ...coreMembers2025.map(m => ({ ...m, year: 2025, category: 'core' as const, role: 'Core', position: m.role })),
    ...leads2025.map(m => ({ ...m, year: 2025, category: 'coordinator' as const, role: 'Lead', position: m.role })),
    ...coordinators2025.map(m => ({ ...m, year: 2025, category: 'coordinator' as const, role: 'Coordinator', position: m.role })),
    ...crew2025.map(m => ({ ...m, year: 2025, category: 'crew' as const, role: 'Crew', position: m.role })),
    ...mentors2025.map(m => ({ ...m, year: 2025, category: 'mentor' as const, role: 'Mentor', position: m.role })),
    ...externalMentors2025.map(m => ({ ...m, year: 2025, category: 'mentor' as const, role: 'External Mentor', position: m.role })),
  ]

  let successCount = 0
  let errorCount = 0

  for (const member of teamData) {
    try {
      const { error } = await supabase
        .from('team_members')
        .insert({
          name: member.name,
          role: member.role,
          position: member.position,
          image: member.image,
          bio: member.bio,
          year: member.year,
          category: member.category,
          social_links: member.social || {},
          order: member.id,
          is_published: true
        })

      if (error) {
        console.error(`  ❌ Error inserting ${member.name} (${member.year}):`, error.message)
        errorCount++
      } else {
        console.log(`  ✅ Inserted: ${member.name} - ${member.role} (${member.year})`)
        successCount++
      }
    } catch (error: any) {
      console.error(`  ❌ Error processing ${member.name}:`, error.message)
      errorCount++
    }
  }

  console.log(`\n✅ Migrated ${successCount} team members`)
  if (errorCount > 0) {
    console.log(`⚠️  ${errorCount} errors occurred`)
  }
}

async function main() {
  console.log('🚀 Starting data migration...')
  console.log('=' .repeat(50))

  try {
    // Migrate bands first
    await migrateBands()

    // Then migrate team members
    await migrateTeamMembers()

    console.log('\n' + '='.repeat(50))
    console.log('✅ Migration completed successfully!')
    console.log('\nNext steps:')
    console.log('  1. Verify data in Supabase Dashboard')
    console.log('  2. Update components to fetch from database')
    console.log('  3. Create admin interfaces for management')
  } catch (error: any) {
    console.error('\n❌ Migration failed:', error.message)
    process.exit(1)
  }
}

main()
