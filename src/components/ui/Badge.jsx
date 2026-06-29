import { cn } from '../../utils/cn'

/**
 * Badge — Dark Luxury Commerce
 * variants: gold | success | error | warning | muted | info
 */
const variants = {
  gold:    'bg-accent/15 text-accent border border-accent/30',
  success: 'bg-success/10 text-success border border-success/20',
  error:   'bg-error/10 text-error border border-error/20',
  warning: 'bg-warning/10 text-warning border border-warning/20',
  muted:   'bg-bg-tertiary text-text-tertiary border border-border',
  info:    'bg-blue-500/10 text-blue-400 border border-blue-500/20',
}

export default function Badge({
  children,
  variant   = 'muted',
  dot       = false,
  className,
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5',
        'text-[11px] font-medium font-[var(--font-body)] uppercase tracking-wider',
        'rounded-full',
        variants[variant],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            variant === 'gold'    && 'bg-accent',
            variant === 'success' && 'bg-success',
            variant === 'error'   && 'bg-error',
            variant === 'warning' && 'bg-warning',
            variant === 'muted'   && 'bg-text-tertiary',
            variant === 'info'    && 'bg-blue-400',
          )}
        />
      )}
      {children}
    </span>
  )
}
