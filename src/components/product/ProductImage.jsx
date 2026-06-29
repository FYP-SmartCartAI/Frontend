import { useState, useEffect } from 'react'

export default function ProductImage({ productName, backendImages = [], className = "", alt = "", ...props }) {
  const sanitizedName = productName
    ? productName.replace(/[^a-zA-Z0-9\s_\-\.]/g, '').trim()
    : ''
  
  const jpgSrc = `/images/products/${sanitizedName}.jpg`
  const jpegSrc = `/images/products/${sanitizedName}.jpeg`
  const pngSrc = `/images/products/${sanitizedName}.png`
  const fallbackSrc = backendImages[0] || null
  
  const [src, setSrc] = useState(jpgSrc)
  const [attemptStage, setAttemptStage] = useState(0) // 0: JPG, 1: JPEG, 2: PNG, 3: Fallback

  useEffect(() => {
    const newSanitizedName = productName
      ? productName.replace(/[^a-zA-Z0-9\s_\-\.]/g, '').trim()
      : ''
    setSrc(`/images/products/${newSanitizedName}.jpg`)
    setAttemptStage(0)
  }, [productName])

  const handleError = () => {
    if (attemptStage === 0) {
      setSrc(jpegSrc)
      setAttemptStage(1)
    } else if (attemptStage === 1) {
      setSrc(pngSrc)
      setAttemptStage(2)
    } else if (attemptStage === 2) {
      if (fallbackSrc) {
        setSrc(fallbackSrc)
      } else {
        setSrc(`https://placehold.co/600x600/png?text=${encodeURIComponent(productName || 'Product')}`)
      }
      setAttemptStage(3)
    }
  }

  return src ? (
    <img
      src={src}
      alt={alt || productName}
      className={className}
      onError={handleError}
      {...props}
    />
  ) : null
}
