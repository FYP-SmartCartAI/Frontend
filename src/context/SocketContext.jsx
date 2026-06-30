import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { io } from 'socket.io-client'
import { selectIsAuth, selectToken } from '../store/slices/authSlice'
import { notificationApi } from '../store/api/notificationApi'
import { showNotificationToast } from '../utils/notificationToast'
import { usePushNotifications } from '../hooks/usePushNotifications'

const SocketContext = createContext({ socket: null, isConnected: false })

const NOTIFICATIONS_CACHE_ARG = {}

export const useSocket = () => useContext(SocketContext).socket
export const useSocketConnected = () => useContext(SocketContext).isConnected

let sharedSocket = null
let sharedToken = null

function attachSocketListeners(socket, dispatch) {
  socket.off('new_notification')
  socket.off('unread_count_update')

  socket.on('new_notification', (notification) => {
    dispatch(
      notificationApi.util.updateQueryData(
        'getNotifications',
        NOTIFICATIONS_CACHE_ARG,
        (draft) => {
          if (!draft) return
          if (!draft.notifications) draft.notifications = []

          const exists = draft.notifications.some((n) => n._id === notification._id)
          if (!exists) {
            draft.notifications.unshift(notification)
            if (draft.pagination) {
              draft.pagination.total = (draft.pagination.total || 0) + 1
            }
          }
        },
      ),
    )

    showNotificationToast(notification.title, notification.body)
  })

  socket.on('unread_count_update', ({ count }) => {
    dispatch(
      notificationApi.util.updateQueryData('getUnreadCount', undefined, (draft) => {
        if (draft) draft.count = count
        else return { count }
      }),
    )

    dispatch(
      notificationApi.util.updateQueryData(
        'getNotifications',
        NOTIFICATIONS_CACHE_ARG,
        (draft) => {
          if (draft) draft.unreadCount = count
        },
      ),
    )
  })
}

function disconnectSharedSocket() {
  if (sharedSocket) {
    sharedSocket.removeAllListeners()
    sharedSocket.disconnect()
    sharedSocket = null
    sharedToken = null
  }
}

export const SocketProvider = ({ children }) => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuth)
  const token = useSelector(selectToken)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const dispatchRef = useRef(dispatch)

  usePushNotifications()

  useEffect(() => {
    dispatchRef.current = dispatch
  }, [dispatch])

  useEffect(() => {
    if (!isAuthenticated || !token) {
      disconnectSharedSocket()
      setSocket(null)
      setIsConnected(false)
      return
    }

    const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

    if (sharedSocket && sharedToken === token) {
      attachSocketListeners(sharedSocket, dispatchRef.current)
      setSocket(sharedSocket)
      setIsConnected(sharedSocket.connected)
      return
    }

    disconnectSharedSocket()

    const newSocket = io(BACKEND_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    })

    newSocket.on('connect', () => setIsConnected(true))
    newSocket.on('disconnect', () => setIsConnected(false))
    newSocket.on('connect_error', () => setIsConnected(false))

    attachSocketListeners(newSocket, dispatchRef.current)

    sharedSocket = newSocket
    sharedToken = token
    setSocket(newSocket)
    setIsConnected(newSocket.connected)
  }, [isAuthenticated, token])

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  )
}
