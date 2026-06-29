import { cn } from '../../utils/cn'

/**
 * Skeleton — gold-shimmer loading placeholder
 */
export default function Skeleton({ className, ...props }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'rounded-[var(--radius-md)] skeleton-shimmer',
        className,
      )}
      {...props}
    />
  )
}

/**
 * Pre-composed skeletons for common layouts
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] overflow-hidden">
      <Skeleton className="w-full aspect-square" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3 mt-3" />
      </div>
    </div>
  )
}

export function TableRowSkeleton({ cols = 5, colClasses = [] }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className={cn("px-4 py-3", colClasses[i] || '')}>
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-1.5 flex-1">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5 space-y-3">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-16" />
    </div>
  )
}
