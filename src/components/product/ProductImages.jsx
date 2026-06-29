import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function ProductImages({ images = [], productName = '' }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [zoomed,    setZoomed]    = useState(false)

  const getLocalJpgSrc = (name) => {
    if (!name) return null
    const sanitizedName = name.replace(/[^a-zA-Z0-9\s_\-\.]/g, '').trim()
    return `/images/products/${sanitizedName}.jpg`
  }

  const getLocalJpegSrc = (name) => {
    if (!name) return null
    const sanitizedName = name.replace(/[^a-zA-Z0-9\s_\-\.]/g, '').trim()
    return `/images/products/${sanitizedName}.jpeg`
  }

  const getLocalPngSrc = (name) => {
    if (!name) return null
    const sanitizedName = name.replace(/[^a-zA-Z0-9\s_\-\.]/g, '').trim()
    return `/images/products/${sanitizedName}.png`
  }

  const [firstImageSrc, setFirstImageSrc] = useState(() => getLocalJpgSrc(productName) || images[0])
  const [attemptStage, setAttemptStage] = useState(0) // 0: JPG, 1: JPEG, 2: PNG, 3: Fallback

  useEffect(() => {
    setFirstImageSrc(getLocalJpgSrc(productName) || images[0])
    setAttemptStage(0)
  }, [productName, images])

  const handleFirstImageError = () => {
    if (attemptStage === 0) {
      const jpeg = getLocalJpegSrc(productName)
      if (jpeg) {
        setFirstImageSrc(jpeg)
        setAttemptStage(1)
      } else {
        const png = getLocalPngSrc(productName)
        if (png) {
          setFirstImageSrc(png)
          setAttemptStage(2)
        } else if (images[0]) {
          setFirstImageSrc(images[0])
          setAttemptStage(3)
        } else {
          setFirstImageSrc(null)
          setAttemptStage(3)
        }
      }
    } else if (attemptStage === 1) {
      const png = getLocalPngSrc(productName)
      if (png) {
        setFirstImageSrc(png)
        setAttemptStage(2)
      } else if (images[0]) {
        setFirstImageSrc(images[0])
        setAttemptStage(3)
      } else {
        setFirstImageSrc(null)
        setAttemptStage(3)
      }
    } else if (attemptStage === 2) {
      if (images[0]) {
        setFirstImageSrc(images[0])
      } else {
        setFirstImageSrc(null)
      }
      setAttemptStage(3)
    }
  }

  if (!firstImageSrc && !images.length) {
    return (
      <div className="aspect-square bg-bg-tertiary rounded-[var(--radius-lg)] flex items-center justify-center border border-border">
        <span className="text-text-tertiary text-sm">No image available</span>
      </div>
    )
  }

  const prev = () => setActiveIdx((i) => (i - 1 + images.length) % images.length)
  const next = () => setActiveIdx((i) => (i + 1) % images.length)

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative aspect-square rounded-[var(--radius-lg)] overflow-hidden bg-bg-tertiary border border-border group">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIdx}
            src={activeIdx === 0 ? firstImageSrc : images[activeIdx]}
            alt={`Product image ${activeIdx + 1}`}
            onError={activeIdx === 0 ? handleFirstImageError : undefined}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full object-cover"
          />
        </AnimatePresence>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bg-primary/80 backdrop-blur-sm text-text-primary hover:text-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-bg-primary/80 backdrop-blur-sm text-text-primary hover:text-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
              aria-label="Next image"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Zoom */}
        <button
          onClick={() => setZoomed(true)}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-bg-primary/80 backdrop-blur-sm text-text-tertiary hover:text-accent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          aria-label="Zoom image"
        >
          <ZoomIn size={14} />
        </button>

        {/* Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-2 bg-bg-primary/80 backdrop-blur-sm px-2 py-0.5 rounded-full text-[10px] text-text-secondary font-[var(--font-mono)]">
            {activeIdx + 1}/{images.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActiveIdx(i)}
              className={cn(
                'w-16 h-16 rounded-[var(--radius-md)] overflow-hidden shrink-0 border-2 transition-all',
                i === activeIdx
                  ? 'border-accent'
                  : 'border-border hover:border-border-accent',
              )}
              aria-label={`Image ${i + 1}`}
            >
              <img
                src={i === 0 ? firstImageSrc : src}
                alt=""
                className="w-full h-full object-cover"
                onError={i === 0 ? handleFirstImageError : undefined}
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setZoomed(false)}
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={activeIdx === 0 ? firstImageSrc : images[activeIdx]}
              alt="Zoomed"
              onError={activeIdx === 0 ? handleFirstImageError : undefined}
              className="max-w-full max-h-full object-contain rounded-[var(--radius-md)]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
