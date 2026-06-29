import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import { cn } from '../../utils/cn'
import { useGetCategoriesQuery } from '../../store/api/categoryApi'
import Button from '../ui/Button'

// values match exactly what the backend's sortBy param accepts
const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest first'      },
  { value: 'price_asc',  label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'rating',     label: 'Top Rated'         },
]

const PRICE_SORTS = new Set(['price_asc', 'price_desc'])

export default function ProductFilters({ filters, onChange, onClear, activeCategorySlug, onCategoryNavigate }) {
  const [showMobile, setShowMobile]         = useState(false)
  const [priceHint, setPriceHint]           = useState(false)
  const priceRef                            = useRef(null)
  const { data: categories = [] }           = useGetCategoriesQuery()

  const set = (key, val) => onChange({ ...filters, [key]: val, page: 1 })

  const handleSortClick = (value) => {
    set('sortBy', value)
    // When a price-based sort is selected and no range is set, highlight the price inputs
    if (PRICE_SORTS.has(value) && !filters.minPrice && !filters.maxPrice) {
      setPriceHint(true)
      setTimeout(() => {
        priceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        priceRef.current?.querySelector('input')?.focus()
      }, 50)
      setTimeout(() => setPriceHint(false), 3000)
    }
  }

  const handlePrice = (key, raw) => {
    const val = raw === '' ? '' : Math.max(0, Number(raw))
    set(key, val === 0 && raw !== '0' ? '' : val)
  }

  const activeCount = [
    filters.category,
    filters.sortBy && filters.sortBy !== 'newest',
    filters.minPrice,
    filters.maxPrice,
  ].filter(Boolean).length

  const FilterBody = () => (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <p className="text-[10px] text-text-tertiary uppercase tracking-widest mb-2">Category</p>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              if (onCategoryNavigate) {
                // "All" on a category page — no meaningful action (already showing one category)
                // but if they want to go to a general browse, we clear
                onCategoryNavigate && onChange({ ...filters, page: 1 })
              } else {
                set('category', '')
              }
            }}
            className={cn(
              'px-3 py-1 text-xs rounded-full border transition-all',
              !activeCategorySlug && !filters.category
                ? 'bg-accent text-bg-primary border-accent'
                : 'border-border text-text-secondary hover:border-accent hover:text-accent',
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => {
                if (onCategoryNavigate) {
                  onCategoryNavigate(cat.slug)
                } else {
                  set('category', cat.slug)
                }
              }}
              className={cn(
                'px-3 py-1 text-xs rounded-full border transition-all',
                (activeCategorySlug
                  ? activeCategorySlug === cat.slug
                  : filters.category === cat.slug || filters.category === cat._id)
                  ? 'bg-accent text-bg-primary border-accent'
                  : 'border-border text-text-secondary hover:border-accent hover:text-accent',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="text-[10px] text-text-tertiary uppercase tracking-widest mb-2">Sort By</p>
        <div className="grid grid-cols-2 gap-1.5">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSortClick(opt.value)}
              className={cn(
                'px-3 py-1.5 text-xs rounded-[var(--radius-sm)] border transition-all text-left',
                filters.sortBy === opt.value
                  ? 'bg-accent/10 text-accent border-accent/30'
                  : 'border-border text-text-secondary hover:border-border-accent',
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div ref={priceRef}>
        <p className="text-[10px] text-text-tertiary uppercase tracking-widest mb-2">Price Range</p>
        {priceHint && (
          <p className="text-[10px] text-accent mb-1.5 animate-pulse">
            Enter a price range to refine results
          </p>
        )}
        <div className={cn(
          'flex items-center gap-2 rounded-[var(--radius-sm)] transition-all duration-300',
          priceHint && 'ring-1 ring-accent/50 p-1',
        )}>
          <input
            type="number"
            placeholder="Min"
            min={0}
            value={filters.minPrice ?? ''}
            onChange={(e) => handlePrice('minPrice', e.target.value)}
            className="w-full bg-bg-tertiary border border-border rounded-[var(--radius-sm)] px-3 py-1.5 text-xs text-text-primary placeholder-text-tertiary outline-none focus:border-accent"
          />
          <span className="text-text-tertiary text-xs shrink-0">to</span>
          <input
            type="number"
            placeholder="Max"
            min={0}
            value={filters.maxPrice ?? ''}
            onChange={(e) => handlePrice('maxPrice', e.target.value)}
            className="w-full bg-bg-tertiary border border-border rounded-[var(--radius-sm)] px-3 py-1.5 text-xs text-text-primary placeholder-text-tertiary outline-none focus:border-accent"
          />
        </div>
      </div>

      {/* Clear */}
      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="w-full" onClick={onClear}>
          Clear filters
        </Button>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 shrink-0">
        <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-text-primary">Filters</span>
            {activeCount > 0 && (
              <span className="text-[10px] bg-accent text-bg-primary px-1.5 py-0.5 rounded-full font-semibold">
                {activeCount}
              </span>
            )}
          </div>
          <FilterBody />
        </div>
      </aside>

      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <Button
          variant="outline"
          size="sm"
          icon={<SlidersHorizontal size={14} />}
          onClick={() => setShowMobile(true)}
        >
          Filters {activeCount > 0 && `(${activeCount})`}
        </Button>
      </div>

      {/* Mobile sheet */}
      <AnimatePresence>
        {showMobile && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setShowMobile(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
              className="absolute bottom-0 left-0 right-0 bg-bg-secondary border-t border-border rounded-t-[var(--radius-lg)] p-5 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-text-primary">Filters</span>
                <button
                  onClick={() => setShowMobile(false)}
                  className="text-text-tertiary hover:text-accent"
                >
                  <X size={18} />
                </button>
              </div>
              <FilterBody />
              <Button
                variant="gold"
                className="w-full mt-4"
                onClick={() => setShowMobile(false)}
              >
                Apply Filters
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
