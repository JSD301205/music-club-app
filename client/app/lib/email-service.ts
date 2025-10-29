// Email notification service using EmailJS
import emailjs from '@emailjs/browser'
import { EMAILJS_CONFIG } from '@/app/config/emailjs'

export interface SendMessageNotificationParams {
  recipientEmail: string
  recipientName: string
  senderName: string
  messagePreview: string
  conversationUrl: string
}

/**
 * Send email notification when a user receives a new message
 */
export async function sendMessageNotification({
  recipientEmail,
  recipientName,
  senderName,
  messagePreview,
  conversationUrl,
}: SendMessageNotificationParams): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate EmailJS configuration
    if (!EMAILJS_CONFIG.SERVICE_ID || !EMAILJS_CONFIG.PUBLIC_KEY) {
      console.error('EmailJS not configured properly')
      return {
        success: false,
        error: 'Email service not configured',
      }
    }

    // Prepare template parameters
    const templateParams = {
      to_email: recipientEmail,
      to_name: recipientName,
      from_name: senderName,
      message_preview: messagePreview.substring(0, 150), // Limit preview length
      conversation_link: conversationUrl,
      app_name: 'Music Club IIITDM',
    }

    // Get template ID for new messages (you'll create this template in EmailJS dashboard)
    const TEMPLATE_ID_NEW_MESSAGE = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_NEW_MESSAGE || EMAILJS_CONFIG.TEMPLATE_ID

    // Send email using EmailJS
    const response = await emailjs.send(
      EMAILJS_CONFIG.SERVICE_ID,
      TEMPLATE_ID_NEW_MESSAGE,
      templateParams,
      EMAILJS_CONFIG.PUBLIC_KEY
    )

    if (response.status === 200) {
      console.log('Email notification sent successfully to:', recipientEmail)
      return { success: true }
    } else {
      console.error('Failed to send email notification:', response)
      return {
        success: false,
        error: `Email send failed with status: ${response.status}`,
      }
    }
  } catch (error: any) {
    console.error('Error sending email notification:', error)
    return {
      success: false,
      error: error?.message || 'Unknown error occurred',
    }
  }
}

/**
 * Check if enough time has passed since last email to prevent spam
 * Minimum interval: 5 minutes between emails
 */
export function canSendEmail(lastEmailSentAt: string | null): boolean {
  if (!lastEmailSentAt) return true

  const MIN_EMAIL_INTERVAL_MS = 5 * 60 * 1000 // 5 minutes
  const lastSent = new Date(lastEmailSentAt).getTime()
  const now = Date.now()

  return now - lastSent >= MIN_EMAIL_INTERVAL_MS
}

/**
 * Truncate message content for email preview
 */
export function truncateMessage(message: string, maxLength: number = 150): string {
  if (message.length <= maxLength) return message
  return message.substring(0, maxLength) + '...'
}
