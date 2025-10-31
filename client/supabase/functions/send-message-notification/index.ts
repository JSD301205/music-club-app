// Supabase Edge Function to send email notifications for new messages
// Deploy this to: supabase/functions/send-message-notification/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface MessageNotificationPayload {
  messageId: string
  senderId: string
  receiverId: string
  content: string
  conversationId: string
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('[send-message-notification] Invocation start')
    // Create Supabase client - automatically uses SUPABASE_URL and SUPABASE_ANON_KEY from env
    // These are provided automatically by Supabase Edge Functions
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Parse request body
    const payload: MessageNotificationPayload = await req.json()
    const { senderId, receiverId, content, conversationId } = payload

    console.log('[send-message-notification] Payload parsed', { hasSenderId: !!senderId, hasReceiverId: !!receiverId, contentLen: content?.length, hasConversationId: !!conversationId })

    // Validate required env vars for EmailJS and app URL
    const appUrl = Deno.env.get('APP_URL')
    const emailServiceId = Deno.env.get('EMAILJS_SERVICE_ID')
    const emailTemplateId = Deno.env.get('EMAILJS_TEMPLATE_NEW_MESSAGE')
    const emailPublicKey = Deno.env.get('EMAILJS_PUBLIC_KEY')

    const missing: string[] = []
    if (!appUrl) missing.push('APP_URL')
    if (!emailServiceId) missing.push('EMAILJS_SERVICE_ID')
    if (!emailTemplateId) missing.push('EMAILJS_TEMPLATE_NEW_MESSAGE')
    if (!emailPublicKey) missing.push('EMAILJS_PUBLIC_KEY')
    if (missing.length) {
      console.error('[send-message-notification] Missing env vars:', missing)
      return new Response(
        JSON.stringify({ error: 'Missing required environment variables', missing }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Fetch receiver profile to check notification preferences
    const { data: receiverProfile, error: receiverError } = await supabaseClient
      .from('profiles')
      .select('email, full_name, username, email_notifications_enabled, last_email_sent_at')
      .eq('id', receiverId)
      .single()

    if (receiverError || !receiverProfile) {
      console.error('[send-message-notification] Fetch receiver error:', receiverError)
      throw new Error('Failed to fetch receiver profile')
    }

    // Check if user has email notifications enabled
    if (!receiverProfile.email_notifications_enabled) {
      return new Response(
        JSON.stringify({ message: 'User has disabled email notifications' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Check rate limiting (5 minutes between emails)
    if (receiverProfile.last_email_sent_at) {
      const lastSent = new Date(receiverProfile.last_email_sent_at).getTime()
      const now = Date.now()
      const MIN_INTERVAL = 5 * 60 * 1000 // 5 minutes

      if (now - lastSent < MIN_INTERVAL) {
        return new Response(
          JSON.stringify({ message: 'Rate limit: too soon since last email' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        )
      }
    }

    // Fetch sender profile
    const { data: senderProfile, error: senderError } = await supabaseClient
      .from('profiles')
      .select('full_name, username')
      .eq('id', senderId)
      .single()

    if (senderError || !senderProfile) {
      console.error('[send-message-notification] Fetch sender error:', senderError)
      throw new Error('Failed to fetch sender profile')
    }

    // Prepare email data
    const emailData = {
      to_email: receiverProfile.email,
      to_name: receiverProfile.full_name || receiverProfile.username,
      from_name: senderProfile.full_name || senderProfile.username,
      message_preview: content.substring(0, 150),
      conversation_link: `${appUrl}/community/messages?conversation=${conversationId}`,
      service_id: emailServiceId!,
      template_id: emailTemplateId!,
      public_key: emailPublicKey!,
    }

    // Send email via EmailJS API
    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // EmailJS validates the Origin against allowed domains in your EmailJS dashboard
        // Use your app URL so it matches the configured domain
        'Origin': appUrl,
        'Referer': appUrl,
      },
      body: JSON.stringify({
        service_id: emailData.service_id,
        template_id: emailData.template_id,
        user_id: emailData.public_key,
        template_params: {
          to_email: emailData.to_email,
          to_name: emailData.to_name,
          from_name: emailData.from_name,
          message_preview: emailData.message_preview,
          conversation_link: emailData.conversation_link,
          app_name: 'Music Club IIITDM',
        },
      }),
    })

    if (!emailResponse.ok) {
      const errText = await emailResponse.text().catch(() => '')
      console.error('[send-message-notification] EmailJS error', { status: emailResponse.status, body: errText })
      return new Response(
        JSON.stringify({ error: 'EmailJS API error', status: emailResponse.status, body: errText }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Update last_email_sent_at timestamp
    await supabaseClient
      .from('profiles')
      .update({ last_email_sent_at: new Date().toISOString() })
      .eq('id', receiverId)

    return new Response(
      JSON.stringify({ success: true, message: 'Email notification sent' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in send-message-notification:', error)
    return new Response(
      JSON.stringify({ error: (error instanceof Error) ? error.message : String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
