// Example: How to trigger email notification after sending a message
// Add this to your message sending logic in app/community/messages/page.tsx

import { createClient } from '@/app/lib/supabase-client'

async function sendMessageWithNotification(
  content: string,
  receiverId: string,
  conversationId: string
) {
  const supabase = createClient()
  
  // Get current session
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new Error('Not authenticated')

  // 1. Send the message to database
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({
      content,
      sender_id: session.user.id,
      receiver_id: receiverId,
      conversation_id: conversationId,
    })
    .select()
    .single()

  if (messageError) throw messageError

  // 2. Trigger email notification (async, non-blocking)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const response = await fetch(
      `${supabaseUrl}/functions/v1/send-message-notification`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messageId: message.id,
          senderId: session.user.id,
          receiverId,
          content,
          conversationId,
        }),
      }
    )

    if (!response.ok) {
      // Log error but don't fail the message send
      console.warn('Email notification failed:', await response.text())
    } else {
      console.log('Email notification triggered successfully')
    }
  } catch (error) {
    // Don't fail message send if notification fails
    console.error('Email notification error:', error)
  }

  return message
}

// Usage in your component:
// const message = await sendMessageWithNotification(
//   messageContent,
//   receiverProfile.id,
//   conversation.id
// )
