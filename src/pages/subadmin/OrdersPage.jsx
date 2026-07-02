import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, ChevronDown, Lock, Truck } from 'lucide-react'
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from '../../store/api/orderApi'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import Pagination from '../../components/ui/Pagination'
import EmptyState from '../../components/ui/EmptyState'
import { formatPrice } from '../../utils/formatPrice'
import { formatShortDate } from '../../utils/formatDate'
import { cn } from '../../utils/cn'
import toast from 'react-hot-toast'

// Subadmin can ONLY act after the order has been shipped by admin.
// pending / confirmed / processing are locked — admin's responsibility.
const SUBADMIN_TRANSITIONS = {
  pending:       [],               // locked — admin must ship first
  confirmed:     [],               // locked — admin must ship first
  processing:    [],               // locked — admin must ship first
  shipped:       ['delivered'],    // subadmin confirms delivery in their city
  delivered:     ['cod_collected'],// subadmin marks COD cash received
  cancelled:     [],
  cod_collected: [],
}

// Colour dot per status
const STATUS_DOT = {
  pending:       '#facc15',
  confirmed:     '#60a5fa',
  processing:    '#818cf8',
  shipped:       '#c084fc',
  delivered:     '#4ade80',
  cod_collected: '#34d399',
  cancelled:     '#f87171',
}

// Statuses where the dropdown is locked (waiting for admin)
const ADMIN_PENDING_STATUSES = new Set(['pending', 'confirmed', 'processing'])

const labelOf = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

export default function SubadminOrdersPage() {
  const [page, setPage] = useState(1)
  const [statusFilter, setStatus] = useState('')
  const [pendingStatus, setPendingStatus] = useState({})

  const { data, isLoading } = useGetAllOrdersQuery({
    page, limit: 15, status: statusFilter || undefined,
  })
  const [updateStatus, { isLoading: updating }] = useUpdateOrderStatusMutation()

  const orders     = data?.orders     || []
  const totalPages = data?.totalPages || 1

  const getSelectValue = (order) => pendingStatus[order._id] ?? order.status

  const handleStatus = async (order, newStatus) => {
    const currentStatus = order.status
    if (newStatus === currentStatus) return

    // Client-side guard
    const allowed = SUBADMIN_TRANSITIONS[currentStatus] || []
    if (!allowed.includes(newStatus)) {
      toast.error(`❌ Cannot move from "${labelOf(currentStatus)}" to "${labelOf(newStatus)}".`, { duration: 4000 })
      setPendingStatus(prev => ({ ...prev, [order._id]: currentStatus }))
      return
    }

    // Guard: cod_collected only for COD orders
    if (newStatus === 'cod_collected' && order.paymentMethod !== 'cod') {
      toast.error('❌ "COD Collected" is only valid for Cash on Delivery orders.', { duration: 4000 })
      setPendingStatus(prev => ({ ...prev, [order._id]: currentStatus }))
      return
    }

    setPendingStatus(prev => ({ ...prev, [order._id]: newStatus }))
    try {
      await updateStatus({ id: order._id, status: newStatus }).unwrap()
      toast.success(`✅ Order marked as "${labelOf(newStatus)}"`)
    } catch (err) {
      const msg = err?.data?.message || 'Failed to update status'
      toast.error(`❌ ${msg}`, { duration: 4000 })
      setPendingStatus(prev => ({ ...prev, [order._id]: currentStatus }))
    }
  }

  return (
    <div className="min-h-full p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5 flex-wrap gap-3"
      >
        <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
          Orders
        </h1>
        <div className="flex gap-1.5 overflow-x-auto">
          {['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={cn(
                'px-3 py-1 text-xs rounded-full border shrink-0 whitespace-nowrap transition-all',
                statusFilter === s
                  ? 'bg-accent text-bg-primary border-accent'
                  : 'border-border text-text-secondary hover:border-accent',
              )}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </motion.div>

      <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Order #', 'Customer', 'Date', 'Total', 'Status', 'Update'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-text-tertiary uppercase tracking-wider font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : orders.length === 0
                  ? (<tr><td colSpan={6} className="py-16"><EmptyState icon={ShoppingBag} title="No orders found" /></td></tr>)
                  : orders.map((order) => {
                    const currentStatus = order.status
                    const selectValue   = getSelectValue(order)
                    const allowedNext   = (SUBADMIN_TRANSITIONS[currentStatus] || [])
                      .filter((s) => s !== 'cod_collected' || order.paymentMethod === 'cod')
                    const isTerminal    = allowedNext.length === 0 && !ADMIN_PENDING_STATUSES.has(currentStatus)
                    const isAdminLocked = ADMIN_PENDING_STATUSES.has(currentStatus)

                    return (
                      <tr key={order._id} className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors">
                        <td className="px-4 py-3 font-[var(--font-mono)] text-xs text-text-secondary">
                          #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-text-primary">{order.userId?.name || '—'}</td>
                        <td className="px-4 py-3 text-text-secondary text-xs">{formatShortDate(order.createdAt)}</td>
                        <td className="px-4 py-3 text-accent font-[var(--font-mono)]">{formatPrice(order.total)}</td>
                        <td className="px-4 py-3"><OrderStatusBadge status={currentStatus} /></td>
                        <td className="px-4 py-3">

                          {/* ── Admin must ship first: locked indicator ─── */}
                          {isAdminLocked && (
                            <div className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border/50 bg-bg-tertiary/60 text-xs text-text-tertiary cursor-not-allowed select-none" style={{ minWidth: '190px' }}>
                              <Lock size={11} className="shrink-0 text-text-tertiary/60" />
                              <span>Waiting for admin to ship</span>
                              <Truck size={11} className="ml-auto shrink-0 text-text-tertiary/40" />
                            </div>
                          )}

                          {/* ── Terminal: no more updates ─────────────── */}
                          {isTerminal && (
                            <span className="inline-flex items-center gap-1.5 text-xs text-text-tertiary italic px-3 py-2 rounded-lg border border-border/40 bg-bg-tertiary/50">
                              <span
                                style={{ background: STATUS_DOT[currentStatus] || '#6b7280' }}
                                className="w-2 h-2 rounded-full shrink-0"
                              />
                              No further updates
                            </span>
                          )}

                          {/* ── Active dropdown: subadmin can update ──── */}
                          {!isAdminLocked && !isTerminal && (
                            <div className="relative inline-flex items-center" style={{ minWidth: '170px' }}>
                              {/* Status colour dot */}
                              <span
                                style={{ background: STATUS_DOT[selectValue] || '#6b7280' }}
                                className="absolute left-3 w-2 h-2 rounded-full pointer-events-none z-10 shrink-0"
                              />
                              <select
                                value={selectValue}
                                disabled={updating}
                                onChange={(e) => handleStatus(order, e.target.value)}
                                style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                                className={cn(
                                  'w-full bg-bg-tertiary border border-border',
                                  'rounded-lg pl-7 pr-8 py-2',
                                  'text-xs font-medium text-text-primary',
                                  'outline-none transition-all cursor-pointer',
                                  'hover:border-accent/70 focus:border-accent focus:ring-2 focus:ring-accent/15',
                                  selectValue !== currentStatus && 'border-accent/50 bg-accent/5',
                                  updating && 'opacity-50 cursor-not-allowed',
                                )}
                              >
                                <option value={currentStatus}>
                                  {labelOf(currentStatus)} (current)
                                </option>
                                {allowedNext.map((s) => (
                                  <option key={s} value={s}>
                                    {s === 'cod_collected' ? '💵 Mark COD Collected' : labelOf(s)}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown
                                size={14}
                                className="absolute right-2.5 text-text-tertiary pointer-events-none"
                              />
                            </div>
                          )}

                        </td>
                      </tr>
                    )
                  })
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
