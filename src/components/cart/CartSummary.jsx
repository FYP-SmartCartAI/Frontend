import { useNavigate } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { formatPrice } from '../../utils/formatPrice'
import Button from '../ui/Button'
import { useVerifyCartStockMutation } from '../../store/api/cartApi'
import toast from 'react-hot-toast'

export default function CartSummary({ cart, onClose }) {
  const navigate = useNavigate()
  const [verifyStock, { isLoading: isVerifying }] = useVerifyCartStockMutation()

  const subtotal = cart?.subtotal || cart?.total || 0
  const discount = cart?.discount || 0
  const shipping = cart?.shipping || 0
  const total    = cart?.total    || 0

  const handleCheckout = async () => {
    try {
      const verification = await verifyStock().unwrap()
      if (verification?.success) {
        onClose?.()
        navigate('/checkout')
      } else {
        const errors = verification?.errors || []
        if (errors.length > 0) {
          errors.forEach((e) => toast.error(e))
        } else {
          toast.error('Some items in your cart are out of stock or have insufficient quantity.')
        }
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Could not verify stock')
    }
  }

  return (
    <div className="space-y-4">
      {/* Price breakdown */}
      <div className="space-y-2 py-3 border-t border-b border-border">
        <Row label="Subtotal" value={formatPrice(subtotal)} />
        {discount > 0 && (
          <Row label="Discount" value={`-${formatPrice(discount)}`} className="text-success" />
        )}
        <Row label="Shipping" value={shipping > 0 ? formatPrice(shipping) : 'Free'} />
      </div>

      {/* Total */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-text-primary">Total</span>
        <span
          className="text-lg font-bold text-accent"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          {formatPrice(total)}
        </span>
      </div>

      {/* CTA */}
      <Button
        variant="gold"
        size="lg"
        className="w-full"
        onClick={handleCheckout}
        loading={isVerifying}
      >
        Proceed to Checkout
      </Button>
    </div>
  )
}

function Row({ label, value, className }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-text-secondary">{label}</span>
      <span className={cn('text-xs font-medium text-text-primary font-[var(--font-mono)]', className)}>
        {value}
      </span>
    </div>
  )
}
