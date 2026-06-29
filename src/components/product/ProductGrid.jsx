import { motion } from 'framer-motion'
import ProductCard from './ProductCard'
import { ProductCardSkeleton } from '../ui/Skeleton'
import EmptyState from '../ui/EmptyState'
import { PackageOpen } from 'lucide-react'
import { cn } from '../../utils/cn'

export default function ProductGrid({
  products      = [],
  isLoading     = false,
  skeletonCount = 8,
  wishlistedIds = [],
  className,
}) {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4', className)}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (!products.length) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="No products found"
        message="Try adjusting your filters or search query."
        className={className}
      />
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden:  {},
        visible: { transition: { staggerChildren: 0.05 } },
      }}
      className={cn('grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4', className)}
    >
      {products.map((product) => (
        <ProductCard
          key={product._id}
          product={product}
          isWishlisted={wishlistedIds.includes(product._id)}
        />
      ))}
    </motion.div>
  )
}
