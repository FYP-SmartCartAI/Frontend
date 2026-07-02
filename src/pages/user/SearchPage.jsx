import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Loader2 } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { setQuery, addRecentSearch } from '../../store/slices/searchSlice'
import { useGetProductsQuery }     from '../../store/api/productApi'
import { useAiSearchProductsQuery } from '../../store/api/productApi'
import { useLogBehaviorMutation }  from '../../store/api/behaviorApi'
import AISearchBar    from '../../components/product/AISearchBar'
import ProductGrid    from '../../components/product/ProductGrid'
import ProductFilters from '../../components/product/ProductFilters'
import Pagination     from '../../components/ui/Pagination'
import { useDebounce } from '../../hooks/useDebounce'

const DEFAULT_FILTERS = {
  category: '', sortBy: 'newest',
  minPrice: '', maxPrice: '', page: 1, limit: 12,
}

export default function SearchPage() {
  const [searchParams]    = useSearchParams()
  const dispatch          = useDispatch()
  const urlQuery          = searchParams.get('q') || ''
  const refreshKey        = searchParams.get('r') || ''
  const isAuthenticated   = useSelector((s) => s.auth?.user)
  const [logBehavior]     = useLogBehaviorMutation()

  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })
  const debouncedFilters      = useDebounce(filters, 300)

  // If there's a URL query, it's an AI search (ignore bogus object stringification)
  const isAiMode = !!urlQuery && urlQuery !== '[object Object]'

  useEffect(() => {
    if (urlQuery) {
      dispatch(setQuery(urlQuery))
      dispatch(addRecentSearch(urlQuery))
    }
  }, [urlQuery, dispatch])

  // Log search behavior for the recommendation engine (logged-in users only)
  useEffect(() => {
    if (!urlQuery || !isAuthenticated) return
    logBehavior({ action: 'search', query: urlQuery }).catch(() => {})
  }, [urlQuery, isAuthenticated, logBehavior])

  const { data: aiData, isLoading: aiLoading, isFetching: aiFetching } =
    useAiSearchProductsQuery(
      { q: urlQuery, r: refreshKey },
      { skip: !isAiMode, refetchOnMountOrArgChange: true },
    )

  const { data: browseData, isLoading: browseLoading, isFetching: browseFetching } =
    useGetProductsQuery(
      {
        ...debouncedFilters,
        search: !isAiMode ? '' : undefined,
      },
      { skip: isAiMode }
    )

  const products    = isAiMode ? (aiData?.products || []) : (browseData?.products || [])
  const totalPages  = browseData?.totalPages || 1
  const isLoading   = isAiMode ? (aiLoading || aiFetching) : (browseLoading || browseFetching)

  const handleClear = () => setFilters({ ...DEFAULT_FILTERS })

  return (
    <div className="min-h-full p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="max-w-xl mb-4">
          <AISearchBar />
        </div>

        {urlQuery && (
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-accent" />
            <p className="text-sm text-text-secondary">
              AI results for{' '}
              <span className="text-text-primary font-medium">"{urlQuery}"</span>
              {isLoading && <Loader2 size={13} className="inline ml-2 animate-spin text-accent" />}
            </p>
            {aiData?.count != null && (
              <span className="text-xs text-text-tertiary ml-1">
              </span>
            )}
          </div>
        )}



        {!urlQuery && (
          <h1 className="text-xl font-semibold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Browse All Products
          </h1>
        )}
      </motion.div>

      {/* Content */}
      <div className="flex gap-6">
        {!isAiMode && (
          <ProductFilters
            filters={filters}
            onChange={setFilters}
            onClear={handleClear}
          />
        )}

        <div className="flex-1 min-w-0">
          <ProductGrid
            products={products}
            isLoading={isLoading}
            skeletonCount={12}
          />

          {!isAiMode && totalPages > 1 && (
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
