import { Outlet } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import AdminSidebar from './AdminSidebar'
import Header from './Header'
import { selectMobileSidebar, closeMobileSidebar, toggleMobileSidebar } from '../../store/slices/uiSlice'

export default function AdminLayout() {
  const dispatch   = useDispatch()
  const mobileOpen = useSelector(selectMobileSidebar)

  return (
    <div className="flex h-screen bg-bg-primary overflow-hidden">
      <AdminSidebar
        isOpen={mobileOpen}
        onClose={() => dispatch(closeMobileSidebar())}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => dispatch(toggleMobileSidebar())} title="Admin" />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
