/**
 * Format a date into a human-readable string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d)) return '—'
  return d.toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
    ...options,
  })
}

/**
 * Format date + time
 */
export const formatDateTime = (date) => {
  if (!date) return '—'
  const d = new Date(date)
  if (isNaN(d)) return '—'
  return d.toLocaleString('en-US', {
    year:   'numeric',
    month:  'short',
    day:    'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  })
}

/**
 * Relative time: "2 hours ago", "just now", etc.
 */
export const formatRelativeTime = (date) => {
  if (!date) return '—'
  const d     = new Date(date)
  const now   = new Date()
  const diff  = now - d // ms
  const secs  = Math.floor(diff / 1000)
  const mins  = Math.floor(secs  / 60)
  const hours = Math.floor(mins  / 60)
  const days  = Math.floor(hours / 24)

  if (secs < 60)  return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * Short date: Jan 12, 2025
 */
export const formatShortDate = (date) =>
  formatDate(date, { year: 'numeric', month: 'short', day: 'numeric' })
