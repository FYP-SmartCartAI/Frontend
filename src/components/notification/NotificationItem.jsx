import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Bell, Package, Tag, Info, MessageCircle, CreditCard, AlertTriangle } from 'lucide-react'
import { formatRelativeTime } from '../../utils/formatDate'
import { getNotificationPath } from '../../utils/getNotificationPath'
import { cn } from '../../utils/cn'
import { useAuth } from '../../hooks/useAuth'

const ICON_MAP = {
  order_status:        { icon: Package,       color: 'text-accent'  },
  new_order:           { icon: Package,       color: 'text-accent'  },
  payment:             { icon: CreditCard,    color: 'text-success' },
  cod_collected_admin: { icon: CreditCard,    color: 'text-success' },
  ticket_reply:        { icon: MessageCircle, color: 'text-accent'  },
  new_message:         { icon: MessageCircle, color: 'text-warning' },
  ticket_assigned:     { icon: MessageCircle, color: 'text-accent'  },
  new_ticket:          { icon: MessageCircle, color: 'text-accent'  },
  unresolved_ticket:   { icon: AlertTriangle, color: 'text-warning' },
  low_stock:           { icon: AlertTriangle, color: 'text-warning' },
  out_of_stock:        { icon: AlertTriangle, color: 'text-error animate-pulse' },
  abandoned_cart:      { icon: Tag,           color: 'text-warning' },
  general:             { icon: Info,          color: 'text-blue-400'},
  default:             { icon: Bell,          color: 'text-text-secondary' },
}

export default function NotificationItem({
  notification,
  onRead,
  onDelete,
  onNavigate,
  variant = 'preview',
}) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { _id, type, title, body, message, createdAt, isRead } = notification
  const text = body || message
  const path = getNotificationPath(notification, user?.role)
  const config = ICON_MAP[type] || ICON_MAP.default
  const IconComponent = config.icon

  const handleClick = () => {
    if (!isRead) onRead?.(_id)
    if (path) {
      onNavigate?.()
      navigate(path)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      onClick={handleClick}
      className={cn(
        'flex gap-3 px-4 py-3 transition-all',
        path ? 'cursor-pointer hover:bg-bg-tertiary' : 'cursor-default',
        !isRead && 'bg-accent/5',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
          'bg-bg-tertiary border border-border',
          config.color,
        )}
      >
        <IconComponent size={14} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'text-sm leading-snug',
            isRead ? 'text-text-secondary' : 'text-text-primary font-medium',
          )}
        >
          {title}
        </p>
        {text && (
          <p
            className={cn(
              'text-xs text-text-tertiary mt-0.5',
              variant === 'preview' ? 'line-clamp-2' : 'leading-relaxed whitespace-pre-wrap',
            )}
          >
            {text}
          </p>
        )}
        <p className="text-[10px] text-text-tertiary mt-1">{formatRelativeTime(createdAt)}</p>
      </div>

      {/* Unread dot */}
      {!isRead && (
        <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />
      )}
    </motion.div>
  )
}
