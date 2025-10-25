'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { FaUpload, FaTimes, FaCrop, FaCheck } from 'react-icons/fa'

interface ImageUploadProps {
  currentImage?: string | null
  onImageChange: (file: File) => void
  onRemove: () => void
  username: string
}

export default function ImageUpload({ currentImage, onImageChange, onRemove, username }: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [croppingMode, setCroppingMode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setCroppingMode(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropAndSave = useCallback(() => {
    if (!imgRef.current || !canvasRef.current || !selectedImage) return

    const img = imgRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size for profile picture (400x400 is good for avatars)
    const size = 400
    canvas.width = size
    canvas.height = size

    // Calculate dimensions to crop to square from center
    const minDim = Math.min(img.naturalWidth, img.naturalHeight)
    const sx = (img.naturalWidth - minDim) / 2
    const sy = (img.naturalHeight - minDim) / 2

    // Draw cropped and resized image
    ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)

    // Convert canvas to blob
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], `avatar-${Date.now()}.jpg`, {
            type: 'image/jpeg',
          })
          onImageChange(file)
          setSelectedImage(null)
          setCroppingMode(false)
        }
      },
      'image/jpeg',
      0.9 // Quality
    )
  }, [selectedImage, onImageChange])

  const handleCancel = () => {
    setSelectedImage(null)
    setCroppingMode(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-white mb-4">
        Profile Picture
      </label>

      <div className="flex items-start gap-6">
        {/* Preview */}
        <div className="relative w-24 h-24 rounded-full border-4 border-purple-500 bg-purple-600 flex items-center justify-center overflow-hidden">
          {currentImage ? (
            <Image
              src={currentImage}
              alt="Profile"
              width={100}
              height={100}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-white text-3xl font-bold">
              {username.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        {/* Upload Controls */}
        <div className="flex-1">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
            >
              <FaUpload />
              Upload Photo
            </button>

            {currentImage && (
              <button
                type="button"
                onClick={onRemove}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <FaTimes />
                Remove
              </button>
            )}
          </div>

          <p className="text-gray-400 text-sm mt-2">
            Upload a square image (JPG, PNG, or GIF)
          </p>
          <p className="text-gray-400 text-xs mt-1">
            Max file size: 5MB • Recommended: 400x400px or larger
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>

      {/* Crop Modal */}
      {croppingMode && selectedImage && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-2xl w-full">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaCrop />
              Crop & Resize Image
            </h3>

            <div className="relative bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-center">
                <div className="relative max-w-md max-h-96 overflow-hidden">
                  <img
                    ref={imgRef}
                    src={selectedImage}
                    alt="Crop preview"
                    className="max-w-full max-h-96 object-contain"
                  />
                  {/* Crop overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div
                      className="absolute border-4 border-purple-500"
                      style={{
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '300px',
                        height: '300px',
                        maxWidth: '90%',
                        maxHeight: '90%',
                      }}
                    >
                      <div className="absolute inset-0 bg-transparent"></div>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-gray-400 text-center text-sm mt-4">
                Image will be cropped to a square from the center
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <FaTimes />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropAndSave}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all flex items-center gap-2"
              >
                <FaCheck />
                Crop & Upload
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

