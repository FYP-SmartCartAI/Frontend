import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGetCategoryByIdQuery } from '../../store/api/categoryApi'
import { useGetProductsQuery }     from '../../store/api/productApi'
import ProductGrid    from '../../components/product/ProductGrid'
import ProductFilters from '../../components/product/ProductFilters'
import Pagination     from '../../components/ui/Pagination'
import Skeleton       from '../../components/ui/Skeleton'
import { useDebounce } from '../../hooks/useDebounce'

const DEFAULT_FILTERS = {
  sortBy: 'newest', minPrice: '', maxPrice: '', page: 1, limit: 12,
}

export default function CategoryPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const debounced = useDebounce(filters, 300)

  // Use URL slug as base category; filters.category overrides only for sort/price/page changes
  // (category chip clicks navigate to a new route instead)
  const { data: catData, isLoading: catLoading } = useGetCategoryByIdQuery(slug)
  const { data, isLoading: productsLoading }      = useGetProductsQuery({
    ...debounced,
    category: slug,           // always filter by the current page's category slug
  })

  const category   = catData?.category || catData
  const products   = data?.products || []
  const totalPages = data?.totalPages || data?.pages || 1

  // Clicking a category chip in the sidebar navigates to that category's page
  const handleCategoryNavigate = (slug) => {
    navigate(`/categories/${slug}`)
    setFilters(DEFAULT_FILTERS)
  }

  return (
    <div className="min-h-full p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        {catLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <h1
            className="text-2xl font-bold text-text-primary gold-underline"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {category?.name || 'Category'}
          </h1>
        )}
        {category?.description && (
          <p className="text-sm text-text-secondary mt-2">{category.description}</p>
        )}
      </motion.div>

      {/* Content */}
      <div className="flex gap-6">
        <ProductFilters
          filters={filters}
          onChange={setFilters}
          onClear={() => setFilters(DEFAULT_FILTERS)}
          activeCategorySlug={slug}
          onCategoryNavigate={handleCategoryNavigate}
        />
        <div className="flex-1 min-w-0">
          <ProductGrid
            products={products}
            isLoading={productsLoading}
            skeletonCount={12}
          />
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                page={filters.page}
                totalPages={totalPages}
                onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
