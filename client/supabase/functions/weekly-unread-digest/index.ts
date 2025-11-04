// Supabase Edge Function to send weekly unread messages digest
// Runs via cron every Sunday at end of day
// Checks for users with unread messages and sends reminder emails

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[weekly-unread-digest] Starting weekly digest check')

    // Create Supabase client with service role for admin access
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Validate required env vars
    const appUrl = Deno.env.get('APP_URL')
    const emailServiceId = Deno.env.get('EMAILJS_SERVICE_ID')
    const emailTemplateId = Deno.env.get('EMAILJS_TEMPLATE_WEEKLY_DIGEST')
    const emailPublicKey = Deno.env.get('EMAILJS_PUBLIC_KEY')

    const missing: string[] = []
    if (!appUrl) missing.push('APP_URL')
    if (!emailServiceId) missing.push('EMAILJS_SERVICE_ID')
    if (!emailTemplateId) missing.push('EMAILJS_TEMPLATE_WEEKLY_DIGEST')
    if (!emailPublicKey) missing.push('EMAILJS_PUBLIC_KEY')
    if (missing.length) {
      console.error('[weekly-unread-digest] Missing env vars:', missing)
      return new Response(
        JSON.stringify({ error: 'Missing required environment variables', missing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Get all messages where is_read = false, grouped by receiver
    const { data: unreadMessages, error: messagesError } = await supabaseClient
      .from('messages')
      .select('receiver_id, id')
      .eq('is_read', false)

    if (messagesError) {
      console.error('[weekly-unread-digest] Error fetching unread messages:', messagesError)
      throw new Error('Failed to fetch unread messages')
    }

    if (!unreadMessages || unreadMessages.length === 0) {
      console.log('[weekly-unread-digest] No unread messages found')
      return new Response(
        JSON.stringify({ success: true, message: 'No unread messages to notify', users_notified: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Group by receiver_id and count unread messages
    const unreadByUser = new Map<string, number>()
    for (const msg of unreadMessages) {
      const count = unreadByUser.get(msg.receiver_id) || 0
      unreadByUser.set(msg.receiver_id, count + 1)
    }

    console.log(`[weekly-unread-digest] Found ${unreadByUser.size} users with unread messages`)

    // Fetch profiles for users with unread messages
    const userIds = Array.from(unreadByUser.keys())
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id, email, full_name, username, email_notifications_enabled')
      .in('id', userIds)

    if (profilesError) {
      console.error('[weekly-unread-digest] Error fetching profiles:', profilesError)
      throw new Error('Failed to fetch user profiles')
    }

    let emailsSent = 0
    let emailsSkipped = 0
    const skipReasons: { [key: string]: number } = {}

    // Send digest email to each user
    for (const profile of profiles || []) {
      // Skip if user has disabled email notifications (NULL is treated as enabled for backwards compatibility)
      if (profile.email_notifications_enabled === false) {
        console.log(`[weekly-unread-digest] Skipping user ${profile.id} - notifications disabled`)
        skipReasons['notifications_disabled'] = (skipReasons['notifications_disabled'] || 0) + 1
        emailsSkipped++
        continue
      }

      // Skip if user has no email
      if (!profile.email) {
        console.log(`[weekly-unread-digest] Skipping user ${profile.id} - no email address`)
        skipReasons['no_email'] = (skipReasons['no_email'] || 0) + 1
        emailsSkipped++
        continue
      }

      const unreadCount = unreadByUser.get(profile.id) || 0

      // Prepare email data
      const emailData = {
        to_email: profile.email,
        to_name: profile.full_name || profile.username,
        unread_count: unreadCount,
        messages_link: `${appUrl}/community/messages`,
        app_name: 'Music Club IIITDM',
      }

      console.log(`[weekly-unread-digest] Sending to ${profile.email} (${unreadCount} unread)`)

      // Send email via EmailJS API
      const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': appUrl,
          'Referer': appUrl,
        },
        body: JSON.stringify({
          service_id: emailServiceId,
          template_id: emailTemplateId,
          user_id: emailPublicKey,
          template_params: emailData,
        }),
      })

      if (!emailResponse.ok) {
        const errText = await emailResponse.text().catch(() => '')
        console.error(`[weekly-unread-digest] EmailJS error for user ${profile.id}:`, { 
          status: emailResponse.status, 
          body: errText,
          email_data: emailData,
        })
        skipReasons['email_failed'] = (skipReasons['email_failed'] || 0) + 1
        emailsSkipped++
        continue
      }

      emailsSent++
      console.log(`[weekly-unread-digest] Email sent to ${profile.email}`)
      
      // Update last_email_sent_at timestamp in profile
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({ last_email_sent_at: new Date().toISOString() })
        .eq('id', profile.id)
      
      if (updateError) {
        console.error(`[weekly-unread-digest] Failed to update last_email_sent_at for user ${profile.id}:`, updateError)
      }
      
      // Add small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const summary = {
      success: true,
      message: 'Weekly digest sent',
      users_with_unread: unreadByUser.size,
      emails_sent: emailsSent,
      emails_skipped: emailsSkipped,
      skip_reasons: skipReasons,
      timestamp: new Date().toISOString(),
    }

    console.log('[weekly-unread-digest] Complete:', summary)

    return new Response(
      JSON.stringify(summary),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('[weekly-unread-digest] Error:', error)
    return new Response(
      JSON.stringify({ 
        error: (error instanceof Error) ? error.message : String(error),
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
