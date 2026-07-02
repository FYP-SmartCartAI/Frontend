import { motion } from 'framer-motion'
import {
  TrendingUp, Package, Users, ShoppingBag,
  DollarSign, BarChart3, Sparkles,
} from 'lucide-react'
import { useGetDashboardStatsQuery, useGetRevenueStatsQuery } from '../../store/api/adminApi'
import { StatCardSkeleton } from '../../components/ui/Skeleton'
import { formatPrice, formatCompact } from '../../utils/formatPrice'

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
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center ${accent ? 'bg-accent/10' : 'bg-bg-tertiary'}`}>
          <Icon size={16} className={accent ? 'text-accent' : 'text-text-secondary'} />
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
        {value}
      </p>
      <p className="text-xs text-text-secondary">{label}</p>
      {sub && <p className="text-[10px] text-text-tertiary mt-0.5">{sub}</p>}
    </motion.div>
  )
}

export default function AdminDashboard() {
  const { data: stats, isLoading }   = useGetDashboardStatsQuery()
  const { data: revenue }            = useGetRevenueStatsQuery('30d')

  const chartData = revenue?.byDay?.map((d) => ({
    label: d.date,
    value: d.revenue,
  })) || []

  return (
    <div className="min-h-full p-6">
      {/* Header */}
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
            Dashboard
          </h1>
        </div>
        <p className="text-sm text-text-secondary">
          Welcome back here's what's happening today.
        </p>
      </motion.div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard icon={DollarSign}   label="Total Revenue"  value={formatPrice(stats?.totalRevenue)}   accent />
          <StatCard icon={ShoppingBag}  label="Total Orders"   value={stats?.totalOrders?.toLocaleString()}   />
          <StatCard icon={Package}      label="Total Products"  value={stats?.totalProducts?.toLocaleString()}  />
          <StatCard icon={Users}        label="Total Users"    value={stats?.totalUsers?.toLocaleString()}     />
          <StatCard icon={TrendingUp}   label="Orders Today"   value={stats?.ordersToday?.toLocaleString()}    accent />
          <StatCard icon={DollarSign}   label="Revenue Today"  value={formatPrice(stats?.revenueToday)}   />
          <StatCard icon={ShoppingBag}  label="Pending Orders" value={stats?.pendingOrders?.toLocaleString()}  />
          <StatCard icon={Package}      label="Low Stock"      value={stats?.lowStock?.toLocaleString()}       />
        </motion.div>
      )}

      {/* Revenue chart placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
            <BarChart3 size={14} className="text-accent" />
            Revenue (Last 30 days)
          </h2>
          <span
            className="text-xl font-bold text-accent"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {formatPrice(revenue?.total || stats?.totalRevenue)}
          </span>
        </div>

        {/* Simple bar chart using div widths */}
        {chartData.length > 0 ? (
          <div className="flex gap-1 h-24">
            {chartData.map((d, i) => {
              const max = Math.max(...chartData.map((x) => x.value), 1)
              const h   = Math.max(4, (d.value / max) * 100)
              return (
                <div key={i} className="flex-1 h-full flex flex-col justify-end items-center">
                  <div
                    className="w-full bg-accent/20 hover:bg-accent/40 transition-colors rounded-t-sm"
                    style={{ height: `${h}%` }}
                    title={`${d.label}: ${formatPrice(d.value)}`}
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center">
            <p className="text-xs text-text-tertiary">No revenue data available</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
