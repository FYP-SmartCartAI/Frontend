import { useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingCart, Play, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useGetAbandonedCartStatsQuery, useTriggerAbandonedCartJobMutation } from '../../store/api/adminApi'
import Button  from '../../components/ui/Button'
import { StatCardSkeleton } from '../../components/ui/Skeleton'
import { formatPrice } from '../../utils/formatPrice'
import { formatDateTime } from '../../utils/formatDate'
import toast   from 'react-hot-toast'

export default function AdminAbandonedCartPage() {
  const { data: stats, isLoading }  = useGetAbandonedCartStatsQuery()
  const [triggerJob, { isLoading: triggering }] = useTriggerAbandonedCartJobMutation()
  const [lastMessages, setLastMessages] = useState(null)

  const handleTrigger = async () => {
    try {
      const result = await triggerJob().unwrap()
      setLastMessages(result?.messages ?? [])
      const sent = result?.notificationsSent ?? 0
      const found = result?.cartsFound ?? 0
      if (found === 0) {
        toast('No active carts to recover', { icon: 'ℹ️' })
      } else if (sent === 0) {
        toast(`Processed ${found} cart(s) — no reminders delivered (check FCM tokens)`, { icon: '⚠️' })
      } else {
        toast.success(`Sent ${sent} reminder${sent === 1 ? '' : 's'} — see AI messages below`)
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to trigger job')
    }
  }

  return (
    <div className="min-h-full p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <ShoppingCart size={20} className="text-accent" />
          Abandoned Cart Recovery
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Monitor abandoned carts and trigger email recovery campaigns.
        </p>

        {/* Stats */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Abandoned Carts',    value: stats?.totalAbandoned },
              { label: 'Potential Revenue',  value: formatPrice(stats?.potentialRevenue) },
              { label: 'Recovery Rate',      value: `${stats?.recoveryRate || 0}%` },
              { label: 'Reminders Sent (30d)', value: stats?.emailsSent },
            ].map((s) => (
              <div
                key={s.label}
                className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-4 hover:border-accent/20 transition-all"
              >
                <p className="text-xl font-bold text-accent font-[var(--font-mono)]">{s.value ?? '—'}</p>
                <p className="text-xs text-text-tertiary mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Job status + trigger */}
        <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5 mb-4">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Recovery Job</h2>

          {stats?.lastRun && (
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 size={14} className="text-success shrink-0" />
              <p className="text-xs text-text-secondary">
                Last run: {formatDateTime(stats.lastRun)}
              </p>
            </div>
          )}

          <p className="text-xs text-text-secondary mb-4">
            The cron job runs on a schedule and only targets carts idle for{' '}
            {stats?.idleMinutes != null ? (
              <span className="text-accent font-medium">{stats.idleMinutes} min</span>
            ) : (
              'the configured window'
            )}
            . Manual trigger sends reminders immediately for every non-empty cart — no wait required.
          </p>

          <Button
            variant="gold"
            size="md"
            icon={<Play size={14} />}
            onClick={handleTrigger}
            loading={triggering}
          >
            Trigger Recovery Job
          </Button>
        </div>

        {lastMessages?.length > 0 && (
          <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5 mb-4">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Last AI messages</h2>
            <div className="space-y-3">
              {lastMessages.map((m, i) => (
                <div
                  key={`${m.cartId}-${i}`}
                  className="p-3 rounded-[var(--radius-md)] bg-bg-tertiary border border-border"
                >
                  <p className="text-xs text-text-tertiary mb-1">
                    {m.userName} · {m.source} · {m.products?.join(', ')}
                  </p>
                  <p className="text-sm text-text-primary leading-relaxed">{m.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-4 bg-accent/5 border border-accent/15 rounded-[var(--radius-md)]">
          <p className="text-xs text-text-secondary">
            <span className="text-accent font-medium">How it works:</span> Users who add items to cart but don&apos;t complete checkout
            within {stats?.idleMinutes ?? 2} minutes of inactivity are flagged as abandoned when the recovery job runs.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
