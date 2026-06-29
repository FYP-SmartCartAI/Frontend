import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home, Search, ShoppingCart, Heart, Package,
  Bell, MessageCircle, User, LogOut, X, Sparkles,
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAuth } from '../../hooks/useAuth'
import { useCart } from '../../hooks/useCart'
import { useNotifications } from '../../hooks/useNotifications'
import Avatar from '../ui/Avatar'

const NAV_ITEMS = [
  { to: '/',             label: 'Home',          icon: Home        },
  { to: '/search',       label: 'AI Search',     icon: Sparkles, badge: 'AI' },
  { to: '/cart',         label: 'Cart',           icon: ShoppingCart, badge: 'cart' },
  { to: '/orders',       label: 'My Orders',      icon: Package     },
  { to: '/wishlist',     label: 'Wishlist',       icon: Heart       },
  { to: '/notifications',label: 'Notifications',  icon: Bell, badge: 'notif' },
  { to: '/support',      label: 'Support',        icon: MessageCircle },
  { to: '/profile',      label: 'Profile',        icon: User        },
]

export default function UserSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const { cartCount }    = useCart()
  const { unreadCount }  = useNotifications()
  const navigate         = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-64',
          'bg-bg-secondary border-r border-border',
          'flex flex-col',
          'lg:translate-x-0 lg:static lg:z-auto lg:!transform-none',
        )}
      >
        {/* Logo area */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-[var(--radius-sm)] flex items-center justify-center">
              <Sparkles size={14} className="text-bg-primary" />
            </div>
            <span
              className="text-base font-semibold text-text-primary"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              SmartCart<span className="text-accent"> AI</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden text-text-tertiary hover:text-accent transition-colors"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, badge }) => {
            const badgeCount =
              badge === 'cart'  ? cartCount   :
              badge === 'notif' ? unreadCount : null

            return (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]',
                    'text-sm font-medium transition-all duration-150 group',
                    isActive
                      ? 'bg-accent/10 text-accent border border-accent/20'
                      : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary border border-transparent',
                  )
                }
                onClick={() => window.innerWidth < 1024 && onClose?.()}
              >
                <Icon size={16} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {badge === 'AI' && (
                  <span className="text-[10px] font-semibold bg-accent/20 text-accent px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    AI
                  </span>
                )}
                {badgeCount > 0 && (
                  <span className="min-w-[18px] h-[18px] bg-accent text-bg-primary text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User footer */}
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <Avatar name={user?.name} src={user?.avatar} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
              <p className="text-xs text-text-tertiary truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)]',
              'text-sm text-text-tertiary hover:text-error hover:bg-error/10',
              'transition-all duration-150',
            )}
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}
