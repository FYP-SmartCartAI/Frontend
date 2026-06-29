import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, Tag, ShoppingBag, Users,
  UserCog, Ticket, Database, ShoppingCart,
  LogOut, X, Sparkles, ChevronRight, Bell, User
} from 'lucide-react'
import { cn } from '../../utils/cn'
import { useAuth } from '../../hooks/useAuth'
import { useNotifications } from '../../hooks/useNotifications'
import Avatar from '../ui/Avatar'

const NAV_ITEMS = [
  { to: '/admin/dashboard',      label: 'Dashboard',       icon: LayoutDashboard },
  { to: '/admin/products',       label: 'Products',        icon: Package         },
  { to: '/admin/categories',     label: 'Categories',      icon: Tag             },
  { to: '/admin/orders',         label: 'Orders',          icon: ShoppingBag     },
  { to: '/admin/users',          label: 'Users',           icon: Users           },
  { to: '/admin/subadmins',      label: 'Sub-Admins',      icon: UserCog         },
  { to: '/admin/tickets',        label: 'Support Tickets', icon: Ticket          },
  { to: '/admin/notifications',  label: 'Notifications',   icon: Bell, badge: 'notif' },
  { to: '/admin/vector-sync',    label: 'Vector Sync',     icon: Database        },
  { to: '/admin/abandoned-cart', label: 'Abandoned Cart',  icon: ShoppingCart    },
  { to: '/admin/profile',        label: 'My Profile',      icon: User            },
]

export default function AdminSidebar({ isOpen, onClose }) {
  const { user, logout } = useAuth()
  const { unreadCount }  = useNotifications()
  const navigate         = useNavigate()

  return (
    <>
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

      <motion.aside
        initial={false}
        animate={{ x: isOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        className={cn(
          'fixed left-0 top-0 z-40 h-full w-64',
          'bg-bg-secondary border-r border-border flex flex-col',
          'lg:translate-x-0 lg:static lg:z-auto lg:!transform-none',
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-accent rounded-[var(--radius-sm)] flex items-center justify-center">
              <Sparkles size={14} className="text-bg-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                SmartCart<span className="text-accent"> AI</span>
              </p>
              <p className="text-[10px] text-text-tertiary uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-text-tertiary hover:text-accent">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {NAV_ITEMS.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-md)]',
                  'text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'text-text-secondary hover:bg-bg-tertiary hover:text-text-primary border border-transparent',
                )
              }
              onClick={() => window.innerWidth < 1024 && onClose?.()}
            >
              <Icon size={16} className="shrink-0" />
              <span className="flex-1">{label}</span>
              {badge === 'notif' && unreadCount > 0 && (
                <span className="min-w-[18px] h-[18px] bg-accent text-bg-primary text-[10px] font-bold rounded-full flex items-center justify-center px-1 shrink-0">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
              <ChevronRight size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <div
            className="flex items-center gap-3 px-2 py-2 mb-1 cursor-pointer rounded-[var(--radius-md)] hover:bg-bg-tertiary transition-colors"
            onClick={() => navigate('/admin/profile')}
          >
            <Avatar name={user?.name} src={user?.avatar} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
              <p className="text-[10px] text-accent uppercase tracking-widest">Administrator</p>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] text-sm text-text-tertiary hover:text-error hover:bg-error/10 transition-all"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}
