import { useDispatch } from 'react-redux'
import { Menu, ShoppingCart, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toggleMobileSidebar } from '../../store/slices/uiSlice'
import { useCart } from '../../hooks/useCart'
import NotificationBell from '../notification/NotificationBell'
import Avatar from '../ui/Avatar'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../utils/cn'
import ThemeToggle from '../ui/ThemeToggle'

export default function Header({ title, onMenuClick }) {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const { cartCount, openCart } = useCart()
  const isStaff = user?.role === 'admin' || user?.role === 'subadmin'

  const handleMenu = () => {
    if (onMenuClick) {
      onMenuClick()
    } else {
      dispatch(toggleMobileSidebar())
    }
  }

  return (
    <header
      className={cn(
        'h-14 px-4 lg:px-6 flex items-center justify-between',
        'bg-bg-secondary border-b border-border',
        'sticky top-0 z-20',
      )}
    >
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleMenu}
          className="text-text-secondary hover:text-accent transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        {title && (
          <h1
            className="text-sm font-semibold text-text-primary hidden sm:block"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h1>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Search + Cart — user-only */}
        {!isStaff && (
          <>
            <button
              onClick={() => navigate('/search')}
              className="w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-text-tertiary hover:text-accent hover:bg-bg-tertiary transition-all"
              aria-label="Search"
            >
              <Search size={17} />
            </button>

            <button
              onClick={openCart}
              className="relative w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-text-tertiary hover:text-accent hover:bg-bg-tertiary transition-all"
              aria-label="Cart"
            >
              <ShoppingCart size={17} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-accent text-bg-primary text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>
          </>
        )}

        <NotificationBell />

        {/* Theme Toggle — visible to everyone */}
        <ThemeToggle />

        {/* Avatar */}
        <button
          onClick={() => navigate(user?.role === 'admin' ? '/admin/profile' : user?.role === 'subadmin' ? '/subadmin/profile' : '/profile')}
          className="ml-1"
          aria-label="Profile"
        >
          <Avatar name={user?.name} src={user?.avatar} size="sm" />
        </button>
      </div>
    </header>
  )
}
