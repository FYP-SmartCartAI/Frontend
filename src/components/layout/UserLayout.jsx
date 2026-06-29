import { Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import UserSidebar from './UserSidebar'
import Header from './Header'
import CartDrawer from '../cart/CartDrawer'
import { selectMobileSidebar } from '../../store/slices/uiSlice'
import { useDispatch } from 'react-redux'
import { closeMobileSidebar, toggleMobileSidebar } from '../../store/slices/uiSlice'
import { useGetWishlistQuery } from '../../store/api/wishlistApi'
import { useAuth } from '../../hooks/useAuth'

export default function UserLayout() {
  const dispatch       = useDispatch()
  const mobileOpen     = useSelector(selectMobileSidebar)
  const { isAuthenticated } = useAuth()

  // Warm wishlist cache so product hearts stay in sync across pages
  useGetWishlistQuery(undefined, { skip: !isAuthenticated })

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      {/* Sidebar */}
      <UserSidebar
        isOpen={mobileOpen}
        onClose={() => dispatch(closeMobileSidebar())}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => dispatch(toggleMobileSidebar())}
        />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  )
}
