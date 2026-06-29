import {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from '../store/api/notificationApi'
import { useAuth } from './useAuth'

export const useNotifications = () => {
  const { isAuthenticated } = useAuth()

  const {
    data:      notificationsData,
    isLoading: loadingNotifications,
    isError:   notifError,
  } = useGetNotificationsQuery(undefined, { skip: !isAuthenticated })

  const {
    data:      countData,
    isLoading: loadingCount,
  } = useGetUnreadCountQuery(undefined, {
    skip:              !isAuthenticated,
    // Polling disabled — now handled via real-time WebSockets
  })

  const [markAsRead]    = useMarkAsReadMutation()
  const [markAllAsRead] = useMarkAllAsReadMutation()
  const [deleteNotif]   = useDeleteNotificationMutation()

  const notifications = notificationsData?.notifications || []
  const unreadCount   = countData?.count ?? 0

  return {
    notifications,
    unreadCount,
    isLoading: loadingNotifications || loadingCount,
    isError:   notifError,

    markAsRead:   (id) => markAsRead(id).unwrap(),
    markAllRead:  ()   => markAllAsRead().unwrap(),
    deleteNotif:  (id) => deleteNotif(id).unwrap(),
  }
}
