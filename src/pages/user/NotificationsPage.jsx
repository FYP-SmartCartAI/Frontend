import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'
import NotificationItem from '../../components/notification/NotificationItem'
import Spinner          from '../../components/ui/Spinner'
import EmptyState       from '../../components/ui/EmptyState'
import Button           from '../../components/ui/Button'

export default function NotificationsPage() {
  const {
    notifications, unreadCount,
    isLoading, markAsRead, markAllRead,
    deleteNotif,
  } = useNotifications()

  return (
    <div className="min-h-full p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5"
      >
        <div className="flex items-center gap-2">
          <h1
            className="text-2xl font-bold text-text-primary"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="bg-accent text-bg-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            icon={<CheckCheck size={14} />}
            onClick={markAllRead}
          >
            Mark all read
          </Button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications"
          message="You're all caught up! Notifications will appear here."
        />
      ) : (
        <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] overflow-hidden">
          <AnimatePresence initial={false}>
            {notifications.map((n) => (
              <div key={n._id} className="border-b border-border last:border-0">
                <NotificationItem
                  notification={n}
                  onRead={markAsRead}
                  onDelete={deleteNotif}
                  variant="full"
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
