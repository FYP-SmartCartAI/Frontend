/**
 * Format a numeric price into a locale-aware currency string.
 * Default: PKR (Pakistani Rupee) — adjust locale/currency as needed.
 */
export const formatPrice = (amount, currency = 'PKR', locale = 'en-PK') => {
  if (amount === null || amount === undefined || isNaN(amount)) return '—'
  return new Intl.NumberFormat(locale, {
    style:    'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a discount percentage
 */
export const formatDiscount = (original, discounted) => {
  if (!original || !discounted || original <= discounted) return null
  return Math.round(((original - discounted) / original) * 100)
}

/**
 * Compact price display e.g. 1.2K, 3.4M
 */
export const formatCompact = (amount) => {
  if (!amount) return '0'
  if (amount >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)}M`
  if (amount >= 1_000)     return `${(amount / 1_000).toFixed(1)}K`
  return String(amount)
}
