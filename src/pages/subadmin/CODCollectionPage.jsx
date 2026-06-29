import { useState } from 'react'
import { motion } from 'framer-motion'
import { Banknote, CheckCircle2 } from 'lucide-react'
import {
  useGetCODCollectionQuery,
  useMarkCODCollectedMutation,
} from '../../store/api/adminApi'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import Pagination  from '../../components/ui/Pagination'
import EmptyState  from '../../components/ui/EmptyState'
import Badge       from '../../components/ui/Badge'
import Button      from '../../components/ui/Button'
import { formatPrice }     from '../../utils/formatPrice'
import { formatShortDate } from '../../utils/formatDate'
import toast from 'react-hot-toast'

export default function CODCollectionPage() {
  const [page, setPage]   = useState(1)
  const { data, isLoading } = useGetCODCollectionQuery({ page, limit: 15 })
  const [markCollected, { isLoading: marking }] = useMarkCODCollectedMutation()

  const orders     = data?.orders     || []
  const totalPages = data?.totalPages || 1

  const handleCollect = async (orderId) => {
    try {
      await markCollected({ orderId }).unwrap()
      toast.success('Marked as collected')
    } catch {
      toast.error('Failed')
    }
  }

  return (
    <div className="min-h-full p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5"
      >
        <div>
          <h1
            className="text-2xl font-bold text-text-primary flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <Banknote size={20} className="text-accent" />
            COD Collection
          </h1>
          {data?.summary && (
            <p className="text-sm text-text-secondary mt-1">
              Pending:{' '}
              <span className="text-accent font-[var(--font-mono)]">
                {formatPrice(data.summary.pendingAmount)}
              </span>
              {' '}across {data.summary.pendingCount} orders
            </p>
          )}
        </div>
      </motion.div>

      <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['Order #', 'Customer', 'Date', 'Amount', 'Collection', 'Action'].map((h) => (
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
                ? (<tr><td colSpan={6} className="py-16"><EmptyState icon={Banknote} title="No COD orders" /></td></tr>)
                : orders.map((order) => (
                  <tr key={order._id} className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors">
                    <td className="px-4 py-3 font-[var(--font-mono)] text-xs text-text-secondary">
                      #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-text-primary font-medium">{order.userId?.name || '—'}</p>
                        <p className="text-xs text-text-tertiary">{order.shippingAddress?.phone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{formatShortDate(order.createdAt)}</td>
                    <td className="px-4 py-3 text-accent font-semibold font-[var(--font-mono)]">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={order.codCollected ? 'success' : 'warning'} dot>
                        {order.codCollected ? 'Collected' : 'Pending'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {!order.codCollected && (
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<CheckCircle2 size={12} />}
                          onClick={() => handleCollect(order._id)}
                          loading={marking}
                        >
                          Collect
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
