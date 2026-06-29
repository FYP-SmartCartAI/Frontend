import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { useGetMyOrdersQuery } from '../../store/api/orderApi'
import { useGetTicketsQuery, useCreateTicketMutation } from '../../store/api/ticketApi'
import OrderCard  from '../../components/order/OrderCard'
import Spinner    from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import toast      from 'react-hot-toast'
import { cn } from '../../utils/cn'

const STATUS_TABS = [
  { value: '',              label: 'All'        },
  { value: 'pending',       label: 'Pending'    },
  { value: 'processing',    label: 'Confirmed'  },
  { value: 'shipped',       label: 'Shipped'    },
  { value: 'delivered',     label: 'Delivered'  },
  { value: 'cancelled',     label: 'Cancelled'  },
  { value: 'cod_collected', label: 'Collected'  },
]

export default function OrdersPage() {
  const navigate            = useNavigate()
  const [status, setStatus] = useState('')
  const [page, setPage]     = useState(1)
  const [chatOrderId, setChatOrderId] = useState(null)

  const { data, isLoading, isError } = useGetMyOrdersQuery({
    status: status || undefined,
    page,
    limit: 10,
  })

  // All of the user's tickets — used to detect an existing ticket per order
  const { data: ticketData } = useGetTicketsQuery()
  const [createTicket] = useCreateTicketMutation()

  const orders     = data?.orders     || []
  const totalPages = data?.totalPages || 1

  // Map orderId → ticketId so repeat clicks reopen the same chat
  const orderTicketMap = (ticketData?.tickets || []).reduce((acc, t) => {
    if (t.orderId) acc[t.orderId] = t._id
    return acc
  }, {})

  const handleChat = async (order, orderTitle) => {
    const existing = orderTicketMap[order._id]
    if (existing) {
      navigate(`/support/${existing}`)
      return
    }
    try {
      setChatOrderId(order._id)
      const ticket = await createTicket({
        orderId: order._id,
        subject: `Order ${orderTitle}`,
        message: `Hi, I need help with my order ${orderTitle}.`,
      }).unwrap()
      navigate(`/support/${ticket._id}`)
    } catch (err) {
      toast.error(err?.data?.message || 'Could not start chat for this order')
    } finally {
      setChatOrderId(null)
    }
  }

  return (
    <div className="min-h-full p-6 max-w-3xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-text-primary mb-5 flex items-center gap-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <Package size={20} className="text-accent" />
        My Orders
      </motion.h1>

      {/* Status tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 mb-5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => { setStatus(tab.value); setPage(1) }}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all shrink-0',
              status === tab.value
                ? 'bg-accent text-bg-primary'
                : 'bg-bg-tertiary text-text-secondary border border-border hover:border-accent hover:text-accent',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : isError ? (
        <div className="text-center py-16">
          <p className="text-error text-sm">Could not load orders.</p>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          message="Once you place an order, it will appear here."
        />
      ) : (
        <>
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                onChat={handleChat}
                chatLoading={chatOrderId === order._id}
              />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}
