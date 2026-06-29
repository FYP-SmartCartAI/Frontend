import { useState, useEffect } from 'react'
import { cn } from '../../utils/cn'

/**
 * Avatar — initials fallback with image support
 * sizes: xs | sm | md | lg | xl
 */
const sizes = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
}

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export default function Avatar({ src, name, size = 'md', className }) {
  const [imgFailed, setImgFailed] = useState(false)

  useEffect(() => {
    setImgFailed(false)
  }, [src])

  const showImage = src && !imgFailed

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden shrink-0',
        'bg-bg-tertiary border border-border-accent',
        'flex items-center justify-center',
        'font-medium font-[var(--font-mono)] text-accent',
        sizes[size],
        className,
      )}
    >
      {showImage ? (
        <img
          src={src}
          alt={name || 'avatar'}
          className="w-full h-full object-cover"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  )
}
