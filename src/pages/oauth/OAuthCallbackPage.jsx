import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setCredentials } from '../../store/slices/authSlice'
import { getRoleDashboardPath } from '../../utils/roleHelpers'
import Spinner from '../../components/ui/Spinner'
import toast from 'react-hot-toast'

// Keep track of the last processed token to prevent duplicate execution in Strict Mode double-mount
let lastProcessedToken = null

/**
 * OAuthCallbackPage — handles the redirect from OAuth providers.
 * The backend redirects to /oauth/callback?token=...&user=...
 */
export default function OAuthCallbackPage() {
  const [params]  = useSearchParams()
  const dispatch  = useDispatch()
  const navigate  = useNavigate()

  useEffect(() => {
    const token   = params.get('token')
    const userRaw = params.get('user')

    if (!token || !userRaw) {
      toast.error('OAuth login failed. Please try again.')
      navigate('/login')
      return
    }

    // If we have already processed this token, skip it
    if (lastProcessedToken === token) {
      return
    }
    lastProcessedToken = token

    try {
      const user = JSON.parse(decodeURIComponent(userRaw))
      dispatch(setCredentials({ user, token }))
      toast.success(`Welcome, ${user.name}!`)
      navigate(getRoleDashboardPath(user.role), { replace: true })
    } catch {
      toast.error('Authentication error. Please try again.')
      navigate('/login')
    }
  }, [params, dispatch, navigate])

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
      <Spinner size="xl" />
      <p className="text-sm text-text-secondary font-[var(--font-body)]">
        Completing sign-in…
      </p>
    </div>
  )
}
