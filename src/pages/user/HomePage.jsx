import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Sparkles, ArrowRight, TrendingUp, ChevronLeft, ChevronRight, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGetFeaturedProductsQuery } from '../../store/api/productApi'
import { useGetRecommendationsQuery }  from '../../store/api/recommendationApi'
import { useGetCategoriesQuery }       from '../../store/api/categoryApi'
import { useGetActiveFlashSaleQuery }  from '../../store/api/flashSaleApi'
import { useAuth } from '../../hooks/useAuth'
import ProductGrid   from '../../components/product/ProductGrid'
import ProductCard   from '../../components/product/ProductCard'
import HeroDashboard from '../../components/home/HeroDashboard'

// ── Countdown Hook ───────────────────────────────────────────────────────────
function useActiveCountdown(targetTime) {
  const getLeft = () => {
    if (!targetTime) return '00h : 00m : 00s'
    const now = new Date()
    const end = new Date(targetTime)
    const d = Math.max(0, Math.floor((end - now) / 1000))
    if (d === 0) return 'Ended'
    const h = String(Math.floor(d / 3600)).padStart(2, '0')
    const m = String(Math.floor((d % 3600) / 60)).padStart(2, '0')
    const s = String(d % 60).padStart(2, '0')
    return `${h}h : ${m}m : ${s}s`
  }
  const [t, setT] = useState(getLeft)
  useEffect(() => {
    setT(getLeft())
    const id = setInterval(() => setT(getLeft()), 1000)
    return () => clearInterval(id)
  }, [targetTime])
  return t
}

// ── Flash Sale Carousel Component ────────────────────────────────────────────
function FlashSaleCarousel({ sale }) {
  const scrollRef = useRef(null)
  const timerStr = useActiveCountdown(sale.endTime)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(true)

  const checkScrollPosition = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setShowLeftArrow(scrollLeft > 5)
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 5)
    }
  }

  useEffect(() => {
    const container = scrollRef.current
    if (container) {
      checkScrollPosition()
      container.addEventListener('scroll', checkScrollPosition)
      window.addEventListener('resize', checkScrollPosition)

      return () => {
        container.removeEventListener('scroll', checkScrollPosition)
        window.removeEventListener('resize', checkScrollPosition)
      }
    }
  }, [sale.products])

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  return (
    <section className="px-6 py-8 border-b border-border relative group">
      <div className="flex items-center justify-between mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/20 flex items-center justify-center animate-pulse">
              <Zap size={14} className="text-accent" />
            </div>
            <h2 className="text-lg font-bold text-text-primary uppercase tracking-wider animate-pulse" style={{ fontFamily: 'var(--font-display)' }}>
              {sale.title}
            </h2>
          </div>
          <span className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full border border-error/25 bg-error/5 text-error text-[10px] font-bold tracking-widest uppercase font-mono">
            Ends In: {timerStr}
          </span>
        </div>
      </div>

      <div className="relative flex items-center">
        {/* Left Arrow */}
        {sale.products?.length > 1 && showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 z-10 w-9 h-9 rounded-full bg-bg-secondary/90 border border-border flex items-center justify-center hover:border-accent text-text-secondary hover:text-accent transition-all shadow-[var(--shadow-gold)] cursor-pointer hover:scale-105 animate-fade-in"
            aria-label="Scroll left"
          >
            <ChevronLeft size={20} />
          </button>
        )}

        {/* Scroll Container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-none pb-2 w-full select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {sale.products.map((product) => (
            <div key={product._id} className="w-[200px] sm:w-[240px] shrink-0">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        {sale.products?.length > 1 && showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 z-10 w-9 h-9 rounded-full bg-bg-secondary/90 border border-border flex items-center justify-center hover:border-accent text-text-secondary hover:text-accent transition-all shadow-[var(--shadow-gold)] cursor-pointer hover:scale-105 animate-fade-in"
            aria-label="Scroll right"
          >
            <ChevronRight size={20} />
          </button>
        )}
      </div>
    </section>
  )
}

export default function HomePage() {
  const { user } = useAuth()
  const theme = useSelector((state) => state.ui.theme)
  const isLight = theme === 'light'

  const { data: featuredData, isLoading: loadingFeatured } =
    useGetFeaturedProductsQuery()
  const { data: recs, isLoading: loadingRecs } =
    useGetRecommendationsQuery()
  const { data: categories = [], isLoading: loadingCats } =
    useGetCategoriesQuery()
  const { data: flashResponse } = useGetActiveFlashSaleQuery()

  const featured       = featuredData?.products || []
  const recommendations = recs?.products || []
  const activeSale      = flashResponse?.active ? flashResponse.sale : null

  return (
    <div className="min-h-full">
      {/* ── Hero Banner ──────────────────────────────────── */}
      <HeroDashboard />

      {/* ── Active Flash Sale ────────────────────────────── */}
      {activeSale && activeSale.products?.length > 0 && (
        <FlashSaleCarousel sale={activeSale} />
      )}

      {/* ── Categories ───────────────────────────────────── */}
      <section className="px-6 py-8 border-b border-border">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Shop by Category
          </h2>
          <Link to="/search" className="text-xs text-accent hover:text-accent-light flex items-center gap-1 transition-colors">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {loadingCats ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-10 w-28 rounded-full bg-bg-tertiary skeleton-shimmer shrink-0" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Link
                key={cat._id}
                to={`/categories/${cat.slug}`}
                className="px-4 py-1.5 rounded-full border border-border text-sm text-text-secondary hover:border-accent hover:text-accent transition-all"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      {/* ── AI Recommendations ───────────────────────────── */}
      {user && (
        <section className="px-6 py-8 border-b border-border">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                Recommended for you
              </h2>
              <span className="flex items-center gap-1 text-[10px] text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                <Sparkles size={9} /> AI
              </span>
            </div>
          </div>
          <ProductGrid
            products={recommendations}
            isLoading={loadingRecs}
            skeletonCount={4}
          />
        </section>
      )}

      {/* ── Featured Products ─────────────────────────────── */}
      <section className="px-6 py-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-accent" />
            <h2 className="text-lg font-semibold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              Featured Products
            </h2>
          </div>
          <Link to="/search" className="text-xs text-accent hover:text-accent-light flex items-center gap-1 transition-colors">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        <ProductGrid
          products={featured}
          isLoading={loadingFeatured}
          skeletonCount={8}
        />
      </section>
    </div>
  )
}
