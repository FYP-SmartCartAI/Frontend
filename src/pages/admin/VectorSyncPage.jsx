import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Database, RefreshCw, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { useGetVectorSyncStatusQuery } from '../../store/api/adminApi'
import { useSyncVectorsMutation }      from '../../store/api/productApi'
import Button  from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import { formatDateTime } from '../../utils/formatDate'
import toast   from 'react-hot-toast'

export default function AdminVectorSyncPage() {
  const [pollingInterval, setPollingInterval] = useState(0)
  const { data: status, isLoading, refetch } = useGetVectorSyncStatusQuery(undefined, {
    pollingInterval,
  })
  const [syncVectors, { isLoading: syncing }] = useSyncVectorsMutation()

  useEffect(() => {
    if (status?.status === 'running') {
      setPollingInterval(3000)
    } else {
      setPollingInterval(0)
    }
  }, [status?.status])

  const handleSync = async () => {
    try {
      await syncVectors().unwrap()
      toast.success('Vector sync started!')
      refetch()
    } catch (err) {
      toast.error(err?.data?.message || 'Sync failed')
    }
  }

  const syncStatus = status?.status || 'idle'

  const StatusIcon = () => {
    if (syncing || syncStatus === 'running') return <Spinner size="sm" />
    if (syncStatus === 'completed') return <CheckCircle2 size={18} className="text-success" />
    if (syncStatus === 'failed')    return <AlertCircle  size={18} className="text-error" />
    return <Clock size={18} className="text-text-tertiary" />
  }

  return (
    <div className="min-h-full p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1
          className="text-2xl font-bold text-text-primary mb-2 flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <Database size={20} className="text-accent" />
          Vector Sync
        </h1>
        <p className="text-sm text-text-secondary mb-6">
          Sync product embeddings for AI search and user taste profiles for recommendations.
          Run this after adding or updating products, or when user behavior has changed.
        </p>

        {/* Status card */}
        <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5 mb-5">
          <h2 className="text-xs text-text-tertiary uppercase tracking-widest font-medium mb-4">
            Sync Status
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-8"><Spinner size="lg" /></div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <StatusIcon />
                <div>
                  <p className="text-sm font-semibold text-text-primary capitalize">
                    {syncStatus === 'running' ? 'Sync in progress…' : syncStatus}
                  </p>
                  {status?.lastSync && (
                    <p className="text-xs text-text-tertiary mt-0.5">
                      Last sync: {formatDateTime(status.lastSync)}
                    </p>
                  )}
                </div>
              </div>

              {status?.totalProducts != null && (
                <div className="space-y-4 pt-2 border-t border-border">
                  <div>
                    <p className="text-[10px] text-text-tertiary uppercase tracking-widest mb-2">Products</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Total', value: status.totalProducts },
                        { label: 'Synced', value: status.syncedProducts },
                        { label: 'Pending', value: status.pendingProducts },
                      ].map((s) => (
                        <div key={s.label} className="text-center py-3 bg-bg-tertiary rounded-[var(--radius-md)]">
                          <p className="text-xl font-bold text-accent font-[var(--font-mono)]">{s.value ?? '—'}</p>
                          <p className="text-xs text-text-tertiary mt-1">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {status?.totalEligibleUsers != null && (
                    <div>
                      <p className="text-[10px] text-text-tertiary uppercase tracking-widest mb-2">
                        User profiles <span className="normal-case tracking-normal">(5+ behavior logs)</span>
                      </p>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: 'Eligible', value: status.totalEligibleUsers },
                          { label: 'Synced', value: status.syncedUserProfiles },
                          { label: 'Pending', value: status.pendingUserProfiles },
                        ].map((s) => (
                          <div key={s.label} className="text-center py-3 bg-bg-tertiary rounded-[var(--radius-md)]">
                            <p className="text-xl font-bold text-accent font-[var(--font-mono)]">{s.value ?? '—'}</p>
                            <p className="text-xs text-text-tertiary mt-1">{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {status?.error && (
                <div className="flex items-start gap-2 px-3 py-2.5 bg-error/10 border border-error/20 rounded-[var(--radius-md)]">
                  <AlertCircle size={14} className="text-error shrink-0 mt-0.5" />
                  <p className="text-xs text-error">{status.error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <Button
          variant="gold"
          size="lg"
          icon={<RefreshCw size={15} className={syncing ? 'animate-spin' : ''} />}
          onClick={handleSync}
          loading={syncing}
          disabled={syncStatus === 'running'}
        >
          {syncing || syncStatus === 'running' ? 'Syncing…' : 'Start Vector Sync'}
        </Button>

        <div className="mt-5 p-4 bg-accent/5 border border-accent/15 rounded-[var(--radius-md)]">
          <p className="text-xs text-text-secondary">
            <span className="text-accent font-medium">Note:</span> This syncs product vectors (default Pinecone namespace)
            and user taste profiles (Pinecone <code className="text-accent">user-profiles</code> namespace).
            Users need at least 5 behavior logs before a profile is embedded. New user actions mark profiles as pending automatically.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
