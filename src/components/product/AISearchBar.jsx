import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Sparkles, X, Clock, TrendingUp } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import {
  setQuery,
  addRecentSearch,
  selectRecentSearches,
} from '../../store/slices/searchSlice'
import { useDebounce } from '../../hooks/useDebounce'
import { cn } from '../../utils/cn'

const TRENDING = ['wireless earbuds', 'running shoes', 'laptop stand', 'coffee maker']

export default function AISearchBar({ className, autoFocus = false }) {
  const dispatch       = useDispatch()
  const navigate       = useNavigate()
  const [searchParams] = useSearchParams()
  const recentSearches = useSelector(selectRecentSearches)
  const inputRef       = useRef(null)
  const skipFocusOpen  = useRef(false)

  const [inputValue, setInputValue] = useState('')
  const [focused,    setFocused]    = useState(false)
  const debouncedVal = useDebounce(inputValue, 300)

  useEffect(() => {
    if (autoFocus) {
      skipFocusOpen.current = true
      inputRef.current?.focus()
    }
  }, [autoFocus])

  // Keep input in sync when landing on /search?q=… from elsewhere
  useEffect(() => {
    const urlQ = searchParams.get('q') || ''
    if (urlQ) setInputValue(urlQ)
  }, [searchParams])

  const goToSearch = (q) => {
    const ts = Date.now()
    navigate(`/search?q=${encodeURIComponent(q)}&r=${ts}`)
  }

  const handleSubmit = (e) => {
    e?.preventDefault()
    const q = inputValue.trim()
    if (!q) return
    dispatch(setQuery(q))
    dispatch(addRecentSearch(q))
    goToSearch(q)
    setFocused(false)
    inputRef.current?.blur()
  }

  const handleSuggestion = (term) => {
    setInputValue(term)
    dispatch(setQuery(term))
    dispatch(addRecentSearch(term))
    goToSearch(term)
    setFocused(false)
  }

  const showDropdown = focused && (recentSearches.length > 0 || TRENDING.length > 0)

  return (
    <div className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2.5',
            'bg-bg-tertiary border rounded-[var(--radius-md)]',
            'transition-all duration-200',
            focused
              ? 'border-accent ring-1 ring-accent/20 shadow-[var(--shadow-gold)]'
              : 'border-border hover:border-border-accent',
          )}
        >
          {/* AI indicator */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Sparkles size={15} className="text-accent" />
            <span className="text-[10px] font-semibold text-accent uppercase tracking-wider hidden sm:block">
              AI
            </span>
          </div>

          <div className="w-px h-4 bg-border shrink-0" />

          {/* Input */}
          <input
            ref={inputRef}
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={() => {
              if (skipFocusOpen.current) {
                skipFocusOpen.current = false
                return
              }
              setFocused(true)
            }}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder="Search with AI — describe what you need…"
            className={cn(
              'flex-1 bg-transparent text-sm text-text-primary',
              'placeholder-text-tertiary outline-none',
              'font-[var(--font-body)]',
            )}
            aria-label="AI product search"
          />

          {inputValue && (
            <button
              type="button"
              onClick={() => setInputValue('')}
              className="text-text-tertiary hover:text-text-primary transition-colors"
              aria-label="Clear"
            >
              <X size={14} />
            </button>
          )}

          <button
            type="submit"
            className={cn(
              'shrink-0 w-7 h-7 flex items-center justify-center',
              'rounded-[var(--radius-sm)] transition-all',
              inputValue
                ? 'bg-accent text-bg-primary hover:bg-accent-light'
                : 'text-text-tertiary',
            )}
            aria-label="Search"
          >
            <Search size={14} />
          </button>
        </div>
      </form>

      {/* Dropdown suggestions */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-full mt-2 left-0 right-0 z-50',
              'bg-bg-secondary border border-border-accent',
              'rounded-[var(--radius-md)] shadow-[var(--shadow-card)]',
              'overflow-hidden',
            )}
          >
            {/* Recent searches */}
            {recentSearches.length > 0 && (
              <div className="p-2">
                <p className="text-[10px] text-text-tertiary uppercase tracking-widest px-2 py-1">
                  Recent
                </p>
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onMouseDown={() => handleSuggestion(term)}
                    className="w-full flex items-center gap-2 px-2 py-2 rounded-[var(--radius-sm)] text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors text-left"
                  >
                    <Clock size={13} className="text-text-tertiary shrink-0" />
                    {term}
                  </button>
                ))}
              </div>
            )}

            {/* Divider */}
            {recentSearches.length > 0 && (
              <div className="border-t border-border" />
            )}

            {/* Trending */}
            <div className="p-2">
              <p className="text-[10px] text-text-tertiary uppercase tracking-widest px-2 py-1">
                Trending
              </p>
              {TRENDING.map((term) => (
                <button
                  key={term}
                  onMouseDown={() => handleSuggestion(term)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-[var(--radius-sm)] text-sm text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors text-left"
                >
                  <TrendingUp size={13} className="text-accent shrink-0" />
                  {term}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
