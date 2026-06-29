import { useSelector } from 'react-redux'

/**
 * GlobalLoader — premium gold progress bar at the top of the viewport
 * Triggers when any RTK Query/Mutation is pending, or globalLoading is active.
 */
export default function GlobalLoader() {
  const isPendingQuery = useSelector((state) =>
    Object.values(state.api?.queries || {}).some((q) => q?.status === 'pending')
  )
  const isPendingMutation = useSelector((state) =>
    Object.values(state.api?.mutations || {}).some((m) => m?.status === 'pending')
  )
  const isGlobalLoading = useSelector((state) => state.ui?.globalLoading)

  const show = isPendingQuery || isPendingMutation || isGlobalLoading

  if (!show) return null

  return (
    <div className="global-loading-bar" role="progressbar" aria-label="Loading data from backend">
      <div className="global-loading-bar-fill" />
    </div>
  )
}
