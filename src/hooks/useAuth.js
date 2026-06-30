import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  selectCurrentUser,
  selectToken,
  selectIsAuth,
  selectUserRole,
  setCredentials,
  logout as logoutAction,
} from '../store/slices/authSlice'
import { getRoleDashboardPath } from '../utils/roleHelpers'
import { sendFcmTokenToBackend } from '../firebase'

export const useAuth = () => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const user      = useSelector(selectCurrentUser)
  const token     = useSelector(selectToken)
  const isAuth    = useSelector(selectIsAuth)
  const role      = useSelector(selectUserRole)

  const login = ({ user, token }) => {
    dispatch(setCredentials({ user, token }))
    navigate(getRoleDashboardPath(user.role))
  }

  const logout = async () => {
    try {
      await sendFcmTokenToBackend(null)
    } catch (err) {
      console.error("Error clearing FCM token during logout:", err)
    }
    dispatch(logoutAction())
    navigate('/login')
  }

  return {
    user,
    token,
    isAuthenticated: isAuth,
    role,
    isAdmin:    role === 'admin',
    isSubadmin: role === 'subadmin',
    isUser:     role === 'user',
    login,
    logout,
  }
}
