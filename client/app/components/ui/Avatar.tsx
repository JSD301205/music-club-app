'use client'

import { useState } from 'react'
import Image from 'next/image'

interface AvatarProps {
  src?: string | null
  alt: string
  fallback: string // Usually first letter of name
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-12 h-12 text-lg',
  lg: 'w-16 h-16 text-2xl',
  xl: 'w-24 h-24 text-3xl',
}

const sizePixels = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
}

export default function Avatar({ src, alt, fallback, size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)

  const sizeClass = sizeClasses[size]
  const pixelSize = sizePixels[size]

  // Show fallback if no src, or if image failed to load
  const showFallback = !src || imageError

  return (
    <div
      className={`relative ${sizeClass} rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center overflow-hidden ${className}`}
    >
      {showFallback ? (
        <span className="text-white font-bold">
          {fallback.charAt(0).toUpperCase()}
        </span>
      ) : (
        <>
          <Image
            src={src}
            alt={alt}
            width={pixelSize}
            height={pixelSize}
            className="object-cover w-full h-full"
            onError={() => {
              setImageError(true)
              setImageLoading(false)
            }}
            onLoad={() => setImageLoading(false)}
          />
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-purple-600">
              <span className="text-white font-bold">
                {fallback.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </>
      )}
    </div>
  )
}

