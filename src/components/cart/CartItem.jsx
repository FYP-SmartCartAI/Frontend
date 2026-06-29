import { motion } from 'framer-motion'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { formatPrice } from '../../utils/formatPrice'
import toast from 'react-hot-toast'
import { useCart } from '../../hooks/useCart'
import { useState } from 'react'
import ProductImage from '../product/ProductImage'

export default function CartItem({ item }) {
  const { updateItem, removeItem } = useCart()
  const [busy, setBusy]            = useState(false)

  const { product, quantity } = item
  const price = product?.discountPrice || product?.price || 0

  const handleQty = async (delta) => {
    const newQty = quantity + delta
    if (newQty < 1) return handleRemove()
    // The cart cache is updated optimistically, so the UI changes instantly
    // and the buttons stay clickable for rapid +/-; only surface errors.
    try {
      await updateItem(product._id, newQty)
    } catch (err) {
      toast.error(err?.data?.message || 'Could not update quantity')
    }
  }

  const handleRemove = async () => {
    try {
      setBusy(true)
      await removeItem(product._id)
      toast.success('Removed from cart')
    } catch {
      toast.error('Could not remove item')
    } finally {
      setBusy(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="flex gap-3 py-4 border-b border-border last:border-0"
    >
      {/* Image */}
      <Link to={`/products/${product.slug}`} className="shrink-0">
        <div className="w-16 h-16 rounded-[var(--radius-md)] overflow-hidden bg-bg-tertiary border border-border">
          <ProductImage
            productName={product?.name}
            backendImages={product?.images}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link to={`/products/${product.slug}`}>
          <p className="text-sm font-medium text-text-primary line-clamp-2 hover:text-accent transition-colors leading-snug">
            {product.name}
          </p>
        </Link>
        <p
          className="text-sm font-semibold text-accent mt-1"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {formatPrice(price * quantity)}
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => handleQty(-1)}
            className="w-6 h-6 rounded-[var(--radius-sm)] border border-border flex items-center justify-center text-text-tertiary hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus size={11} />
          </button>
          <span
            className="text-xs font-medium text-text-primary w-5 text-center"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {quantity}
          </span>
          <button
            onClick={() => handleQty(1)}
            className="w-6 h-6 rounded-[var(--radius-sm)] border border-border flex items-center justify-center text-text-tertiary hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus size={11} />
          </button>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={handleRemove}
        disabled={busy}
        className="shrink-0 text-text-tertiary hover:text-error transition-colors mt-1 disabled:opacity-40"
        aria-label="Remove item"
      >
        <Trash2 size={15} />
      </button>
    </motion.div>
  )
}
