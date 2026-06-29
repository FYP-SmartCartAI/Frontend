import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingCart, PackageOpen } from 'lucide-react'
import Drawer from '../ui/Drawer'
import CartItem from './CartItem'
import CartSummary from './CartSummary'
import Spinner from '../ui/Spinner'
import { useCart } from '../../hooks/useCart'
import { useAuth } from '../../hooks/useAuth'
import Button from '../ui/Button'
import { useNavigate } from 'react-router-dom'

export default function CartDrawer() {
  const { isOpen, closeCart, cart, isLoading, isError } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const items = cart?.items || []

  return (
    <Drawer
      isOpen={isOpen}
      onClose={closeCart}
      title={
        <span className="flex items-center gap-2">
          <ShoppingCart size={16} className="text-accent" />
          Cart
          {items.length > 0 && (
            <span className="text-xs bg-accent text-bg-primary px-1.5 py-0.5 rounded-full font-semibold ml-1">
              {items.length}
            </span>
          )}
        </span>
      }
      footer={
        !isLoading && items.length > 0 ? (
          <CartSummary cart={cart} onClose={closeCart} />
        ) : null
      }
      width="w-[400px]"
    >
      {/* Loading */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-text-secondary">Loading cart…</p>
        </div>
      )}

      {/* Not logged in */}
      {!isAuthenticated && !isLoading && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
            <ShoppingCart size={24} className="text-accent" strokeWidth={1.5} />
          </div>
          <p className="text-sm text-text-secondary">Sign in to view your cart</p>
          <Button
            variant="gold"
            size="sm"
            onClick={() => { closeCart(); navigate('/login') }}
          >
            Sign In
          </Button>
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="text-center py-12">
          <p className="text-sm text-error">Could not load cart. Please try again.</p>
        </div>
      )}

      {/* Empty */}
      {isAuthenticated && !isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="w-14 h-14 rounded-full bg-bg-tertiary border border-border flex items-center justify-center">
            <PackageOpen size={24} className="text-text-tertiary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-medium text-text-primary">Your cart is empty</p>
            <p className="text-xs text-text-tertiary mt-1">Start shopping to add items</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { closeCart(); navigate('/') }}
          >
            Browse Products
          </Button>
        </div>
      )}

      {/* Items */}
      {isAuthenticated && !isLoading && items.length > 0 && (
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <CartItem key={item.product?._id || item._id} item={item} />
          ))}
        </AnimatePresence>
      )}
    </Drawer>
  )
}
