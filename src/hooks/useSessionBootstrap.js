import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useGetProfileQuery } from '../store/api/authApi'
import {
  selectIsAuth,
  selectToken,
  selectUserRole,
  updateUser,
  logout,
} from '../store/slices/authSlice'
import { isTokenExpired } from '../utils/tokenHelpers'
import { normalizeAuthUser } from '../utils/normalizeAuthUser'

/**
 * Keeps the client session in sync with the server:
 * - clears expired JWTs on load (prevents "logged in" UI with a dead token)
 * - refreshes role/name/avatar from GET /api/auth/profile
 */
export function useSessionBootstrap() {
  const dispatch        = useDispatch()
  const isAuthenticated = useSelector(selectIsAuth)
  const token           = useSelector(selectToken)
  const role            = useSelector(selectUserRole)

  const tokenExpired = token ? isTokenExpired(token) : false

  useEffect(() => {
    if (token && tokenExpired) {
      dispatch(logout())
    }
  }, [token, tokenExpired, dispatch])

  const skipProfile = !isAuthenticated || !token || tokenExpired

  const { data, isLoading, isFetching, isSuccess, isError } = useGetProfileQuery(
    undefined,
    { skip: skipProfile, refetchOnMountOrArgChange: true },
  )

  useEffect(() => {
    if (!isSuccess || !data?.user) return
    dispatch(updateUser(normalizeAuthUser(data.user)))
  }, [isSuccess, data, dispatch])

  const isBootstrapping =
    !skipProfile && !role && (isLoading || isFetching) && !isSuccess && !isError

  return { isBootstrapping, sessionReady: skipProfile || isSuccess || isError }
}
