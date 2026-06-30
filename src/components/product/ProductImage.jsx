import { useState, useEffect } from 'react'
import { getPreferredLocalProductImageUrl } from '../../utils/productLocalImages'

export default function ProductImage({ productName, backendImages = [], className = "", alt = "", ...props }) {
  const preferredLocal = getPreferredLocalProductImageUrl(productName)
  const fallbackSrc = backendImages[0] || null
  const placeholderSrc = `https://placehold.co/600x600/png?text=${encodeURIComponent(productName || 'Product')}`

  const [src, setSrc] = useState(preferredLocal || fallbackSrc || placeholderSrc)
  const [attemptStage, setAttemptStage] = useState(0) // 0: local, 1: backend, 2: placeholder

  useEffect(() => {
    const nextLocal = getPreferredLocalProductImageUrl(productName)
    setSrc(nextLocal || backendImages[0] || placeholderSrc)
    setAttemptStage(0)
  }, [productName, backendImages])

  const handleError = () => {
    if (attemptStage === 0) {
      if (fallbackSrc) {
        setSrc(fallbackSrc)
        setAttemptStage(1)
      } else {
        setSrc(placeholderSrc)
        setAttemptStage(2)
      }
    } else if (attemptStage === 1) {
      setSrc(placeholderSrc)
      setAttemptStage(2)
    }
  }

  return (
    <img
      src={src}
      alt={alt || productName}
      className={className}
      onError={handleError}
      {...props}
    />
  )
}
