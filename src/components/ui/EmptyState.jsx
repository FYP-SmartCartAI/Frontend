import { motion } from 'framer-motion'
import { PackageOpen } from 'lucide-react'
import Button from './Button'
import { cn } from '../../utils/cn'

/**
 * EmptyState — zero-results / no-data placeholder
 */
export default function EmptyState({
  icon:   Icon     = PackageOpen,
  title            = 'Nothing here yet',
  message,
  action,
  actionLabel      = 'Get started',
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-16 px-6 gap-4',
        className,
      )}
    >
      {/* Icon halo */}
      <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
        <Icon size={28} className="text-accent" strokeWidth={1.5} />
      </div>

      <div className="space-y-1 max-w-xs">
        <h3 className="text-base font-semibold text-text-primary font-[var(--font-display)]">
          {title}
        </h3>
        {message && (
          <p className="text-sm text-text-secondary">{message}</p>
        )}
      </div>

      {action && (
        <Button variant="gold" size="sm" onClick={action}>
          {actionLabel}
        </Button>
      )}
    </motion.div>
  )
}
