import { motion } from 'framer-motion'
import { cn } from '../../utils/cn'

/**
 * Button — Dark Luxury Commerce
 *
 * variants: primary | ghost | danger | gold | outline
 * sizes:    sm | md | lg
 */
const variants = {
  primary: [
    'bg-bg-tertiary text-text-primary border border-border-accent',
    'hover:border-accent hover:text-accent',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ],
  ghost: [
    'bg-transparent text-text-secondary border border-transparent',
    'hover:text-text-primary hover:bg-bg-tertiary',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ],
  danger: [
    'bg-error/10 text-error border border-error/30',
    'hover:bg-error/20 hover:border-error',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ],
  gold: [
    'bg-accent text-bg-primary font-semibold border border-accent',
    'hover:bg-accent-light hover:border-accent-light',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ],
  outline: [
    'bg-transparent text-accent border border-accent',
    'hover:bg-accent-dim',
    'disabled:opacity-40 disabled:cursor-not-allowed',
  ],
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-[var(--radius-sm)]',
  md: 'px-5 py-2.5 text-sm rounded-[var(--radius-md)]',
  lg: 'px-7 py-3.5 text-base rounded-[var(--radius-md)]',
}

export default function Button({
  children,
  variant  = 'primary',
  size     = 'md',
  className,
  loading  = false,
  icon,
  iconRight,
  type     = 'button',
  ...props
}) {
  return (
    <motion.button
      type={type}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.1 }}
      className={cn(
        'inline-flex items-center justify-center gap-2',
        'font-[var(--font-body)] font-medium',
        'transition-all duration-200 cursor-pointer',
        'select-none focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2',
        variants[variant]?.join(' '),
        sizes[size],
        loading && 'opacity-60 pointer-events-none',
        className,
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
      {iconRight && !loading && (
        <span className="shrink-0">{iconRight}</span>
      )}
    </motion.button>
  )
}
