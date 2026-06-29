import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageCircle, ChevronRight } from 'lucide-react'
import TicketStatusBadge from './TicketStatusBadge'
import { formatRelativeTime } from '../../utils/formatDate'
import { cn } from '../../utils/cn'

export default function TicketCard({ ticket }) {
  const {
    _id, subject, status,
    createdAt, messages = [],
    orderId,
  } = ticket

  const lastMessage = messages[messages.length - 1]
  const orderShort = orderId ? `#${String(orderId).slice(-6).toUpperCase()}` : null
  const title = subject || (orderShort ? `Order ${orderShort}` : 'Support Ticket')

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/support/${_id}`}
        className={cn(
          'flex items-start gap-3 p-4',
          'bg-bg-secondary border border-border rounded-[var(--radius-lg)]',
          'hover:border-accent/30 hover:shadow-[var(--shadow-gold)]',
          'transition-all duration-200',
        )}
      >
        {/* Icon */}
        <div className="w-9 h-9 rounded-full bg-bg-tertiary border border-border flex items-center justify-center shrink-0 mt-0.5">
          <MessageCircle size={14} className="text-accent" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-text-primary truncate">{title}</p>
            <TicketStatusBadge status={status} />
          </div>

          {orderShort && subject && (
            <p className="text-[10px] text-text-tertiary uppercase tracking-widest mb-1">
              Order {orderShort}
            </p>
          )}

          {lastMessage?.text && (
            <p className="text-xs text-text-secondary line-clamp-1 mb-1.5">
              {lastMessage.text}
            </p>
          )}

          <p className="text-[10px] text-text-tertiary">
            {formatRelativeTime(lastMessage?.createdAt || createdAt)}
          </p>
        </div>

        <ChevronRight size={15} className="text-text-tertiary shrink-0 mt-1" />
      </Link>
    </motion.div>
  )
}
