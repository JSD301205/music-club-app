/**
 * Script to validate and optionally fix featured_members in gallery_items
 * This helps identify and correct any incorrect username entries
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY! // Needs service role for updates
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface ValidationIssue {
  itemId: number
  title: string
  issue: string
  currentValue: string[]
  suggestedFix?: string[]
}

async function validateFeaturedMembers() {
  console.log('🔍 Validating featured_members in gallery_items...\n')

  const issues: ValidationIssue[] = []

  // Get all gallery items with featured_members
  const { data: items, error: itemsError } = await supabase
    .from('gallery_items')
    .select('id, title, event, year, featured_members')
    .not('featured_members', 'is', null)

  if (itemsError) {
    console.error('❌ Error fetching gallery items:', itemsError)
    return
  }

  // Get all valid profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('username')

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError)
    return
  }

  const validUsernames = new Set(profiles?.map(p => p.username) || [])

  console.log(`📊 Checking ${items?.length || 0} gallery items...`)
  console.log(`👥 Found ${validUsernames.size} valid usernames in profiles\n`)

  // Check each item
  items?.forEach((item: any) => {
    if (!item.featured_members || !Array.isArray(item.featured_members)) {
      issues.push({
        itemId: item.id,
        title: item.title,
        issue: 'featured_members is not an array',
        currentValue: item.featured_members
      })
      return
    }

    // Check for empty strings
    const emptyStrings = item.featured_members.filter((m: string) => m.trim() === '')
    if (emptyStrings.length > 0) {
      issues.push({
        itemId: item.id,
        title: item.title,
        issue: 'Contains empty strings',
        currentValue: item.featured_members,
        suggestedFix: item.featured_members.filter((m: string) => m.trim() !== '')
      })
    }

    // Check for invalid usernames
    const invalidUsernames = item.featured_members.filter((username: string) => 
      !validUsernames.has(username)
    )

    if (invalidUsernames.length > 0) {
      issues.push({
        itemId: item.id,
        title: item.title,
        issue: `Contains invalid username(s): ${invalidUsernames.join(', ')}`,
        currentValue: item.featured_members
      })
    }

    // Check for duplicates
    const uniqueMembers = new Set(item.featured_members)
    if (uniqueMembers.size !== item.featured_members.length) {
      issues.push({
        itemId: item.id,
        title: item.title,
        issue: 'Contains duplicate usernames',
        currentValue: item.featured_members,
        suggestedFix: Array.from(uniqueMembers) as string[]
      })
    }

    // Check for potential case mismatches
    const lowercaseMap = new Map<string, string[]>()
    item.featured_members.forEach((username: string) => {
      const lower = username.toLowerCase()
      if (!lowercaseMap.has(lower)) {
        lowercaseMap.set(lower, [])
      }
      lowercaseMap.get(lower)!.push(username)
    })

    lowercaseMap.forEach((variants, lower) => {
      if (variants.length > 1) {
        issues.push({
          itemId: item.id,
          title: item.title,
          issue: `Potential case mismatch: ${variants.join(' vs ')}`,
          currentValue: item.featured_members
        })
      }
    })
  })

  // Report issues
  console.log('=' .repeat(80))
  if (issues.length === 0) {
    console.log('✅ No issues found! All featured_members are valid.')
    return
  }

  console.log(`⚠️  Found ${issues.length} issue(s):\n`)
  
  issues.forEach((issue, index) => {
    console.log(`${index + 1}. Gallery Item #${issue.itemId}: "${issue.title}"`)
    console.log(`   Issue: ${issue.issue}`)
    console.log(`   Current: [${issue.currentValue.join(', ')}]`)
    if (issue.suggestedFix) {
      console.log(`   Suggested Fix: [${issue.suggestedFix.join(', ')}]`)
    }
    console.log()
  })

  console.log('=' .repeat(80))
  console.log('\n💡 Recommendations:')
  console.log('1. Review invalid usernames - they may need profile creation')
  console.log('2. Fix case mismatches to use the correct username from profiles')
  console.log('3. Remove duplicate entries')
  console.log('4. Clean up empty strings')
  
  return issues
}

async function suggestFixes() {
  const issues = await validateFeaturedMembers()
  
  if (!issues || issues.length === 0) {
    console.log('\n✅ No fixes needed!')
    process.exit(0)
  }

  // Group issues by type for easier fixing
  const invalidUsernameIssues = issues.filter(i => i.issue.includes('invalid username'))
  const duplicateIssues = issues.filter(i => i.issue.includes('duplicate'))
  const emptyStringIssues = issues.filter(i => i.issue.includes('empty'))
  const caseMismatchIssues = issues.filter(i => i.issue.includes('case mismatch'))

  console.log('\n📋 Issue Summary:')
  console.log(`   Invalid usernames: ${invalidUsernameIssues.length}`)
  console.log(`   Duplicates: ${duplicateIssues.length}`)
  console.log(`   Empty strings: ${emptyStringIssues.length}`)
  console.log(`   Case mismatches: ${caseMismatchIssues.length}`)

  console.log('\n🔧 To fix these issues:')
  console.log('1. Review each item in the Supabase admin panel or app admin')
  console.log('2. Update the featured_members array with correct usernames')
  console.log('3. Ensure all usernames match exactly with profiles.username')
  
  console.log('\n⚠️  AUTO-FIX NOT IMPLEMENTED - Manual review required')
  console.log('   (Auto-fix could be added but requires careful validation)')
}

// Run validation
suggestFixes()
  .then(() => {
    console.log('\n✅ Validation complete!')
    process.exit(0)
  })
  .catch((err) => {
    console.error('❌ Error:', err)
    process.exit(1)
  })
