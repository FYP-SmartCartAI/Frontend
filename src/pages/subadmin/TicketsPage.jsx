import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Ticket as TicketIcon, CheckCircle2 } from 'lucide-react'
import { useGetTicketsQuery, useCloseTicketMutation } from '../../store/api/ticketApi'
import TicketStatusBadge from '../../components/ticket/TicketStatusBadge'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import Pagination  from '../../components/ui/Pagination'
import EmptyState  from '../../components/ui/EmptyState'
import Avatar      from '../../components/ui/Avatar'
import Button      from '../../components/ui/Button'
import { formatRelativeTime } from '../../utils/formatDate'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'

const STATUS_TABS = ['', 'open', 'in_progress', 'closed']

export default function SubadminTicketsPage() {
  const navigate            = useNavigate()
  const [status, setStatus] = useState('')
  const [page, setPage]     = useState(1)

  const { data, isLoading } = useGetTicketsQuery({ status: status || undefined, page, limit: 15 })
  const [closeTicket, { isLoading: closing }] = useCloseTicketMutation()

  const tickets    = data?.tickets    || []
  const totalPages = data?.totalPages || 1

  const handleClose = async (id) => {
    try {
      await closeTicket(id).unwrap()
      toast.success('Ticket closed')
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to close ticket')
    }
  }

  const orderShort = (orderId) =>
    orderId ? `#${String(orderId).slice(-6).toUpperCase()}` : '—'

  return (
    <div className="min-h-full p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5 flex-wrap gap-3"
      >
        <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
          Support Tickets
        </h1>
        <div className="flex gap-1.5 overflow-x-auto">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={cn(
                'px-3 py-1 text-xs rounded-full border shrink-0 whitespace-nowrap transition-all',
                status === s
                  ? 'bg-accent text-bg-primary border-accent'
                  : 'border-border text-text-secondary hover:border-accent',
              )}
            >
              {s ? s.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'All'}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Subject', 'Customer', 'Order', 'Updated', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-text-tertiary uppercase tracking-wider font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : tickets.length === 0
                ? (<tr><td colSpan={6} className="py-16"><EmptyState icon={TicketIcon} title="No tickets" /></td></tr>)
                : tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors cursor-pointer"
                    onClick={() => navigate(`/subadmin/tickets/${ticket._id}`)}
                  >
                    <td className="px-4 py-3 max-w-[180px]">
                      <p className="font-medium text-text-primary truncate">
                        {ticket.subject || `Order ${orderShort(ticket.orderId)}`}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={ticket.userId?.name} size="xs" />
                        <span className="text-text-secondary text-xs">{ticket.userId?.name || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs font-[var(--font-mono)]">{orderShort(ticket.orderId)}</td>
                    <td className="px-4 py-3 text-text-tertiary text-xs">{formatRelativeTime(ticket.updatedAt || ticket.createdAt)}</td>
                    <td className="px-4 py-3"><TicketStatusBadge status={ticket.status} /></td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {ticket.status === 'closed' ? (
                        <span className="text-xs text-text-tertiary">Closed</span>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<CheckCircle2 size={13} />}
                          loading={closing}
                          onClick={() => handleClose(ticket._id)}
                        >
                          Close
                        </Button>
                      )}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  )
}
