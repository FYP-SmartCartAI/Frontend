import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ShoppingCart, Heart, Minus, Plus, Star,
  Sparkles, ChevronLeft, AlertCircle, Send, Trash2, X, Edit2,
} from 'lucide-react'
import { useGetProductByIdQuery }     from '../../store/api/productApi'
import { useGetProductReviewsQuery, useCreateReviewMutation, useUpdateReviewMutation, useDeleteReviewMutation } from '../../store/api/reviewApi'
import { useGetSimilarProductsQuery } from '../../store/api/recommendationApi'
import { useLogBehaviorMutation }     from '../../store/api/behaviorApi'
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from '../../store/api/wishlistApi'
import { useCart } from '../../hooks/useCart'
import { useIsWishlisted } from '../../hooks/useWishlistIds'
import ProductImages  from '../../components/product/ProductImages'
import ProductRating  from '../../components/product/ProductRating'
import ProductGrid    from '../../components/product/ProductGrid'
import Button         from '../../components/ui/Button'
import Badge          from '../../components/ui/Badge'
import Skeleton       from '../../components/ui/Skeleton'
import { formatPrice }    from '../../utils/formatPrice'
import { formatRelativeTime } from '../../utils/formatDate'
import Avatar             from '../../components/ui/Avatar'
import toast              from 'react-hot-toast'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const { addToCart } = useCart()
  const [qty, setQty]         = useState(1)
  const [adding, setAdding]   = useState(false)
  const [wishlisted, setWishlisted]   = useState(false)
  const [reviewRating, setReviewRating]     = useState(0)
  const [hoverRating, setHoverRating]       = useState(0)
  const [reviewComment, setReviewComment]   = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [editingReviewId, setEditingReviewId]   = useState(null)
  const [logBehavior]         = useLogBehaviorMutation()
  const [addToWishlist]       = useAddToWishlistMutation()
  const [removeFromWishlist]  = useRemoveFromWishlistMutation()
  const wishBusy              = useRef(false)
  const [createReview]        = useCreateReviewMutation()
  const [updateReview]        = useUpdateReviewMutation()
  const [deleteReview]        = useDeleteReviewMutation()
  const currentUser           = useSelector((s) => s.auth?.user)

  const { data,       isLoading, isError } = useGetProductByIdQuery(slug)
  const product         = data?.product || data
  const inWishlist            = useIsWishlisted(product?._id)

  useEffect(() => {
    setWishlisted(inWishlist)
  }, [inWishlist])
  const { data: revs, isLoading: loadingRevs } = useGetProductReviewsQuery({ productId: product?._id }, { skip: !product?._id })
  const { data: similar } = useGetSimilarProductsQuery(product?._id, { skip: !product?._id })

  const reviews         = Array.isArray(revs) ? revs : (revs?.reviews || [])
  const similarProducts = similar?.products || similar || []

  // Log view behavior with time-on-page when the user leaves
  useEffect(() => {
    if (!product?._id) return
    const productId = product._id
    const startTime = Date.now()
    return () => {
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000))
      logBehavior({ action: 'view', productId, durationSeconds }).catch(() => {})
    }
  }, [product?._id, logBehavior])

  const handleAddToCart = async () => {
    try {
      setAdding(true)
      await addToCart({ productId: product._id, quantity: qty })
      toast.success('Added to cart')
    } catch (err) {
      toast.error(err?.data?.message || 'Could not add to cart')
    } finally {
      setAdding(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    if (!reviewRating) return toast.error('Please select a star rating')
    try {
      setSubmittingReview(true)
      if (editingReviewId) {
        await updateReview({ reviewId: editingReviewId, productId: product._id, rating: reviewRating, comment: reviewComment }).unwrap()
        toast.success('Review updated!')
        setEditingReviewId(null)
      } else {
        await createReview({ productId: product._id, rating: reviewRating, comment: reviewComment }).unwrap()
        toast.success('Review submitted!')
        logBehavior({ action: 'review', productId: product._id, rating: reviewRating }).catch(() => {})
      }
      setReviewRating(0)
      setReviewComment('')
    } catch (err) {
      toast.error(err?.data?.message || 'Could not submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  const handleStartEdit = (review) => {
    setEditingReviewId(review._id)
    setReviewRating(review.rating)
    setReviewComment(review.comment || '')
  }

  const handleCancelEdit = () => {
    setEditingReviewId(null)
    setReviewRating(0)
    setReviewComment('')
  }

  const handleDeleteReview = async (reviewId) => {
    try {
      await deleteReview({ reviewId, productId: product._id }).unwrap()
      toast.success('Review deleted')
      if (editingReviewId === reviewId) handleCancelEdit()
    } catch {
      toast.error('Could not delete review')
    }
  }

  const handleWishlist = async () => {
    if (wishBusy.current) return

    const next = !wishlisted
    setWishlisted(next)
    wishBusy.current = true

    try {
      if (next) {
        await addToWishlist(product._id).unwrap()
        toast.success('Added to wishlist')
        logBehavior({ action: 'wishlist', productId: product._id }).catch(() => {})
      } else {
        await removeFromWishlist(product._id).unwrap()
        toast.success('Removed from wishlist')
      }
    } catch (err) {
      if (err?.status === 409) {
        setWishlisted(true)
        return
      }
      setWishlisted(!next)
      toast.error(err?.data?.message || 'Could not update wishlist')
    } finally {
      wishBusy.current = false
    }
  }

  // Loading
  if (isLoading) {
    return (
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
        <Skeleton className="aspect-square rounded-[var(--radius-lg)]" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  // Error
  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle size={36} className="text-error" />
        <p className="text-text-secondary">Product not found.</p>
        <Link to="/">
          <Button variant="ghost" icon={<ChevronLeft size={15} />}>
            Back to Home
          </Button>
        </Link>
      </div>
    )
  }

  const finalPrice = product.discountPrice || product.price
  const discount   = product.price && product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : null

  return (
    <div className="min-h-full">
      {/* Back */}
      <div className="px-6 pt-5 pb-2">
        <Link to="/" className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-accent transition-colors">
          <ChevronLeft size={13} /> Back
        </Link>
      </div>

      <div className="px-6 pb-10 max-w-5xl">
        {/* Main grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10"
        >
          {/* Images */}
          <ProductImages images={product.images || []} productName={product.name} />

          {/* Details */}
          <div className="space-y-5">
            {/* Category + AI badge */}
            <div className="flex items-center gap-2 flex-wrap">
              {product.category?.name && (
                <Link
                  to={`/categories/${product.category.slug || product.category._id}`}
                  className="text-xs text-text-tertiary uppercase tracking-widest hover:text-accent transition-colors"
                >
                  {typeof product.category?.name === 'string' ? product.category.name : ''}
                </Link>
              )}
              {product.isAIRecommended && (
                <Badge variant="gold">
                  <Sparkles size={10} /> AI Pick
                </Badge>
              )}
            </div>

            {/* Brand */}
            {product.brand && (
              <p className="text-xs text-text-tertiary uppercase tracking-widest">
                {product.brand}
              </p>
            )}

            {/* Name */}
            <h1
              className="text-2xl lg:text-3xl font-bold text-text-primary leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            {product.rating > 0 && (
              <ProductRating
                rating={product.rating}
                reviewCount={product.reviewCount}
                size="md"
              />
            )}

            {/* Price */}
            <div className="flex items-end gap-3">
              <span
                className="text-3xl font-bold text-accent"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                {formatPrice(finalPrice)}
              </span>
              {discount && (
                <>
                  <span
                    className="text-base text-text-tertiary line-through"
                    style={{ fontFamily: 'var(--font-mono)' }}
                  >
                    {formatPrice(product.price)}
                  </span>
                  <Badge variant="error">-{discount}%</Badge>
                </>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-sm text-text-secondary leading-relaxed">
                {product.description}
              </p>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="muted">{tag}</Badge>
                ))}
              </div>
            )}

            {/* Stock */}
            <div>
              {product.stock > 0 ? (
                <span className="text-xs text-success flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                  In stock ({product.stock} available)
                </span>
              ) : (
                <span className="text-xs text-error flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-error inline-block" />
                  Out of stock
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-text-tertiary uppercase tracking-widest">Qty</span>
              <div className="flex items-center border border-border rounded-[var(--radius-md)] overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-accent hover:bg-bg-tertiary transition-all"
                  aria-label="Decrease"
                >
                  <Minus size={13} />
                </button>
                <span
                  className="w-10 h-9 flex items-center justify-center text-sm font-medium text-text-primary border-x border-border"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-text-secondary hover:text-accent hover:bg-bg-tertiary transition-all"
                  aria-label="Increase"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                variant="gold"
                size="lg"
                className="flex-1"
                icon={<ShoppingCart size={16} />}
                onClick={handleAddToCart}
                loading={adding}
                disabled={!product.stock}
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleWishlist}
                aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                className={wishlisted ? 'text-error border-error/40 hover:bg-error/10' : ''}
                icon={<Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />}
              />
            </div>
          </div>
        </motion.div>

        {/* Reviews */}
        <section className="mb-10">
          <h2
            className="text-lg font-semibold text-text-primary mb-5 gold-underline"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Customer Reviews
          </h2>

          {/* Write review form */}
          {currentUser && !reviews.some((r) => r.user?._id === (currentUser._id || currentUser.id)) && (
            <motion.form
              id="review-form"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmitReview}
              className="bg-bg-secondary border border-accent/20 rounded-[var(--radius-lg)] p-5 mb-6"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-text-primary">
                  Write a Review
                </p>
              </div>

              {/* Star picker */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, i) => {
                  const val = i + 1
                  return (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setReviewRating(val)}
                      onMouseEnter={() => setHoverRating(val)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110"
                      aria-label={`${val} star`}
                    >
                      <Star
                        size={24}
                        className={(hoverRating || reviewRating) >= val ? 'text-accent' : 'text-border'}
                        fill={(hoverRating || reviewRating) >= val ? 'currentColor' : 'none'}
                      />
                    </button>
                  )
                })}
                {reviewRating > 0 && (
                  <span className="text-xs text-text-tertiary ml-2">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
                  </span>
                )}
              </div>

              {/* Comment */}
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share your experience with this product..."
                rows={3}
                className="w-full bg-bg-tertiary border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-accent resize-none transition-colors mb-3"
              />

              <div className="flex gap-2">
                <Button
                  type="submit"
                  variant="gold"
                  size="sm"
                  icon={<Send size={13} />}
                  loading={submittingReview}
                  disabled={!reviewRating}
                >
                  Submit Review
                </Button>
              </div>
            </motion.form>
          )}

          {/* Reviews list */}
          {loadingRevs ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-4 space-y-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-sm text-text-tertiary">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => {
                const isOwner = currentUser && review.user?._id === (currentUser._id || currentUser.id)
                const isEditing = editingReviewId === review._id

                if (isEditing) {
                  return (
                    <motion.div
                      key={review._id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-bg-secondary border border-accent/30 rounded-[var(--radius-lg)] p-5"
                    >
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar name={review.user?.name} size="xs" />
                            <div>
                              <p className="text-sm font-medium text-text-primary">{review.user?.name} (Editing)</p>
                              <p className="text-[10px] text-text-tertiary">Editing your review</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="text-text-tertiary hover:text-accent transition-colors"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {/* Star picker */}
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const val = i + 1
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setReviewRating(val)}
                                onMouseEnter={() => setHoverRating(val)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="transition-transform hover:scale-110"
                                aria-label={`${val} star`}
                              >
                                <Star
                                  size={20}
                                  className={(hoverRating || reviewRating) >= val ? 'text-accent' : 'text-border'}
                                  fill={(hoverRating || reviewRating) >= val ? 'currentColor' : 'none'}
                                />
                              </button>
                            )
                          })}
                          {reviewRating > 0 && (
                            <span className="text-xs text-text-tertiary ml-2">
                              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
                            </span>
                          )}
                        </div>

                        {/* Comment */}
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience with this product..."
                          rows={3}
                          className="w-full bg-bg-tertiary border border-border rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-accent resize-none transition-colors"
                        />

                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            variant="gold"
                            size="sm"
                            icon={<Send size={13} />}
                            loading={submittingReview}
                            disabled={!reviewRating}
                          >
                            Update Review
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </motion.div>
                  )
                }

                return (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={isOwner ? () => handleStartEdit(review) : undefined}
                    className={`bg-bg-secondary border rounded-[var(--radius-lg)] p-4 transition-all group ${
                      isOwner
                        ? 'border-border hover:border-accent/40 cursor-pointer hover:shadow-[var(--shadow-gold)]'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar name={review.user?.name} size="xs" />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{review.user?.name}</p>
                        <p className="text-[10px] text-text-tertiary">{formatRelativeTime(review.createdAt)}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={11}
                              className={i < review.rating ? 'text-accent' : 'text-border'}
                              fill={i < review.rating ? 'currentColor' : 'none'}
                            />
                          ))}
                        </div>
                        {isOwner && (
                          <div className="ml-2 flex items-center gap-2">
                            <span className="text-[10px] text-accent/80 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline">
                              Click to edit
                            </span>
                            <Edit2 size={12} className="text-text-tertiary group-hover:text-accent transition-colors" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteReview(review._id)
                              }}
                              className="text-text-tertiary hover:text-error transition-colors"
                              aria-label="Delete review"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed">{review.comment}</p>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>

        {/* Similar products */}
        {similarProducts.length > 0 && (
          <section>
            <h2
              className="text-lg font-semibold text-text-primary mb-5 flex items-center gap-2 gold-underline"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <Sparkles size={16} className="text-accent" />
              Similar Products
            </h2>
            <ProductGrid products={similarProducts} skeletonCount={4} />
          </section>
        )}
      </div>
    </div>
  )
}
