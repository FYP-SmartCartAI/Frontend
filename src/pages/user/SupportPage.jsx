import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { MessageCircle, Plus, X, ChevronDown, AlertCircle } from 'lucide-react'
import { useGetTicketsQuery, useCreateTicketMutation } from '../../store/api/ticketApi'
import { useGetMyOrdersQuery } from '../../store/api/orderApi'
import TicketCard  from '../../components/ticket/TicketCard'
import Spinner     from '../../components/ui/Spinner'
import EmptyState  from '../../components/ui/EmptyState'
import Button      from '../../components/ui/Button'
import Input       from '../../components/ui/Input'
import Modal       from '../../components/ui/Modal'
import toast       from 'react-hot-toast'
import { formatPrice } from '../../utils/formatPrice'

export default function SupportPage() {
  const navigate = useNavigate()
  const [showNew, setShowNew] = useState(false)
  const { data, isLoading }   = useGetTicketsQuery()
  const { data: orderData }   = useGetMyOrdersQuery({ limit: 100 })
  const [createTicket, { isLoading: creating }] = useCreateTicketMutation()

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  const tickets = data?.tickets || []
  const orders  = orderData?.orders || []

  const orderTitle = (o) => `#${o.orderNumber || o._id?.slice(-6).toUpperCase()}`

  const onSubmit = async (form) => {
    try {
      const result = await createTicket({
        ...(form.orderId ? { orderId: form.orderId } : {}),
        subject: form.subject,
        message: form.message,
      }).unwrap()
      toast.success('Ticket created!')
      setShowNew(false)
      reset()
      navigate(`/support/${result._id}`)
    } catch (err) {
      toast.error(err?.data?.message || 'Could not create ticket')
    }
  }

  return (
    <div className="min-h-full p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5"
      >
        <h1
          className="text-2xl font-bold text-text-primary flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <MessageCircle size={20} className="text-accent" />
          Support
        </h1>
        <Button
          variant="gold"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => setShowNew(true)}
        >
          New Ticket
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : tickets.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No support tickets"
          message="Have an issue? Create a ticket and we'll get back to you shortly."
          action={() => setShowNew(true)}
          actionLabel="Create Ticket"
        />
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket._id} ticket={ticket} />
          ))}
        </div>
      )}

      {/* New ticket modal */}
      <Modal
        isOpen={showNew}
        onClose={() => { setShowNew(false); reset() }}
        title="New Support Ticket"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => { setShowNew(false); reset() }}>
              Cancel
            </Button>
            <Button
              variant="gold"
              form="new-ticket-form"
              type="submit"
              loading={creating}
            >
              Submit Ticket
            </Button>
          </>
        }
      >
        <form id="new-ticket-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
              Related Order <span className="text-text-tertiary normal-case">(optional)</span>
            </label>
            <div className="relative flex items-center">
              <select
                className="w-full appearance-none bg-bg-tertiary border border-border rounded-[var(--radius-md)] pl-4 pr-10 py-2.5 text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
                {...register('orderId')}
              >
                <option value="">No specific order</option>
                {orders.map((o) => (
                  <option key={o._id} value={o._id}>
                    {orderTitle(o)} — {formatPrice(o.total)}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 pointer-events-none text-text-secondary">
                <ChevronDown size={16} />
              </div>
            </div>
          </div>

          <Input
            label="Subject"
            placeholder="Brief description of your issue"
            error={errors.subject?.message}
            {...register('subject', { required: 'Subject is required' })}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
              Message
            </label>
            <textarea
              rows={4}
              placeholder="Describe your issue in detail…"
              className="w-full bg-bg-tertiary border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-accent resize-none"
              {...register('message', { required: 'Message is required', minLength: { value: 10, message: 'Min 10 characters' } })}
            />
            {errors.message && (
              <p className="text-xs text-error flex items-center gap-1.5 mt-1 select-none animate-fadeIn">
                <AlertCircle size={13} className="shrink-0 text-error" />
                <span>{errors.message.message}</span>
              </p>
            )}
          </div>
        </form>
      </Modal>
    </div>
  )
}
