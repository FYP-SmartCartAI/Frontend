import { useSelector } from 'react-redux'
import { Sparkles, ArrowRight, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useGetFeaturedProductsQuery } from '../../store/api/productApi'
import { useGetRecommendationsQuery }  from '../../store/api/recommendationApi'
import { useGetCategoriesQuery }       from '../../store/api/categoryApi'
import { useAuth } from '../../hooks/useAuth'
import ProductGrid   from '../../components/product/ProductGrid'
import HeroDashboard from '../../components/home/HeroDashboard'

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

  const featured       = featuredData?.products || []
  const recommendations = recs?.products || []

  return (
    <div className="min-h-full">
      {/* ── Hero Banner ──────────────────────────────────── */}
      <HeroDashboard />

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
