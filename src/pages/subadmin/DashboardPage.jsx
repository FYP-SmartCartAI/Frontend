import { motion } from 'framer-motion'
import { ShoppingBag, Ticket, Banknote, TrendingUp, Sparkles, MapPin } from 'lucide-react'
import { useGetDashboardStatsQuery } from '../../store/api/adminApi'
import { useAuth } from '../../hooks/useAuth'
import { StatCardSkeleton } from '../../components/ui/Skeleton'
import { formatPrice } from '../../utils/formatPrice'

const stagger = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.07 } },
}
const fadeUp = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

function StatCard({ icon: Icon, label, value, sub, accent = false }) {
  return (
    <motion.div
      variants={fadeUp}
      className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5 hover:border-accent/30 transition-all hover:shadow-[var(--shadow-gold)]"
    >
      <div className={`w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center mb-3 ${accent ? 'bg-accent/10' : 'bg-bg-tertiary'}`}>
        <Icon size={16} className={accent ? 'text-accent' : 'text-text-secondary'} />
      </div>
      <p className="text-xl sm:text-2xl font-bold text-text-primary mb-1 truncate font-[var(--font-mono)]" title={value}>{value}</p>
      <p className="text-xs text-text-secondary">{label}</p>
      {sub && <p className="text-[10px] text-text-tertiary mt-0.5">{sub}</p>}
    </motion.div>
  )
}

export default function SubadminDashboard() {
  const { user } = useAuth()
  const { data: stats, isLoading } = useGetDashboardStatsQuery()

  return (
    <div className="min-h-full p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-accent" />
          <h1
            className="text-2xl font-bold text-text-primary"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm text-text-secondary">Sub-Admin Operations Panel</p>
          {user?.city && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-medium text-accent">
              <MapPin size={11} />
              {user.city.charAt(0).toUpperCase() + user.city.slice(1)}
            </span>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard icon={ShoppingBag} label="Total Orders"   value={stats?.totalOrders?.toLocaleString() ?? '0'} accent />
          <StatCard icon={Banknote}    label="COD Pending"    value={stats?.codPending?.toLocaleString() ?? '0'} />
          <StatCard icon={Ticket}      label="Open Tickets"   value={stats?.activeTickets?.toLocaleString() ?? '0'} />
          <StatCard icon={TrendingUp}  label="COD Collected"  value={formatPrice(stats?.codCollectedTotal ?? 0)} />
        </motion.div>
      )}
    </div>
  )
}
