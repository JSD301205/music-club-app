/**
 * EMAIL NOTIFICATION INTEGRATION EXAMPLE
 * 
 * This file contains example code showing how to trigger email notifications
 * after sending a message. Copy the relevant parts to your actual message
 * sending logic in app/community/messages/page.tsx
 * 
 * This is documentation only - not compiled into the build.
 */

/*

// STEP 1: Import the necessary modules
import { createClient } from '@/app/lib/supabase-client'

// STEP 2: Add this function to your messaging component or create a utility
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
  // Don't await this - let it run in background
  fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-message-notification`,
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
  ).catch((error) => {
    // Log error but don't fail the message send
    console.error('Email notification error:', error)
  })

  return message
}

// STEP 3: Usage example in your component
const handleSendMessage = async () => {
  try {
    const message = await sendMessageWithNotification(
      messageContent,
      receiverProfile.id,
      conversation.id
    )
    
    // Update UI, clear input, etc.
    console.log('Message sent successfully:', message)
  } catch (error) {
    console.error('Failed to send message:', error)
  }
}

*/

// This file is for reference only
export {}
