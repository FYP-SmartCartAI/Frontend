import { Star } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * ProductRating — displays star rating with optional review count
 */
export default function ProductRating({
  rating      = 0,
  reviewCount = 0,
  size        = 'sm',
  showCount   = true,
  className,
}) {
  const starSize = size === 'lg' ? 16 : size === 'md' ? 13 : 11

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < Math.floor(rating)
          const half   = !filled && i < rating
          return (
            <Star
              key={i}
              size={starSize}
              className={cn(
                filled || half ? 'text-accent' : 'text-border-accent',
              )}
              fill={filled ? 'currentColor' : 'none'}
              strokeWidth={1.5}
            />
          )
        })}
      </div>

      {/* Numeric rating */}
      <span
        className="text-xs font-medium text-text-primary"
        style={{ fontFamily: 'var(--font-mono)' }}
      >
        {rating.toFixed(1)}
      </span>

      {/* Review count */}
      {showCount && reviewCount > 0 && (
        <span className="text-xs text-text-tertiary">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  )
}
