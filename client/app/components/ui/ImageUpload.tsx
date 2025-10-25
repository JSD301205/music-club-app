'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import { FaUpload, FaTimes, FaCrop, FaCheck, FaSearchPlus, FaSearchMinus } from 'react-icons/fa'

interface ImageUploadProps {
  currentImage?: string | null
  onImageChange: (file: File) => void
  onRemove: () => void
  username: string
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export default function ImageUpload({ currentImage, onImageChange, onRemove, username }: ImageUploadProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [croppingMode, setCroppingMode] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 300, height: 300 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (imgRef.current && selectedImage) {
      const img = imgRef.current
      img.onload = () => {
        setImageSize({ width: img.naturalWidth, height: img.naturalHeight })
        // Center the crop area initially
        const displayWidth = img.clientWidth
        const displayHeight = img.clientHeight
        const cropSize = Math.min(displayWidth, displayHeight) * 0.8
        setCropArea({
          x: (displayWidth - cropSize) / 2,
          y: (displayHeight - cropSize) / 2,
          width: cropSize,
          height: cropSize,
        })
      }
    }
  }, [selectedImage])

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
        setZoom(1)
        setCroppingMode(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX - cropArea.x, y: e.clientY - cropArea.y })
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX - cropArea.x, y: touch.clientY - cropArea.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !imgRef.current) return

    const img = imgRef.current
    const rect = img.getBoundingClientRect()
    
    let newX = e.clientX - dragStart.x
    let newY = e.clientY - dragStart.y

    // Constrain to image bounds
    newX = Math.max(0, Math.min(newX, img.clientWidth - cropArea.width))
    newY = Math.max(0, Math.min(newY, img.clientHeight - cropArea.height))

    setCropArea(prev => ({ ...prev, x: newX, y: newY }))
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !imgRef.current) return

    const touch = e.touches[0]
    const img = imgRef.current
    
    let newX = touch.clientX - dragStart.x
    let newY = touch.clientY - dragStart.y

    // Constrain to image bounds
    newX = Math.max(0, Math.min(newX, img.clientWidth - cropArea.width))
    newY = Math.max(0, Math.min(newY, img.clientHeight - cropArea.height))

    setCropArea(prev => ({ ...prev, x: newX, y: newY }))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.5))
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

    // Calculate the scale between display size and natural size
    const scaleX = img.naturalWidth / img.clientWidth
    const scaleY = img.naturalHeight / img.clientHeight

    // Calculate crop coordinates in natural image size
    const sx = cropArea.x * scaleX
    const sy = cropArea.y * scaleY
    const sWidth = cropArea.width * scaleX
    const sHeight = cropArea.height * scaleY

    // Draw cropped and resized image
    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, size, size)

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
          setZoom(1)
        }
      },
      'image/jpeg',
      0.9 // Quality
    )
  }, [selectedImage, onImageChange, cropArea])

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
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-auto">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <FaCrop />
              Crop Your Image
            </h3>

            <div className="relative bg-gray-800 rounded-lg p-4 mb-4">
              <div 
                ref={containerRef}
                className="flex items-center justify-center relative select-none"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
              >
                <div className="relative inline-block">
                  <img
                    ref={imgRef}
                    src={selectedImage}
                    alt="Crop preview"
                    className="max-w-full max-h-[400px] object-contain"
                    style={{ transform: `scale(${zoom})` }}
                    draggable={false}
                  />
                  
                  {/* Darkened overlay */}
                  <div className="absolute inset-0 bg-black/50 pointer-events-none" />
                  
                  {/* Draggable crop area */}
                  <div
                    className="absolute border-4 border-purple-500 cursor-move bg-transparent shadow-2xl"
                    style={{
                      left: `${cropArea.x}px`,
                      top: `${cropArea.y}px`,
                      width: `${cropArea.width}px`,
                      height: `${cropArea.height}px`,
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                    }}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                  >
                    {/* Corner handles */}
                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-purple-500 rounded-full" />
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-purple-500 rounded-full" />
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-purple-500 rounded-full" />
                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-purple-500 rounded-full" />
                    
                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      <div className="border-r border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-r border-b border-white/30" />
                      <div className="border-b border-white/30" />
                      <div className="border-r border-white/30" />
                      <div className="border-r border-white/30" />
                      <div />
                    </div>
                  </div>
                </div>
              </div>

              {/* Zoom controls */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all flex items-center gap-2"
                  disabled={zoom <= 0.5}
                >
                  <FaSearchMinus />
                </button>
                <span className="text-white text-sm font-medium min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all flex items-center gap-2"
                  disabled={zoom >= 3}
                >
                  <FaSearchPlus />
                </button>
              </div>

              <p className="text-gray-400 text-center text-sm mt-4">
                💡 Drag the purple square to adjust crop area • Use zoom buttons to scale
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

