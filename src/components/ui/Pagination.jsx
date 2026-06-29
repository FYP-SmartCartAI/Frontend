import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Pagination — Dark Luxury Commerce
 */
export default function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}) {
  if (!totalPages || totalPages <= 1) return null

  const pages = buildPageNumbers(page, totalPages)

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center gap-1.5', className)}
    >
      {/* Prev */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)]',
          'border border-border text-text-secondary',
          'hover:border-accent hover:text-accent transition-colors',
          'disabled:opacity-30 disabled:cursor-not-allowed',
        )}
        aria-label="Previous page"
      >
        <ChevronLeft size={14} />
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dot-${i}`} className="w-8 text-center text-text-tertiary text-sm">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              'w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)]',
              'text-sm font-medium transition-all',
              p === page
                ? 'bg-accent text-bg-primary border border-accent font-semibold'
                : 'border border-border text-text-secondary hover:border-accent hover:text-accent',
            )}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className={cn(
          'w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)]',
          'border border-border text-text-secondary',
          'hover:border-accent hover:text-accent transition-colors',
          'disabled:opacity-30 disabled:cursor-not-allowed',
        )}
        aria-label="Next page"
      >
        <ChevronRight size={14} />
      </button>
    </nav>
  )
}

function buildPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4)  return [1, 2, 3, 4, 5, '...', total]
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  return [1, '...', current - 1, current, current + 1, '...', total]
}
