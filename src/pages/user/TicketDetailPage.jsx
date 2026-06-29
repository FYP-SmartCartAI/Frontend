import { useRef, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { ChevronLeft, Send, AlertCircle, CheckCircle2 } from 'lucide-react'
import {
  useGetTicketByIdQuery,
  useAddMessageMutation,
  useCloseTicketMutation,
  ticketApi,
} from '../../store/api/ticketApi'
import { useAuth } from '../../hooks/useAuth'
import { useSocket } from '../../context/SocketContext'
import MessageBubble     from '../../components/ticket/MessageBubble'
import TicketStatusBadge from '../../components/ticket/TicketStatusBadge'
import Skeleton          from '../../components/ui/Skeleton'
import Button            from '../../components/ui/Button'
import toast             from 'react-hot-toast'

export default function TicketDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const dispatch = useDispatch()
  const socket   = useSocket()
  const bottomRef = useRef(null)

  const { data, isLoading, isError } = useGetTicketByIdQuery(id)
  const [addMessage, { isLoading: sending }] = useAddMessageMutation()
  const [closeTicket, { isLoading: closing }] = useCloseTicketMutation()

  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  const ticket   = data?.ticket || data
  const messages = ticket?.messages || []

  // Role-aware back navigation
  const backPath = user?.role === 'subadmin' ? '/subadmin/tickets'
                 : user?.role === 'admin'    ? '/admin/tickets'
                 : '/support'
  const backLabel = (user?.role === 'subadmin' || user?.role === 'admin') ? 'Support Tickets' : 'Support'

  // Real-time messages via socket — no polling
  useEffect(() => {
    if (!socket || !id) return

    socket.emit('join_ticket', { ticketId: id })

    const onNewMessage = ({ ticketId, message }) => {
      if (String(ticketId) !== String(id)) return
      dispatch(
        ticketApi.util.updateQueryData('getTicketById', id, (draft) => {
          const target = draft?.ticket || draft
          if (!target) return
          const list = target.messages ?? (target.messages = [])
          if (list.some((m) => String(m._id) === String(message._id))) return
          list.push(message)
        }),
      )
    }

    socket.on('new_message', onNewMessage)

    return () => {
      socket.emit('leave_ticket', { ticketId: id })
      socket.off('new_message', onNewMessage)
    }
  }, [socket, id, dispatch])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const onSubmit = async ({ content }) => {
    if (!content?.trim()) return
    try {
      await addMessage({ ticketId: id, message: content }).unwrap()
      reset()
    } catch {
      toast.error('Could not send message')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (isError || !ticket) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle size={36} className="text-error" />
        <p className="text-text-secondary">Ticket not found.</p>
        <Link to={backPath}><Button variant="ghost" icon={<ChevronLeft size={15} />}>Back</Button></Link>
      </div>
    )
  }

  const isClosed = ticket?.status?.toLowerCase() === 'closed'
  const isStaff  = user?.role === 'admin' || user?.role === 'subadmin'
  const orderShort = ticket?.orderId
    ? `#${String(ticket.orderId).slice(-6).toUpperCase()}`
    : null


  const handleClose = async () => {
    try {
      await closeTicket(id).unwrap()
      toast.success('Ticket closed')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to close ticket')
    }
  }

  return (
    <div className="min-h-full flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-border">
        <Link to={backPath} className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-accent mb-3 transition-colors">
          <ChevronLeft size={13} /> {backLabel}
        </Link>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1
              className="text-lg font-bold text-text-primary"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {ticket.subject || (orderShort ? `Order ${orderShort}` : 'Support Ticket')}
            </h1>
            {ticket.orderId && (
              <Link
                to={`/orders/${ticket.orderId}`}
                className="text-xs text-accent hover:underline mt-0.5 inline-block"
              >
                View order {orderShort}
              </Link>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <TicketStatusBadge status={ticket.status} />
            {isStaff && !isClosed && (
              <Button
                variant="ghost"
                size="sm"
                icon={<CheckCircle2 size={14} />}
                loading={closing}
                onClick={handleClose}
              >
                Close Ticket
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg._id}
            message={msg}
            isOwn={
              String(msg.sender?._id || msg.sender) === String(user?._id)
            }
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!isClosed ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-5 py-4 border-t border-border bg-bg-secondary"
        >
          <div className="flex gap-2">
            <textarea
              rows={2}
              placeholder="Type your message…"
              className="flex-1 bg-bg-tertiary border border-border rounded-[var(--radius-md)] px-3 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-accent resize-none"
              {...register('content', { required: true, minLength: 1 })}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(onSubmit)()
                }
              }}
            />
            <Button
              type="submit"
              variant="gold"
              size="md"
              icon={<Send size={14} />}
              loading={sending}
              aria-label="Send"
            />
          </div>
        </form>
      ) : (
        <div className="px-5 py-3 border-t border-border text-center">
          <p className="text-xs text-text-tertiary">This ticket is {ticket.status}.</p>
        </div>
      )}
    </div>
  )
}
