import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { selectIsAuth } from '../store/slices/authSlice'
import { initPushNotifications } from '../firebase'

export function usePushNotifications() {
  const isAuthenticated = useSelector(selectIsAuth)

  useEffect(() => {
    if (!isAuthenticated) return
    initPushNotifications().catch((err) => console.error('[FCM] Init failed:', err))
  }, [isAuthenticated])
}
