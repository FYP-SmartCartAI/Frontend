import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCart } from '../../hooks/useCart'
import CartItem    from '../../components/cart/CartItem'
import CartSummary from '../../components/cart/CartSummary'
import Spinner     from '../../components/ui/Spinner'
import Button      from '../../components/ui/Button'
import { useGetRecommendationsQuery } from '../../store/api/recommendationApi'
import ProductGrid from '../../components/product/ProductGrid'

export default function CartPage() {
  const { cart, isLoading, isError } = useCart()
  const { data: recs } = useGetRecommendationsQuery()

  const items = cart?.items || []

  return (
    <div className="min-h-full p-6 max-w-5xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <ShoppingCart size={20} className="text-accent" />
        Shopping Cart
        {items.length > 0 && (
          <span className="text-sm font-normal text-text-tertiary">
            ({items.length} {items.length === 1 ? 'item' : 'items'})
          </span>
        )}
      </motion.h1>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      )}

      {/* Error */}
      {isError && (
        <div className="text-center py-20">
          <p className="text-error text-sm">Could not load cart.</p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && items.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-bg-tertiary border border-border flex items-center justify-center">
            <ShoppingCart size={26} className="text-text-tertiary" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-semibold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Your cart is empty
          </h2>
          <p className="text-sm text-text-secondary max-w-xs">
            Looks like you haven't added anything yet. Start exploring our collection.
          </p>
          <Link to="/">
            <Button variant="gold" size="md">Continue Shopping</Button>
          </Link>
        </div>
      )}

      {/* Cart with items */}
      {!isLoading && !isError && items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Items */}
          <div className="lg:col-span-2">
            <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-4">
              <AnimatePresence initial={false}>
                {items.map((item) => (
                  <CartItem key={item.product?._id || item._id} item={item} />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-4 sticky top-20">
              <h3 className="text-sm font-semibold text-text-primary mb-3">
                Order Summary
              </h3>
              <CartSummary cart={cart} />
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recs?.products?.length > 0 && (
        <section className="mt-12">
          <h2 className="text-base font-semibold text-text-primary mb-4 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
            <Sparkles size={15} className="text-accent" />
            You might also like
          </h2>
          <ProductGrid products={recs.products.slice(0, 4)} />
        </section>
      )}
    </div>
  )
}
