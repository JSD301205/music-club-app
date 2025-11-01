// File upload utility for chat messages
import { createClient } from '@/app/lib/supabase-client'

const supabase = createClient()

export interface FileUploadResult {
  url: string
  fileName: string
  fileType: string
  fileSize: number
}

export const ALLOWED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  audio: ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a'],
  documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}

export const MAX_FILE_SIZES = {
  image: 10 * 1024 * 1024, // 10MB
  audio: 10 * 1024 * 1024, // 10MB
  document: 25 * 1024 * 1024, // 25MB
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allAllowedTypes = [
    ...ALLOWED_FILE_TYPES.images,
    ...ALLOWED_FILE_TYPES.audio,
    ...ALLOWED_FILE_TYPES.documents,
  ]

  if (!allAllowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'File type not supported. Allowed: Images (JPG, PNG, GIF, WebP), Audio (MP3, WAV, OGG), Documents (PDF, DOC, DOCX)',
    }
  }

  // Check file size
  let maxSize = MAX_FILE_SIZES.document
  if (ALLOWED_FILE_TYPES.images.includes(file.type)) {
    maxSize = MAX_FILE_SIZES.image
  } else if (ALLOWED_FILE_TYPES.audio.includes(file.type)) {
    maxSize = MAX_FILE_SIZES.audio
  }

  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024)
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  return { valid: true }
}

/**
 * Upload file to Supabase Storage
 * @param file - File to upload
 * @param userId - User ID for folder organization
 * @param bucket - Storage bucket ('chat-files' or 'global-chat-files')
 */
export async function uploadChatFile(
  file: File,
  userId: string,
  bucket: 'chat-files' | 'global-chat-files' = 'chat-files'
): Promise<FileUploadResult> {
  // Validate file
  const validation = validateFile(file)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const fileName = `${timestamp}_${randomString}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) {
    throw new Error(`Upload failed: ${error.message}`)
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(filePath)

  return {
    url: publicUrl,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  }
}

/**
 * Delete file from Supabase Storage
 */
export async function deleteChatFile(
  fileUrl: string,
  bucket: 'chat-files' | 'global-chat-files' = 'chat-files'
): Promise<void> {
  try {
    // Extract file path from URL
    const url = new URL(fileUrl)
    const pathParts = url.pathname.split('/')
    const bucketIndex = pathParts.indexOf(bucket)
    if (bucketIndex === -1) return

    const filePath = pathParts.slice(bucketIndex + 1).join('/')

    const { error } = await supabase.storage.from(bucket).remove([filePath])

    if (error) {
      console.error('Error deleting file:', error)
    }
  } catch (error) {
    console.error('Error parsing file URL:', error)
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get file type category
 */
export function getFileCategory(mimeType: string): 'image' | 'audio' | 'document' | 'unknown' {
  if (ALLOWED_FILE_TYPES.images.includes(mimeType)) return 'image'
  if (ALLOWED_FILE_TYPES.audio.includes(mimeType)) return 'audio'
  if (ALLOWED_FILE_TYPES.documents.includes(mimeType)) return 'document'
  return 'unknown'
}

/**
 * Check if file is previewable in browser
 */
export function isPreviewable(mimeType: string): boolean {
  const category = getFileCategory(mimeType)
  return category === 'image' || category === 'audio'
}
