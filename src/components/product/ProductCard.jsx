import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, ShoppingCart, Star, Sparkles } from 'lucide-react'
import { cn } from '../../utils/cn'
import { formatPrice, formatDiscount } from '../../utils/formatPrice'
import { useCart } from '../../hooks/useCart'
import { useIsWishlisted } from '../../hooks/useWishlistIds'
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from '../../store/api/wishlistApi'
import toast from 'react-hot-toast'
import ProductImage from './ProductImage'

export default function ProductCard({ product, isWishlisted = false, onWishlistToggle }) {
  const {
    _id, name, price, discountPrice, images, rating,
    reviewCount, category, isAIRecommended, stock, slug, brand,
  } = product || {}

  const { addToCart, isWorking } = useCart()
  const inWishlist               = useIsWishlisted(_id)
  const [addToWishlist]          = useAddToWishlistMutation()
  const [removeFromWishlist]     = useRemoveFromWishlistMutation()
  const [localWish, setLocalWish]= useState(isWishlisted || inWishlist)
  const [adding, setAdding]      = useState(false)
  const wishBusy                 = useRef(false)

  useEffect(() => {
    setLocalWish(inWishlist || isWishlisted)
  }, [inWishlist, isWishlisted])

  const discount  = formatDiscount(price, discountPrice)
  const finalPrice = discountPrice || price
  const image      = images?.[0] || null

  const handleAddToCart = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      setAdding(true)
      await addToCart({ productId: _id, quantity: 1 })
      toast.success('Added to cart')
    } catch (err) {
      toast.error(err?.data?.message || 'Could not add to cart')
    } finally {
      setAdding(false)
    }
  }

  const handleWishlist = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (wishBusy.current) return

    const next = !localWish
    setLocalWish(next)
    wishBusy.current = true

    try {
      if (next) {
        await addToWishlist(_id).unwrap()
        toast.success('Added to wishlist')
      } else {
        await removeFromWishlist(_id).unwrap()
        toast.success('Removed from wishlist')
      }
      onWishlistToggle?.(_id, next)
    } catch (err) {
      if (err?.status === 409) {
        setLocalWish(true)
        return
      }
      setLocalWish(!next)
      toast.error('Could not update wishlist')
    } finally {
      wishBusy.current = false
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className="group relative"
    >
      <Link to={`/products/${slug}`} className="block">
        <div
          className={cn(
            'bg-bg-secondary border border-border rounded-[var(--radius-lg)] overflow-hidden',
            'transition-all duration-200',
            'hover:border-accent/40 hover:shadow-[var(--shadow-gold)]',
          )}
        >
          {/* Image */}
          <div className="relative aspect-square bg-bg-tertiary overflow-hidden">
            <ProductImage
              productName={name}
              backendImages={images}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />

            {/* Overlays */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
              {discount && (
                <span className="text-[10px] font-semibold bg-error text-white px-2 py-0.5 rounded-full">
                  -{discount}%
                </span>
              )}
              {isAIRecommended && (
                <span className="text-[10px] font-semibold bg-accent text-bg-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={9} /> AI Pick
                </span>
              )}
              {stock === 0 && (
                <span className="text-[10px] font-semibold bg-bg-primary/80 text-text-secondary px-2 py-0.5 rounded-full">
                  Out of stock
                </span>
              )}
            </div>

            {/* Wishlist */}
            <button
              onClick={handleWishlist}
              className={cn(
                'absolute top-2.5 right-2.5 w-8 h-8 rounded-full',
                'flex items-center justify-center',
                'bg-bg-primary/80 backdrop-blur-sm',
                'transition-all duration-200',
                localWish
                  ? 'text-error'
                  : 'text-text-tertiary hover:text-error opacity-0 group-hover:opacity-100',
              )}
              aria-label={localWish ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={14} fill={localWish ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Info — every row is explicitly sized so all cards stay uniform */}
          <div className="p-3.5 flex flex-col">
            {/* Category — 1 line, fixed */}
            <p className="text-[10px] text-text-tertiary uppercase tracking-widest truncate h-4 leading-4">
              {typeof category?.name === 'string' ? category.name : ''}
            </p>

            {/* Name — always exactly 2 lines */}
            <h3 className="text-sm font-medium text-text-primary line-clamp-2 leading-snug mt-0.5 h-10">
              {name}
            </h3>

            {brand && (
              <p className="text-[10px] text-text-tertiary truncate mt-0.5">{brand}</p>
            )}

            {/* Rating — fixed 1-line row, empty space when no rating */}
            <div className="flex items-center gap-1 mt-1.5 h-4">
              {rating > 0 && (
                <>
                  <Star size={11} className="text-accent shrink-0" fill="currentColor" />
                  <span className="text-xs text-text-secondary font-[var(--font-mono)]">
                    {rating?.toFixed(1)}
                  </span>
                  {reviewCount > 0 && (
                    <span className="text-[10px] text-text-tertiary">({reviewCount})</span>
                  )}
                </>
              )}
            </div>

            {/* Price + cart button */}
            <div className="flex items-end justify-between gap-2 mt-2">
              <div className="min-w-0">
                <p
                  className="text-base font-semibold text-accent leading-tight"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {formatPrice(finalPrice)}
                </p>
                {/* Always reserve 1 line for strikethrough to avoid height jump */}
                <p className="h-4 leading-4 text-xs" style={{ fontFamily: 'var(--font-mono)' }}>
                  {discount && (
                    <span className="text-text-tertiary line-through">{formatPrice(price)}</span>
                  )}
                </p>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={adding || stock === 0}
                className={cn(
                  'w-8 h-8 shrink-0 rounded-[var(--radius-sm)] flex items-center justify-center',
                  'bg-accent/10 text-accent border border-accent/20',
                  'hover:bg-accent hover:text-bg-primary hover:border-accent',
                  'transition-all duration-200',
                  'disabled:opacity-40 disabled:cursor-not-allowed',
                )}
                aria-label="Add to cart"
              >
                {adding ? (
                  <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShoppingCart size={13} />
                )}
              </button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
