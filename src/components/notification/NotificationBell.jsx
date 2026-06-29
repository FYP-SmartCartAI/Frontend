import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../hooks/useNotifications'
import { useAuth } from '../../hooks/useAuth'
import NotificationItem from './NotificationItem'
import Spinner from '../ui/Spinner'
import { cn } from '../../utils/cn'

export default function NotificationBell() {
  const [open, setOpen]   = useState(false)
  const panelRef          = useRef(null)
  const navigate          = useNavigate()
  const { user }          = useAuth()

  const notificationsPath = user?.role === 'admin' ? '/admin/notifications'
                          : user?.role === 'subadmin' ? '/subadmin/notifications'
                          : '/notifications'

  const {
    notifications, unreadCount,
    isLoading, markAsRead, markAllRead,
  } = useNotifications()

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const preview = notifications.slice(0, 5)

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'relative w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)]',
          'text-text-tertiary hover:text-accent hover:bg-bg-tertiary transition-all',
          open && 'text-accent bg-bg-tertiary',
        )}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell size={17} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-accent text-bg-primary text-[9px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute right-0 top-full mt-2 z-50',
              'w-80 bg-bg-secondary border border-border-accent',
              'rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]',
              'overflow-hidden',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-sm font-semibold text-text-primary">Notifications</span>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="text-xs text-accent hover:text-accent-light transition-colors flex items-center gap-1 px-1"
                    title="Mark all as read"
                  >
                    <CheckCheck size={13} />
                    All read
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="text-text-tertiary hover:text-text-primary transition-colors p-1"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Spinner size="sm" />
                </div>
              ) : preview.length > 0 ? (
                <>
                  {preview.map((n) => (
                    <NotificationItem
                      key={n._id}
                      notification={n}
                      onRead={markAsRead}
                      onNavigate={() => setOpen(false)}
                      variant="preview"
                    />
                  ))}
                </>
              ) : (
                <div className="text-center py-8">
                  <Bell size={24} className="text-border-accent mx-auto mb-2" strokeWidth={1.5} />
                  <p className="text-sm text-text-tertiary">No notifications</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-border px-4 py-2">
                <button
                  onClick={() => { setOpen(false); navigate(notificationsPath) }}
                  className="text-xs text-accent hover:text-accent-light transition-colors"
                >
                  View all notifications →
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
