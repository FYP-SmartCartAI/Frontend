import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, ChevronRight, MessageCircle, Loader2 } from 'lucide-react'
import OrderStatusBadge from './OrderStatusBadge'
import { formatPrice } from '../../utils/formatPrice'
import { formatShortDate } from '../../utils/formatDate'
import { cn } from '../../utils/cn'
import ProductImage from '../product/ProductImage'

export default function OrderCard({ order, onChat, chatLoading = false }) {
  const {
    _id, orderNumber, status, total,
    createdAt, items = [],
  } = order

  const firstImage = items?.[0]?.product?.images?.[0]
  const extraCount = Math.max(0, items.length - 1)
  const orderTitle = `#${orderNumber || _id?.slice(-6).toUpperCase()}`

  const handleChatClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onChat?.(order, orderTitle)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      transition={{ duration: 0.2 }}
    >
      <Link
        to={`/orders/${_id}`}
        className={cn(
          'flex items-center gap-4 p-4',
          'bg-bg-secondary border border-border rounded-[var(--radius-lg)]',
          'hover:border-accent/30 hover:shadow-[var(--shadow-gold)]',
          'transition-all duration-200',
        )}
      >
        {/* Thumbnail */}
        <div className="relative w-14 h-14 rounded-[var(--radius-md)] overflow-hidden bg-bg-tertiary border border-border shrink-0">
          {items?.[0] ? (
            <ProductImage
              productName={items[0].product?.name || items[0].name}
              backendImages={items[0].product?.images || (items[0].image ? [items[0].image] : [])}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package size={18} className="text-text-tertiary" />
            </div>
          )}
          {extraCount > 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">+{extraCount}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="text-sm font-medium text-text-primary truncate">
              {orderTitle}
            </p>
            <OrderStatusBadge status={status} />
          </div>
          <p className="text-xs text-text-tertiary">{formatShortDate(createdAt)}</p>
          <p
            className="text-sm font-semibold text-accent mt-1"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {formatPrice(total)}
          </p>
        </div>

        {/* Chat / support for this order */}
        {onChat && (
          <button
            onClick={handleChatClick}
            disabled={chatLoading}
            title="Chat about this order"
            aria-label="Open support chat for this order"
            className={cn(
              'w-9 h-9 shrink-0 rounded-full flex items-center justify-center',
              'bg-accent/10 text-accent border border-accent/20',
              'hover:bg-accent hover:text-bg-primary hover:border-accent',
              'transition-all duration-200 disabled:opacity-50',
            )}
          >
            {chatLoading
              ? <Loader2 size={15} className="animate-spin" />
              : <MessageCircle size={15} />}
          </button>
        )}

        <ChevronRight size={16} className="text-text-tertiary shrink-0" />
      </Link>
    </motion.div>
  )
}
