import { createContext, useContext, useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { io } from 'socket.io-client'
import { toast } from 'react-hot-toast'
import { selectIsAuth, selectToken } from '../store/slices/authSlice'
import { notificationApi } from '../store/api/notificationApi'

const SocketContext = createContext(null)

export const useSocket = () => useContext(SocketContext)

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuth)
  const token = useSelector(selectToken)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
    
    const newSocket = io(BACKEND_URL, {
      auth: { token },
      autoConnect: true,
    })

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to backend websocket')
    })

    newSocket.on('disconnect', () => {
      console.log('[Socket] Disconnected from backend websocket')
    })

    // Listen for new notifications
    newSocket.on('new_notification', (notification) => {
      console.log('[Socket] New notification received:', notification)
      
      // Update RTK Query notifications cache list
      dispatch(
        notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
          if (draft && draft.notifications) {
            const exists = draft.notifications.some(n => n._id === notification._id)
            if (!exists) {
              draft.notifications.unshift(notification)
              if (draft.pagination) {
                draft.pagination.total = (draft.pagination.total || 0) + 1
              }
              if (typeof draft.unreadCount === 'number' && !notification.isRead) {
                draft.unreadCount += 1
              }
            }
          }
        })
      )

      // Show real-time browser toast
      toast.success(
        <div className="flex flex-col gap-0.5">
          <strong className="block text-accent font-semibold">{notification.title}</strong>
          <span className="text-xs text-[#d1d1d6]">{notification.body}</span>
        </div>,
        {
          duration: 5000,
          icon: '🔔',
        }
      )
    })

    // Listen for unread count updates
    newSocket.on('unread_count_update', ({ count }) => {
      console.log('[Socket] Unread count updated to:', count)

      // Update RTK Query unread count cache
      dispatch(
        notificationApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
          if (draft) {
            draft.count = count
          } else {
            return { count }
          }
        })
      )

      // Also update the unreadCount field in notifications list cache
      dispatch(
        notificationApi.util.updateQueryData('getNotifications', undefined, (draft) => {
          if (draft) {
            draft.unreadCount = count
          }
        })
      )
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [isAuthenticated, token, dispatch])

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  )
}
