import { useState, useEffect } from 'react'

/**
 * Debounce a value — delays updating the returned value until
 * the input hasn't changed for `delay` milliseconds.
 *
 * Usage:
 *   const debouncedQuery = useDebounce(searchQuery, 400)
 */
export const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
