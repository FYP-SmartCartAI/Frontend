import { motion } from 'framer-motion'
import { Heart, Trash2 } from 'lucide-react'
import { useGetWishlistQuery, useClearWishlistMutation } from '../../store/api/wishlistApi'
import ProductGrid from '../../components/product/ProductGrid'
import EmptyState  from '../../components/ui/EmptyState'
import Spinner     from '../../components/ui/Spinner'
import Button      from '../../components/ui/Button'
import toast       from 'react-hot-toast'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useState } from 'react'

export default function WishlistPage() {
  const { data, isLoading, isError }    = useGetWishlistQuery()
  const [clearWishlist, { isLoading: clearing }] = useClearWishlistMutation()
  const [confirmClear, setConfirmClear] = useState(false)

  const items    = data?.wishlist?.products || data?.products || data?.items || []
  const products = items.map((i) => i.product || i)

  const handleClear = async () => {
    try {
      await clearWishlist().unwrap()
      toast.success('Wishlist cleared')
      setConfirmClear(false)
    } catch {
      toast.error('Could not clear wishlist')
    }
  }

  return (
    <div className="min-h-full p-6 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h1
          className="text-2xl font-bold text-text-primary flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <Heart size={20} className="text-accent" />
          Wishlist
          {products.length > 0 && (
            <span className="text-sm font-normal text-text-tertiary">
              ({products.length})
            </span>
          )}
        </h1>

        {products.length > 0 && (
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 size={13} />}
            onClick={() => setConfirmClear(true)}
          >
            Clear all
          </Button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : isError ? (
        <div className="text-center py-16 text-error text-sm">Could not load wishlist.</div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          message="Save items you love by tapping the heart icon on any product."
        />
      ) : (
        <ProductGrid
          products={products}
          wishlistedIds={products.map((p) => p._id)}
        />
      )}

      <ConfirmDialog
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={handleClear}
        loading={clearing}
        title="Clear wishlist?"
        message="This will remove all items from your wishlist."
        confirmLabel="Clear All"
      />
    </div>
  )
}
