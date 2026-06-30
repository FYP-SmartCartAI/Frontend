import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useSocket, useSocketConnected } from '../context/SocketContext'
import { ticketApi } from '../store/api/ticketApi'

export function useTicketRoom(ticketId) {
  const socket = useSocket()
  const isConnected = useSocketConnected()
  const dispatch = useDispatch()

  useEffect(() => {
    if (!socket || !ticketId || !isConnected) return

    const roomId = String(ticketId)

    const joinRoom = () => {
      socket.emit('join_ticket', { ticketId: roomId })
    }

    const onNewMessage = ({ ticketId: incomingId, message }) => {
      if (String(incomingId) !== roomId) return

      dispatch(
        ticketApi.util.updateQueryData('getTicketById', ticketId, (draft) => {
          const target = draft?.ticket || draft
          if (!target) return
          const list = target.messages ?? (target.messages = [])
          if (message._id && list.some((m) => String(m._id) === String(message._id))) return
          list.push(message)
        }),
      )
    }

    socket.on('new_message', onNewMessage)
    joinRoom()
    socket.on('connect', joinRoom)

    return () => {
      socket.emit('leave_ticket', { ticketId: roomId })
      socket.off('new_message', onNewMessage)
      socket.off('connect', joinRoom)
    }
  }, [socket, isConnected, ticketId, dispatch])
}
