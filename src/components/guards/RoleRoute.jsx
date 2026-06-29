import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../../hooks/useAuth'
import { getRoleDashboardPath } from '../../utils/roleHelpers'
import { selectToken } from '../../store/slices/authSlice'
import { useGetProfileQuery } from '../../store/api/authApi'
import { isTokenExpired } from '../../utils/tokenHelpers'
import Spinner from '../ui/Spinner'

/**
 * RoleRoute — renders children only if user's role is in `allowedRoles`.
 * Otherwise redirects to the appropriate dashboard for their role.
 */
export default function RoleRoute({ allowedRoles = [], children }) {
  const { isAuthenticated, role } = useAuth()
  const token                     = useSelector(selectToken)

  const skipProfile = !isAuthenticated || !token || isTokenExpired(token)
  const { isLoading, isFetching, isSuccess, isError } = useGetProfileQuery(undefined, {
    skip: skipProfile,
  })

  const isBootstrapping =
    !skipProfile && !role && (isLoading || isFetching) && !isSuccess && !isError

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Spinner size="xl" />
      </div>
    )
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to={getRoleDashboardPath(role)} replace />
  }

  return children
}
