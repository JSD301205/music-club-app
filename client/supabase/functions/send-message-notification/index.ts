// Supabase Edge Function to send email notifications for new messages
// Deploy this to: supabase/functions/send-message-notification/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MessageNotificationPayload {
  messageId: string
  senderId: string
  receiverId: string
  content: string
  conversationId: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role (no auth needed for background task)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Parse request body
    const payload: MessageNotificationPayload = await req.json()
    const { senderId, receiverId, content, conversationId } = payload

    // Fetch receiver profile to check notification preferences
    const { data: receiverProfile, error: receiverError } = await supabaseClient
      .from('profiles')
      .select('email, full_name, username, email_notifications_enabled, last_email_sent_at')
      .eq('id', receiverId)
      .single()

    if (receiverError || !receiverProfile) {
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
      throw new Error('Failed to fetch sender profile')
    }

    // Prepare email data
    const emailData = {
      to_email: receiverProfile.email,
      to_name: receiverProfile.full_name || receiverProfile.username,
      from_name: senderProfile.full_name || senderProfile.username,
      message_preview: content.substring(0, 150),
      conversation_link: `${Deno.env.get('APP_URL')}/community/messages?conversation=${conversationId}`,
      service_id: Deno.env.get('EMAILJS_SERVICE_ID'),
      template_id: Deno.env.get('EMAILJS_TEMPLATE_NEW_MESSAGE'),
      public_key: Deno.env.get('EMAILJS_PUBLIC_KEY'),
    }

    // Send email via EmailJS API
    const emailResponse = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
      throw new Error(`EmailJS API error: ${emailResponse.status}`)
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
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
