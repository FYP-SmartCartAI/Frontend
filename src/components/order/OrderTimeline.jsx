import { motion } from 'framer-motion'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import { formatDateTime } from '../../utils/formatDate'
import { cn } from '../../utils/cn'

const STEPS = [
  { status: 'pending',    label: 'Order Placed'  },
  { status: 'confirmed',  label: 'Confirmed'     },
  { status: 'processing', label: 'Processing'    },
  { status: 'shipped',    label: 'Shipped'       },
  { status: 'delivered',  label: 'Delivered'     },
]

const ORDER_IDX = STEPS.reduce((acc, s, i) => ({ ...acc, [s.status]: i }), {})

export default function OrderTimeline({ currentStatus, statusHistory = [] }) {
  const currentIdx = ORDER_IDX[currentStatus?.toLowerCase()] ?? -1
  const isCancelled = currentStatus?.toLowerCase() === 'cancelled'

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-4">
        <div className="w-6 h-6 rounded-full bg-error/10 flex items-center justify-center">
          <Circle size={12} className="text-error" />
        </div>
        <span className="text-sm text-error">Order was cancelled</span>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-3 top-3 bottom-3 w-px bg-border" />

      <div className="space-y-5">
        {STEPS.map((step, idx) => {
          const done    = idx <= currentIdx
          const active  = idx === currentIdx
          const entry   = statusHistory?.find(
            (h) => h.status?.toLowerCase() === step.status
          )

          return (
            <motion.div
              key={step.status}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="relative flex items-start gap-4 pl-8"
            >
              {/* Node */}
              <div
                className={cn(
                  'absolute left-0 w-6 h-6 rounded-full flex items-center justify-center',
                  'border-2 bg-bg-secondary transition-all',
                  done
                    ? 'border-accent bg-accent/10'
                    : 'border-border',
                )}
              >
                {done ? (
                  <CheckCircle2 size={12} className="text-accent" fill="currentColor" strokeWidth={0} />
                ) : (
                  <Circle size={10} className="text-border-accent" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0 pb-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    active ? 'text-accent' : done ? 'text-text-primary' : 'text-text-tertiary',
                  )}
                >
                  {step.label}
                  {active && (
                    <span className="ml-2 text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded-full align-middle">
                      Current
                    </span>
                  )}
                </p>
                {entry?.timestamp && (
                  <p className="text-xs text-text-tertiary mt-0.5 flex items-center gap-1">
                    <Clock size={10} />
                    {formatDateTime(entry.timestamp)}
                  </p>
                )}
                {entry?.note && (
                  <p className="text-xs text-text-secondary mt-1 italic">"{entry.note}"</p>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
