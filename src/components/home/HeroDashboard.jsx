import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, ArrowRight, Star,
  ShieldCheck, Truck, RotateCcw, Zap,
  Package, Users, TrendingUp,
} from 'lucide-react'

const STATS = [
  { icon: Package,    value: '12,000+', label: 'Products' },
  { icon: Users,      value: '50,000+', label: 'Customers' },
  { icon: TrendingUp, value: '4.5 ★',   label: 'Avg Rating' },
]

const CAT_CHIPS = [
  '🎧 Audio',
  '📱 Smartphones',
  '💻 Laptops',
  '⌨️  Keyboards',
  '👟 Footwear',
  '🏠 Smart Home',
]

const DEAL_CARDS = [
  {
    emoji: '🎧',
    name: 'ANC Pro Headphones',
    price: 'PKR 18,500',
    original: 'PKR 24,000',
    off: '23% OFF',
    rating: 4.9,
    badge: 'Best Seller',
    badgeClass: 'text-accent bg-accent/10 border-accent/30',
  },
  {
    emoji: '⌨️',
    name: 'Keychron Q3 Keyboard',
    price: 'PKR 32,000',
    original: 'PKR 38,500',
    off: '17% OFF',
    rating: 4.8,
    badge: 'Top Rated',
    badgeClass: 'text-warning bg-warning/10 border-warning/30',
  },
  {
    emoji: '📱',
    name: 'Galaxy S24 Ultra',
    price: 'PKR 3,49,000',
    original: 'PKR 3,99,000',
    off: '13% OFF',
    rating: 4.9,
    badge: 'New Arrival',
    badgeClass: 'text-success bg-success/10 border-success/30',
  },
]

const TRUST = [
  { icon: Truck,        label: 'Free Delivery',   sub: 'Orders over PKR 2,000' },
  { icon: RotateCcw,   label: 'Easy Returns',     sub: '15-day hassle-free' },
  { icon: ShieldCheck, label: 'Secure Checkout',  sub: 'Stripe & COD' },
]

function useCountdown(targetH, targetM) {
  const getLeft = () => {
    const now = new Date()
    const end = new Date()
    end.setHours(targetH, targetM, 0, 0)
    if (end <= now) end.setDate(end.getDate() + 1)
    const d = Math.floor((end - now) / 1000)
    return { h: Math.floor(d / 3600), m: Math.floor((d % 3600) / 60), s: d % 60 }
  }
  const [t, setT] = useState(getLeft)
  useEffect(() => {
    const id = setInterval(() => setT(getLeft()), 1000)
    return () => clearInterval(id)
  }, [])
  return t
}

function Pad({ v }) {
  return (
    <span className="font-mono text-sm font-extrabold text-accent tabular-nums">
      {String(v).padStart(2, '0')}
    </span>
  )
}

function StarRow({ rating }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <Star key={s} size={8}
          className={s <= Math.round(rating) ? 'text-accent fill-accent' : 'text-border-accent'} />
      ))}
    </span>
  )
}

export default function HeroDashboard() {
  const theme   = useSelector(s => s.ui.theme)
  const isLight = theme === 'light'

  const navigate = useNavigate()
  const cd = useCountdown(23, 59)

  const [active, setActive] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setActive(p => (p + 1) % DEAL_CARDS.length), 3000)
    return () => clearInterval(id)
  }, [])

  const gridColor = isLight ? '#D4C4A8' : '#C8965A'

  const go = (q) => navigate(`/search?q=${encodeURIComponent(q)}&r=${Date.now()}`)

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="px-6 py-4 border-b border-border"
    >
      <div className="relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-border bg-bg-secondary shadow-[var(--shadow-card)]">

        {/* Ambient glows */}
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-screen">
          <div className="absolute -top-1/4 -left-1/4 w-1/2 h-full rounded-full bg-accent/25 blur-[100px]" />
          <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-full rounded-full bg-accent/10 blur-[100px]" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right,${gridColor} 1px,transparent 1px),
                              linear-gradient(to bottom,${gridColor} 1px,transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-5 sm:p-7 items-center">

          {/* ── LEFT ──────────────────────────────────────────── */}
          <div className="lg:col-span-6 flex flex-col gap-4">

            {/* Badge */}
            <div className="inline-flex w-fit items-center gap-1.5 px-3 py-1 rounded-full border border-accent/25 bg-accent/5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
              </span>
              <span className="text-[10px] font-semibold tracking-widest text-accent uppercase font-mono flex items-center gap-1">
                <Sparkles size={9} className="animate-pulse" /> AI-Powered Shopping
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-2">
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-primary leading-[1.18] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Your Premium{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-light to-accent">
                  AI Shopping
                </span>{' '}
                Destination.
              </h1>
              <p className="text-sm text-text-secondary max-w-sm leading-relaxed">
                Thousands of top products discovered by AI, delivered to your door.
              </p>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-5">
              {STATS.map(({ icon: Icon, value, label }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                    <Icon size={13} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-text-primary leading-none" style={{ fontFamily: 'var(--font-mono)' }}>{value}</p>
                    <p className="text-[9px] text-text-tertiary mt-0.5 uppercase tracking-wide">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/search')}
                className="flex items-center gap-2 bg-accent hover:bg-accent-light text-bg-primary text-sm font-bold px-5 py-2.5 rounded-full transition-colors shadow-[var(--shadow-gold)]"
              >
                Shop Now <ArrowRight size={14} />
              </button>
              <button
                onClick={() => navigate('/search')}
                className="flex items-center gap-2 border border-border hover:border-accent text-text-secondary hover:text-accent text-sm font-semibold px-5 py-2.5 rounded-full transition-all bg-bg-tertiary/40"
              >
                Browse All
              </button>
            </div>

            {/* Category chips */}
            <div className="flex flex-wrap gap-1.5">
              {CAT_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => go(chip.replace(/^\S+\s/, ''))}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-bg-tertiary/50 text-text-secondary hover:border-accent hover:text-accent hover:bg-accent/5 transition-all"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Trust row */}
            <div className="flex flex-wrap gap-4 pt-1 border-t border-border">
              {TRUST.map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-[var(--radius-sm)] bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                    <Icon size={11} className="text-accent" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-text-primary leading-none">{label}</p>
                    <p className="text-[9px] text-text-tertiary mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT ─────────────────────────────────────────── */}
          <div className="lg:col-span-6 flex flex-col gap-3">

            {/* Flash Sale Banner */}
            <div className="flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] bg-gradient-to-r from-accent/15 via-accent/5 to-transparent border border-accent/25">
              <div className="flex items-center gap-1.5">
                <Zap size={12} className="text-accent animate-pulse shrink-0" />
                <span className="text-xs font-bold text-text-primary">Flash Sale</span>
                <span className="text-[10px] text-text-tertiary hidden sm:block">— limited time deals</span>
              </div>
              <div className="flex items-center gap-1 text-[11px]">
                <Pad v={cd.h} /><span className="text-text-tertiary text-xs">h</span>
                <span className="text-text-tertiary mx-0.5">:</span>
                <Pad v={cd.m} /><span className="text-text-tertiary text-xs">m</span>
                <span className="text-text-tertiary mx-0.5">:</span>
                <Pad v={cd.s} /><span className="text-text-tertiary text-xs">s</span>
              </div>
            </div>

            {/* 3 deal cards in a row */}
            <div className="grid grid-cols-3 gap-2">
              {DEAL_CARDS.map((card, i) => (
                <motion.button
                  key={i}
                  onClick={() => setActive(i)}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.18 }}
                  className={`relative text-left p-3 rounded-[var(--radius-md)] border transition-all duration-300 flex flex-col gap-1.5 ${
                    active === i
                      ? 'border-accent/50 bg-bg-tertiary shadow-[var(--shadow-gold)]'
                      : 'border-border bg-bg-tertiary/40 hover:border-border-accent'
                  }`}
                >
                  {/* Off badge */}
                  <span className="absolute top-2 right-2 text-[8px] font-bold text-error bg-error/10 border border-error/25 px-1.5 py-0.5 rounded-full">
                    {card.off}
                  </span>

                  {/* Emoji */}
                  <span className="text-2xl leading-none">{card.emoji}</span>

                  {/* Name */}
                  <p className="text-[10px] font-semibold text-text-primary leading-tight line-clamp-2 pr-4">
                    {card.name}
                  </p>

                  {/* Rating */}
                  <StarRow rating={card.rating} />

                  {/* Price */}
                  <div className="mt-auto">
                    <p className="text-[9px] text-text-tertiary line-through leading-none">{card.original}</p>
                    <p className="text-xs font-extrabold text-accent">{card.price}</p>
                  </div>

                  {/* Badge */}
                  <span className={`text-[7px] font-bold px-1.5 py-0.5 rounded-full border uppercase tracking-wide w-fit ${card.badgeClass}`}>
                    {card.badge}
                  </span>
                </motion.button>
              ))}
            </div>

            {/* Active product detail strip */}
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-md)] border border-accent/25 bg-accent/5"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{DEAL_CARDS[active].emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-text-primary">{DEAL_CARDS[active].name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRow rating={DEAL_CARDS[active].rating} />
                      <span className="text-[9px] text-text-tertiary">{DEAL_CARDS[active].rating} / 5</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[9px] text-text-tertiary line-through">{DEAL_CARDS[active].original}</p>
                    <p className="text-sm font-extrabold text-accent">{DEAL_CARDS[active].price}</p>
                  </div>
                  <button
                    onClick={() => go(DEAL_CARDS[active].name)}
                    className="flex items-center gap-1 bg-accent text-bg-primary text-[10px] font-bold px-3 py-1.5 rounded-full hover:bg-accent-light transition-colors shrink-0"
                  >
                    Shop <ArrowRight size={9} />
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </motion.section>
  )
}
