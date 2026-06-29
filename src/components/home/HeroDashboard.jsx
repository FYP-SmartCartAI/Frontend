import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, ArrowRight, Check, CheckCircle2,
  ShieldCheck, ShoppingBag, CreditCard, ChevronRight,
  Terminal, Loader2, Cpu, Zap, Search
} from 'lucide-react'
import AISearchBar from '../product/AISearchBar'
import { setQuery, addRecentSearch } from '../../store/slices/searchSlice'

const PROMPTS = [
  "Premium noise-canceling headphones for travel under 200000 PKR",
  "Minimalist matte-black electric kettle",
  "Comfortable ergonomic chair for office"
]

const SIMULATOR_TABS = [
  { title: "Search Agent" },
  { title: "Smart Curator" },
  { title: "Auto-Checkout" }
]

function TypingText({ text, active, onComplete }) {
  const [displayedText, setDisplayedText] = useState('')

  useEffect(() => {
    if (!active) {
      setDisplayedText('')
      return
    }

    let index = 0
    setDisplayedText('')

    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index))
      index++
      if (index >= text.length) {
        clearInterval(interval)
        onComplete?.()
      }
    }, 45)

    return () => clearInterval(interval)
  }, [text, active])

  return (
    <span className="font-mono text-text-primary text-xs sm:text-sm">
      {displayedText}
      <span className="animate-pulse text-accent ml-0.5">|</span>
    </span>
  )
}

function SearchAgentSim() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 3800)
    const t2 = setTimeout(() => setStep(2), 5800)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  return (
    <div className="flex flex-col space-y-3 font-mono text-xs text-text-secondary h-full">
      <div className="flex items-start gap-1.5">
        <span className="text-accent shrink-0">&gt; user:</span>
        <TypingText
          text="autonomous_search --query='premium matte black coffee maker under $100'"
          active={true}
        />
      </div>

      {step >= 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center gap-2 text-text-tertiary">
            <Loader2 size={12} className="animate-spin text-accent" />
            <span>Scanning 14 commerce APIs & reviews database...</span>
          </div>
          <div className="flex items-center gap-2 text-accent">
            <Cpu size={12} className="animate-pulse" />
            <span>AI weights calculation: prioritizing brand reliability & user ratings</span>
          </div>
        </motion.div>
      )}

      {step >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3 pt-2"
        >
          <div className="p-2.5 rounded-lg border flex flex-col justify-between space-y-2 relative bg-bg-tertiary/40 border-accent/60 shadow-[0_0_12px_rgba(200,169,110,0.15)]">
            <div className="absolute top-1.5 right-1.5 bg-accent/20 border border-accent/30 text-[8px] px-1 py-0.5 rounded text-accent font-semibold flex items-center gap-0.5">
              <Sparkles size={8} /> 98% MATCH
            </div>

            <div className="space-y-1">
              <div className="w-6 h-6 rounded bg-accent/10 flex items-center justify-center text-accent mb-1">
                <ShoppingBag size={12} />
              </div>
              <span className="font-sans font-semibold text-text-primary text-[11px] block leading-tight truncate">AromaBrew Espresso</span>
              <span className="text-accent text-[11px] font-bold block">$89.00</span>
            </div>

            <div className="text-[9px] text-text-tertiary space-y-0.5 border-t border-border pt-1">
              <div>✓ Matte Finish</div>
              <div>✓ 4.9★ rating</div>
              <div>✓ Same-day delivery</div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg border border-border bg-bg-tertiary/20 flex flex-col justify-between space-y-2 opacity-60">
            <div className="space-y-1">
              <div className="w-6 h-6 rounded bg-text-tertiary/10 flex items-center justify-center text-text-secondary mb-1">
                <ShoppingBag size={12} />
              </div>
              <span className="font-sans font-semibold text-text-secondary text-[11px] block leading-tight truncate">Classic Drip Maker</span>
              <span className="text-text-secondary text-[11px] font-bold block">$45.00</span>
            </div>

            <div className="text-[9px] text-text-tertiary space-y-0.5 border-t border-border pt-1">
              <div>✓ Matte black</div>
              <div>✗ 4.2★ rating</div>
              <div>✗ $8.99 shipping</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

function CuratorSim() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1000)
    const t2 = setTimeout(() => setStep(2), 2000)
    const t3 = setTimeout(() => setStep(3), 3000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [])

  return (
    <div className="flex flex-col space-y-3 font-mono text-xs text-text-secondary h-full">
      <div className="flex items-center justify-between text-text-tertiary border-b border-border pb-2">
        <span className="flex items-center gap-1"><Cpu size={12} className="text-accent" /> Neural Profile loaded</span>
        <span className="text-[10px] text-accent">Active curator</span>
      </div>

      <div className="space-y-2.5">
        {step >= 1 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-2 rounded-lg border border-border bg-bg-tertiary/20"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-accent/5 flex items-center justify-center border border-accent/10">
                <span className="text-accent text-[10px]">🎧</span>
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-medium text-text-primary text-[11px]">ANC Travel Headphones</span>
                <span className="text-[9px] text-accent">Reason: Searches for travel gear</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-accent font-semibold text-[10px] bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">95% Match</span>
            </div>
          </motion.div>
        )}

        {step >= 2 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-2 rounded-lg border border-border bg-bg-tertiary/20"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-accent/5 flex items-center justify-center border border-accent/10">
                <span className="text-accent text-[10px]">⌨️</span>
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-medium text-text-primary text-[11px]">Keychron Mech Keyboard</span>
                <span className="text-[9px] text-accent">Reason: Complement office setup</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-accent font-semibold text-[10px] bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">94% Match</span>
            </div>
          </motion.div>
        )}

        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-2 rounded-lg border border-border bg-bg-tertiary/20"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-accent/5 flex items-center justify-center border border-accent/10">
                <span className="text-accent text-[10px]">☕</span>
              </div>
              <div className="flex flex-col">
                <span className="font-sans font-medium text-text-primary text-[11px]">Matte Ceramic Mug</span>
                <span className="text-[9px] text-accent">Reason: Fits coffee enthusiast theme</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-accent font-semibold text-[10px] bg-accent/10 border border-accent/20 px-1.5 py-0.5 rounded">89% Match</span>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function CheckoutSim() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 1200)
    const t2 = setTimeout(() => setStep(2), 2400)
    const t3 = setTimeout(() => setStep(3), 3600)
    const t4 = setTimeout(() => setStep(4), 5000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      clearTimeout(t4)
    }
  }, [])

  return (
    <div className="flex flex-col space-y-3 font-mono text-xs text-text-secondary h-full justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between border-b border-border pb-1.5">
          <span className="text-text-primary font-medium">Checkout autopilot</span>
          <span className="text-accent font-bold">$89.00</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px]">
            {step >= 1 ? (
              <CheckCircle2 size={12} className="text-success shrink-0" />
            ) : (
              <Loader2 size={12} className="text-accent animate-spin shrink-0" />
            )}
            <span className={step >= 1 ? 'text-text-secondary line-through opacity-50 animate-pulse' : 'text-text-primary'}>
              Verifying inventory & availability
            </span>
          </div>

          {step >= 1 && (
            <div className="flex items-center gap-2 text-[10px]">
              {step >= 2 ? (
                <CheckCircle2 size={12} className="text-success shrink-0" />
              ) : (
                <Loader2 size={12} className="text-accent animate-spin shrink-0" />
              )}
              <span className={step >= 2 ? 'text-text-secondary line-through opacity-50' : 'text-text-primary'}>
                Negotiating agent discount codes (-10%)
              </span>
            </div>
          )}

          {step >= 2 && (
            <div className="flex items-center gap-2 text-[10px]">
              {step >= 3 ? (
                <CheckCircle2 size={12} className="text-success shrink-0" />
              ) : (
                <Loader2 size={12} className="text-accent animate-spin shrink-0" />
              )}
              <span className={step >= 3 ? 'text-text-secondary line-through opacity-50' : 'text-text-primary'}>
                Stripe token secure generation
              </span>
            </div>
          )}

          {step >= 3 && (
            <div className="flex items-center gap-2 text-[10px]">
              {step >= 4 ? (
                <CheckCircle2 size={12} className="text-success shrink-0" />
              ) : (
                <Loader2 size={12} className="text-accent animate-spin shrink-0" />
              )}
              <span className={step >= 4 ? 'text-text-secondary line-through opacity-50' : 'text-text-primary'}>
                Executing Stripe single-click checkout
              </span>
            </div>
          )}
        </div>
      </div>

      {step >= 4 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-3 bg-success/10 border border-success/30 rounded-lg flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-success shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div className="flex flex-col font-sans">
            <span className="text-success font-semibold text-xs leading-tight">Order Placed Successfully!</span>
            <span className="text-[9px] text-text-secondary mt-0.5 font-mono">Token: tok_stripe_agent_102a9</span>
          </div>
        </motion.div>
      ) : (
        <div className="relative h-16 w-full rounded-lg bg-gradient-to-r from-accent/20 to-accent-light/10 border border-accent/20 overflow-hidden flex items-center px-4 justify-between">
          <div className="flex items-center gap-2.5">
            <CreditCard size={20} className="text-accent shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] text-text-primary font-sans leading-none font-bold">SmartCart AI Card</span>
              <span className="text-[8px] text-text-tertiary font-mono tracking-widest mt-1">•••• •••• •••• 9821</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
            <span className="text-[9px] uppercase tracking-wider text-accent font-semibold font-sans">STRIPE SECURE</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default function HeroDashboard() {
  const theme = useSelector((state) => state.ui.theme)
  const isLight = theme === 'light'

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState(0)
  const [isManual, setIsManual] = useState(false)
  const manualTimeoutRef = useRef(null)

  const cardBorder = isLight ? '#D4C4A8' : '#C8965A'

  const handleTabClick = (index) => {
    setActiveTab(index)
    setIsManual(true)
    if (manualTimeoutRef.current) {
      clearTimeout(manualTimeoutRef.current)
    }
    manualTimeoutRef.current = setTimeout(() => {
      setIsManual(false)
    }, 15000)
  }

  useEffect(() => {
    if (isManual) return
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3)
    }, 10000)
    return () => clearInterval(interval)
  }, [isManual])

  useEffect(() => {
    return () => {
      if (manualTimeoutRef.current) clearTimeout(manualTimeoutRef.current)
    }
  }, [])

  const handleQuickPrompt = (promptText) => {
    dispatch(setQuery(promptText))
    dispatch(addRecentSearch(promptText))
    navigate(`/search?q=${encodeURIComponent(promptText)}&r=${Date.now()}`)
  }

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="px-6 py-6 border-b border-border"
    >
      <div className={`relative w-full overflow-hidden rounded-[var(--radius-lg)] border border-border shadow-[var(--shadow-card)] transition-colors duration-300 ${isLight ? 'bg-bg-secondary' : 'bg-bg-secondary'}`}>

        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none select-none opacity-40 mix-blend-screen">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-accent/20 blur-[120px]" />
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-accent/10 blur-[120px]" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none select-none"
          style={{
            backgroundImage: `linear-gradient(to right, ${cardBorder} 1px, transparent 1px), linear-gradient(to bottom, ${cardBorder} 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-12 items-center">

          {/* Left Column - Copy & CTA (lg:col-span-7) */}
          <div className="flex flex-col space-y-6 lg:col-span-7">
            <div className="flex items-center space-x-2">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                </span>
                <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-accent uppercase flex items-center gap-1.5 font-mono">
                  <Sparkles size={11} className="animate-pulse" /> AI Autonomous commerce
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary leading-[1.15]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Meet your Personal <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-light to-accent">AI Shopping Agent</span>
              </h1>
              <p className="text-sm sm:text-base text-text-secondary max-w-xl leading-relaxed">
                Autopilot for your commerce. Simply describe what you need in plain English. SmartCart AI automatically scans specs, compares ratings, and coordinates checkouts securely.
              </p>
            </div>

            {/* Search Bar Integration */}
            <div className="w-full max-w-xl">
              <AISearchBar className="w-full shadow-[var(--shadow-gold)]" />
            </div>

            {/* Quick Prompts Suggestions */}
            <div className="flex flex-col space-y-2 pt-2">
              <span className="text-[10px] sm:text-xs text-text-tertiary uppercase tracking-wider font-semibold">Try describing these needs:</span>
              <div className="flex flex-wrap gap-2">
                {PROMPTS.map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickPrompt(promptText)}
                    className="text-xs text-left px-3 py-2 rounded-lg border border-border bg-bg-tertiary/60 hover:border-accent hover:text-accent transition-all duration-200 cursor-pointer flex items-center space-x-1 hover:bg-bg-tertiary"
                  >
                    <span>{promptText}</span>
                    <ArrowRight size={10} className="ml-1 shrink-0 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Simulator (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full max-w-md rounded-xl border border-border/80 bg-bg-secondary/60 backdrop-blur-lg shadow-[var(--shadow-card)] overflow-hidden">

              {/* Terminal Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-bg-tertiary/60">
                <div className="flex items-center space-x-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56] opacity-85" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] opacity-85" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F] opacity-85" />
                </div>

                <span className="text-[10px] font-mono text-text-tertiary tracking-wider uppercase flex items-center gap-1.5">
                  <Terminal size={12} /> agent_session.sh
                </span>

                <div className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  <span className="text-[9px] font-mono text-accent uppercase tracking-widest">Active</span>
                </div>
              </div>

              {/* Tab Navigation */}
              <div className="grid grid-cols-3 border-b border-border bg-bg-tertiary/20">
                {SIMULATOR_TABS.map((tab, idx) => {
                  const isActive = activeTab === idx
                  return (
                    <button
                      key={idx}
                      onClick={() => handleTabClick(idx)}
                      className={`py-2 px-1 text-center font-mono text-[10px] sm:text-xs border-r border-border last:border-r-0 transition-all cursor-pointer ${isActive
                          ? 'bg-bg-secondary text-accent border-b-2 border-b-accent font-semibold'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary/40'
                        }`}
                    >
                      {tab.title}
                    </button>
                  )
                })}
              </div>

              {/* Simulator Screen Content */}
              <div className="p-4 min-h-[260px] flex flex-col justify-between">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1 flex flex-col justify-between"
                  >
                    {activeTab === 0 && <SearchAgentSim />}
                    {activeTab === 1 && <CuratorSim />}
                    {activeTab === 2 && <CheckoutSim />}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>
      </div>
    </motion.section>
  )
}
