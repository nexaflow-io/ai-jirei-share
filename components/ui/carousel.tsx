'use client'

import React, { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CarouselProps {
  images: Array<{ id: string; image_url: string; description?: string }>
  className?: string
}

export function Carousel({ images, className }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  // キーボードナビゲーション
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        prevSlide()
      } else if (event.key === 'ArrowRight') {
        nextSlide()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div className={cn("relative w-full", className)}>
      {/* メイン画像 */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
        <img
          src={images[currentIndex].image_url}
          alt={images[currentIndex].description || '施工写真'}
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        
        {/* ナビゲーションボタン */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
              aria-label="前の画像"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
              aria-label="次の画像"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* 画像インジケーター */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentIndex
                    ? "bg-white scale-125"
                    : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`画像 ${index + 1} に移動`}
              />
            ))}
          </div>
        )}

        {/* 画像カウンター */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* サムネイル */}
      {images.length > 1 && (
        <div className="flex mt-4 space-x-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => goToSlide(index)}
              className={cn(
                "flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                index === currentIndex
                  ? "border-blue-500 ring-2 ring-blue-200"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <img
                src={image.image_url}
                alt={`サムネイル ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
