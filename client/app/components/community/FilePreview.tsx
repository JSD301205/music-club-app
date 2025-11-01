'use client'

import { useState } from 'react'
import Image from 'next/image'
import { FaFile, FaFileAudio, FaFilePdf, FaFileWord, FaDownload, FaTimes } from 'react-icons/fa'
import { getFileCategory, formatFileSize } from '@/app/utils/fileUpload'

interface FilePreviewProps {
  fileUrl: string
  fileName: string
  fileType: string
  fileSize?: number
  showDownload?: boolean
}

export default function FilePreview({
  fileUrl,
  fileName,
  fileType,
  fileSize,
  showDownload = true,
}: FilePreviewProps) {
  const [showFullscreen, setShowFullscreen] = useState(false)
  const category = getFileCategory(fileType)

  const getFileIcon = () => {
    if (category === 'audio') return <FaFileAudio className="text-purple-500" size={24} />
    if (fileType === 'application/pdf') return <FaFilePdf className="text-red-500" size={24} />
    if (fileType.includes('word')) return <FaFileWord className="text-blue-500" size={24} />
    return <FaFile className="text-gray-500" size={24} />
  }

  // Image preview
  if (category === 'image') {
    return (
      <>
        <div className="relative group cursor-pointer" onClick={() => setShowFullscreen(true)}>
          <Image
            src={fileUrl}
            alt={fileName}
            width={300}
            height={200}
            className="rounded-lg object-cover max-w-sm hover:opacity-90 transition-opacity"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg flex items-center justify-center">
            <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
              Click to enlarge
            </span>
          </div>
        </div>

        {/* Fullscreen modal */}
        {showFullscreen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullscreen(false)}
          >
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300"
            >
              <FaTimes size={32} />
            </button>
            <Image
              src={fileUrl}
              alt={fileName}
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
            />
            {showDownload && (
              <a
                href={fileUrl}
                download={fileName}
                onClick={(e) => e.stopPropagation()}
                className="absolute bottom-4 right-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <FaDownload />
                Download
              </a>
            )}
          </div>
        )}
      </>
    )
  }

  // Audio preview
  if (category === 'audio') {
    return (
      <div className="bg-gray-800/50 rounded-lg p-3 max-w-md">
        <div className="flex items-center gap-3 mb-2">
          {getFileIcon()}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{fileName}</p>
            {fileSize && <p className="text-gray-400 text-xs">{formatFileSize(fileSize)}</p>}
          </div>
        </div>
        <audio controls className="w-full" preload="metadata">
          <source src={fileUrl} type={fileType} />
          Your browser does not support audio playback.
        </audio>
        {showDownload && (
          <a
            href={fileUrl}
            download={fileName}
            className="mt-2 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <FaDownload size={10} />
            Download
          </a>
        )}
      </div>
    )
  }

  // Document preview (PDF, Word, etc.)
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 max-w-md border border-gray-700">
      <div className="flex items-center gap-3">
        {getFileIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-medium truncate">{fileName}</p>
          {fileSize && <p className="text-gray-400 text-xs">{formatFileSize(fileSize)}</p>}
        </div>
        {showDownload && (
          <a
            href={fileUrl}
            download={fileName}
            className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors flex items-center gap-1"
          >
            <FaDownload size={10} />
            Download
          </a>
        )}
      </div>
      {fileType === 'application/pdf' && (
        <a
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 text-xs text-blue-400 hover:text-blue-300 block"
        >
          Open in new tab
        </a>
      )}
    </div>
  )
}
