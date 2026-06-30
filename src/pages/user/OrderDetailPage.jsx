import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Package, MapPin, CreditCard, AlertCircle, MessageCircle, XCircle } from 'lucide-react'
import { useGetOrderByIdQuery, useCancelOrderMutation } from '../../store/api/orderApi'
import { useGetTicketsQuery, useCreateTicketMutation } from '../../store/api/ticketApi'
import OrderStatusBadge from '../../components/order/OrderStatusBadge'
import OrderTimeline    from '../../components/order/OrderTimeline'
import Skeleton         from '../../components/ui/Skeleton'
import Button           from '../../components/ui/Button'
import ConfirmDialog    from '../../components/ui/ConfirmDialog'
import toast            from 'react-hot-toast'
import ProductImage from '../../components/product/ProductImage'
import { formatPrice }  from '../../utils/formatPrice'
import { formatShortDate } from '../../utils/formatDate'

const CANCELLABLE_STATUSES = ['pending', 'confirmed', 'processing']

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  const { data, isLoading, isError } = useGetOrderByIdQuery(id)
  const [cancelOrder, { isLoading: cancelling }] = useCancelOrderMutation()

  const order = data?.order || data

  const { data: ticketData } = useGetTicketsQuery()
  const [createTicket, { isLoading: chatLoading }] = useCreateTicketMutation()

  const handleChat = async () => {
    const orderTitle = `#${order.orderNumber || order._id?.slice(-6).toUpperCase()}`
    const existing = (ticketData?.tickets || []).find((t) => t.orderId === order._id)
    if (existing) {
      navigate(`/support/${existing._id}`)
      return
    }
    try {
      const ticket = await createTicket({
        orderId: order._id,
        subject: `Order ${orderTitle}`,
        message: `Hi, I need help with my order ${orderTitle}.`,
      }).unwrap()
      navigate(`/support/${ticket._id}`)
    } catch (err) {
      toast.error(err?.data?.message || 'Could not start chat for this order')
    }
  }

  const handleCancel = async () => {
    try {
      await cancelOrder(id).unwrap()
      toast.success('Order cancelled')
      setShowCancelConfirm(false)
    } catch (err) {
      toast.error(err?.data?.message || 'Could not cancel order')
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-60 w-full" />
      </div>
    )
  }

  if (isError || !order) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle size={36} className="text-error" />
        <p className="text-text-secondary">Order not found.</p>
        <Link to="/orders"><Button variant="ghost" icon={<ChevronLeft size={15} />}>Back</Button></Link>
      </div>
    )
  }

  const status           = order.status?.toLowerCase()
  const isCodCollected   =
    order.paymentStatus === 'cod_collected' ||
    (order.paymentMethod === 'cod' && status === 'cod_collected')
  const isPaidStripe     = order.paymentMethod === 'stripe' && order.paymentStatus === 'paid'
  const canCancel        = CANCELLABLE_STATUSES.includes(status) && status !== 'cancelled'
  const canCompletePayment =
    order.paymentMethod === 'stripe' &&
    ['pending', 'failed'].includes(order.paymentStatus) &&
    status !== 'cancelled'

  const goToPayment = () => navigate(`/payment?orderId=${order._id}`)

  return (
    <div className="min-h-full p-6 max-w-3xl mx-auto">
      {/* Back */}
      <Link to="/orders" className="inline-flex items-center gap-1 text-xs text-text-tertiary hover:text-accent transition-colors mb-4">
        <ChevronLeft size={13} /> My Orders
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1
              className="text-xl font-bold text-text-primary"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              Order #{order.orderNumber || order._id?.slice(-6).toUpperCase()}
            </h1>
            <p className="text-sm text-text-tertiary mt-1">
              Placed on {formatShortDate(order.createdAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <OrderStatusBadge status={order.status} />
            <Button
              variant="ghost"
              size="sm"
              icon={<MessageCircle size={14} />}
              loading={chatLoading}
              onClick={handleChat}
            >
              Chat about order
            </Button>
            {canCancel && !isPaidStripe && (
              <Button
                variant="danger"
                size="sm"
                icon={<XCircle size={14} />}
                onClick={() => setShowCancelConfirm(true)}
              >
                Cancel Order
              </Button>
            )}
          </div>
        </div>

        {canCancel && isPaidStripe && (
          <div className="flex items-start gap-2 px-4 py-3 bg-warning/10 border border-warning/20 rounded-[var(--radius-md)] text-sm text-text-secondary">
            <AlertCircle size={16} className="text-warning shrink-0 mt-0.5" />
            <p>
              This order has already been paid. To cancel or request a refund, please{' '}
              <button
                type="button"
                onClick={handleChat}
                className="text-accent hover:underline"
              >
                contact support
              </button>.
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
            <Package size={14} className="text-accent" /> Order Progress
          </h2>
          <OrderTimeline
            currentStatus={order.status}
            statusHistory={order.statusHistory}
          />
        </div>

        {/* Items */}
        <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items?.map((item, idx) => {
              const qty  = item.qty ?? item.quantity ?? 1
              const name = item.name || item.product?.name
              const img  = item.image || item.product?.images?.[0]
              return (
                <div key={item._id || item.product?._id || idx} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[var(--radius-md)] overflow-hidden bg-bg-tertiary border border-border shrink-0">
                    <ProductImage
                      productName={name}
                      backendImages={img ? [img] : []}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{name}</p>
                    <p className="text-xs text-text-tertiary">Qty: {qty}</p>
                  </div>
                  <p className="text-sm font-semibold text-accent shrink-0 font-[var(--font-mono)]">
                    {formatPrice(item.price * qty)}
                  </p>
                </div>
              )
            })}
          </div>
          <div className="border-t border-border mt-4 pt-3 flex justify-between">
            <span className="text-sm font-semibold text-text-primary">Total</span>
            <span className="text-lg font-bold text-accent font-[var(--font-mono)]">
              {formatPrice(order.total)}
            </span>
          </div>
        </div>

        {/* Shipping + Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-4">
            <h2 className="text-xs font-semibold text-text-primary mb-3 flex items-center gap-1.5 uppercase tracking-widest">
              <MapPin size={12} className="text-accent" /> Shipping Address
            </h2>
            {order.shippingAddress ? (
              <div className="text-sm text-text-secondary space-y-0.5">
                <p>{order.shippingAddress.fullName}</p>
                <p>{order.shippingAddress.address}</p>
                <p><span className="capitalize">{order.shippingAddress.city}</span>, {order.shippingAddress.postalCode}</p>
                <p>{order.shippingAddress.phone}</p>
              </div>
            ) : <p className="text-sm text-text-tertiary">—</p>}
          </div>

          {canCompletePayment ? (
            <button
              type="button"
              onClick={goToPayment}
              className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-4 text-left w-full cursor-pointer transition-colors hover:border-accent/50 hover:bg-bg-tertiary group"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-text-primary flex items-center gap-1.5 uppercase tracking-widest">
                  <CreditCard size={12} className="text-accent" /> Payment
                </h2>
                <ChevronRight size={14} className="text-text-tertiary group-hover:text-accent transition-colors" />
              </div>
              <p className="text-sm text-text-secondary capitalize">{order.paymentMethod}</p>
              <p className="text-xs text-text-tertiary mt-1">
                Status:{' '}
                <span className="text-warning">
                  {order.paymentStatus === 'failed' ? 'Failed' : 'Pending'}
                </span>
              </p>
              <p className="text-xs text-accent mt-2">Tap to complete payment</p>
            </button>
          ) : (
            <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-4">
              <h2 className="text-xs font-semibold text-text-primary mb-3 flex items-center gap-1.5 uppercase tracking-widest">
                <CreditCard size={12} className="text-accent" /> Payment
              </h2>
              <p className="text-sm text-text-secondary capitalize">{order.paymentMethod}</p>
              <p className="text-xs text-text-tertiary mt-1">
                Status:{' '}
                <span className={
                  order.paymentStatus === 'paid' || isCodCollected
                    ? 'text-success'
                    : 'text-warning'
                }>
                  {order.paymentStatus === 'paid'
                    ? 'Paid'
                    : isCodCollected
                      ? 'Collected'
                      : order.paymentStatus === 'cod_pending'
                        ? 'COD Pending'
                        : 'Pending'}
                </span>
              </p>
            </div>
          )}
        </div>
      </motion.div>

      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        loading={cancelling}
        title="Cancel this order?"
        message="Your order will be cancelled and the items will be returned to stock. This cannot be undone."
        confirmLabel="Yes, Cancel Order"
        cancelLabel="Keep Order"
      />
    </div>
  )
}
