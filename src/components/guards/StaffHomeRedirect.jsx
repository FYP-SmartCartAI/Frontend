import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useAuth } from '../../hooks/useAuth'
import { getRoleDashboardPath, isAdminOrSubadmin } from '../../utils/roleHelpers'
import { selectToken } from '../../store/slices/authSlice'
import { useGetProfileQuery } from '../../store/api/authApi'
import { isTokenExpired } from '../../utils/tokenHelpers'
import Spinner from '../ui/Spinner'

/**
 * Admin/subadmin users who land on the shop home (/) are sent to their panel.
 */
export default function StaffHomeRedirect({ children }) {
  const { isAuthenticated, role } = useAuth()
  const token                     = useSelector(selectToken)

  const skipProfile = !isAuthenticated || !token || isTokenExpired(token)
  const { isLoading, isFetching, isSuccess, isError } = useGetProfileQuery(undefined, {
    skip: skipProfile,
  })

  const isBootstrapping =
    !skipProfile && !role && (isLoading || isFetching) && !isSuccess && !isError

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <Spinner size="xl" />
      </div>
    )
  }

  if (isAuthenticated && isAdminOrSubadmin(role)) {
    return <Navigate to={getRoleDashboardPath(role)} replace />
  }

  return children
}
