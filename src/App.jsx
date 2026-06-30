import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Layouts
import PublicLayout    from './components/layout/PublicLayout'
import UserLayout      from './components/layout/UserLayout'
import AdminLayout     from './components/layout/AdminLayout'
import SubadminLayout  from './components/layout/SubadminLayout'

// Guards
import ProtectedRoute     from './components/guards/ProtectedRoute'
import RoleRoute          from './components/guards/RoleRoute'
import StaffHomeRedirect  from './components/guards/StaffHomeRedirect'
import { useSessionBootstrap } from './hooks/useSessionBootstrap'
import GlobalLoader from './components/ui/GlobalLoader'
import { FullPageSpinner } from './components/ui/Spinner'

// Auth pages
import LoginPage          from './pages/auth/LoginPage'
import RegisterPage       from './pages/auth/RegisterPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage  from './pages/auth/ResetPasswordPage'
import OAuthCallbackPage  from './pages/oauth/OAuthCallbackPage'

// User pages
import HomePage          from './pages/user/HomePage'
import SearchPage        from './pages/user/SearchPage'
import ProductDetailPage from './pages/user/ProductDetailPage'
import CategoryPage      from './pages/user/CategoryPage'
import CartPage          from './pages/user/CartPage'
import CheckoutPage      from './pages/user/CheckoutPage'
import PaymentPage       from './pages/user/PaymentPage'
import OrdersPage        from './pages/user/OrdersPage'
import OrderDetailPage   from './pages/user/OrderDetailPage'
import WishlistPage      from './pages/user/WishlistPage'
import NotificationsPage from './pages/user/NotificationsPage'
import SupportPage       from './pages/user/SupportPage'
import TicketDetailPage  from './pages/user/TicketDetailPage'
import ProfilePage       from './pages/user/ProfilePage'

// Admin pages
import AdminDashboard    from './pages/admin/DashboardPage'
import AdminProducts     from './pages/admin/ProductsPage'
import AdminProductForm  from './pages/admin/ProductFormPage'
import AdminCategories   from './pages/admin/CategoriesPage'
import AdminOrders       from './pages/admin/OrdersPage'
import AdminUsers        from './pages/admin/UsersPage'
import AdminSubadmins    from './pages/admin/SubadminsPage'
import AdminTickets      from './pages/admin/TicketsPage'
import AdminVectorSync   from './pages/admin/VectorSyncPage'
import AdminAbandonedCart from './pages/admin/AbandonedCartPage'

// Subadmin pages
import SubadminDashboard    from './pages/subadmin/DashboardPage'
import SubadminOrders       from './pages/subadmin/OrdersPage'
import SubadminCOD          from './pages/subadmin/CODCollectionPage'
import SubadminTickets      from './pages/subadmin/TicketsPage'

export default function App() {
  const theme = useSelector((state) => state.ui.theme)

  // Refresh role from server + clear expired tokens on every app load
  const { isBootstrapping } = useSessionBootstrap()

  useEffect(() => {
    const root = window.document.documentElement
    if (theme === 'light') {
      root.classList.add('light')
      root.classList.remove('dark')
    } else {
      root.classList.add('dark')
      root.classList.remove('light')
    }
  }, [theme])

  if (isBootstrapping) {
    return <FullPageSpinner />
  }

  return (
    <BrowserRouter>
      <GlobalLoader />
      <Routes>
        {/* ---- Public routes (no auth required) ---- */}
        <Route element={<PublicLayout />}>
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/register"        element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password"  element={<ResetPasswordPage />} />
        </Route>

        {/* OAuth callback */}
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

        {/* ---- User routes ---- */}
        <Route
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index path="/" element={<StaffHomeRedirect><HomePage /></StaffHomeRedirect>} />
          <Route path="/search"                  element={<SearchPage />} />
          <Route path="/products/:slug"            element={<ProductDetailPage />} />
          <Route path="/categories/:slug"          element={<CategoryPage />} />
          <Route path="/cart"                    element={<CartPage />} />
          <Route path="/checkout"                element={<CheckoutPage />} />
          <Route path="/payment"                 element={<PaymentPage />} />
          <Route path="/orders"                  element={<OrdersPage />} />
          <Route path="/orders/:id"              element={<OrderDetailPage />} />
          <Route path="/wishlist"                element={<WishlistPage />} />
          <Route path="/notifications"           element={<NotificationsPage />} />
          <Route path="/support"                 element={<SupportPage />} />
          <Route path="/support/:id"             element={<TicketDetailPage />} />
          <Route path="/profile"                 element={<ProfilePage />} />
        </Route>

        {/* ---- Admin routes ---- */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['admin']}>
                <AdminLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard"      element={<AdminDashboard />} />
          <Route path="products"       element={<AdminProducts />} />
          <Route path="products/new"   element={<AdminProductForm />} />
          <Route path="products/:slug"   element={<AdminProductForm />} />
          <Route path="categories"     element={<AdminCategories />} />
          <Route path="orders"         element={<AdminOrders />} />
          <Route path="users"          element={<AdminUsers />} />
          <Route path="subadmins"      element={<AdminSubadmins />} />
          <Route path="tickets"        element={<AdminTickets />} />
          <Route path="tickets/:id"    element={<TicketDetailPage />} />
          <Route path="vector-sync"    element={<AdminVectorSync />} />
          <Route path="abandoned-cart" element={<AdminAbandonedCart />} />
          <Route path="notifications"  element={<NotificationsPage />} />
          <Route path="profile"        element={<ProfilePage />} />
        </Route>

        {/* ---- Subadmin routes ---- */}
        <Route
          path="/subadmin"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['subadmin']}>
                <SubadminLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/subadmin/dashboard" replace />} />
          <Route path="dashboard"      element={<SubadminDashboard />} />
          <Route path="orders"         element={<SubadminOrders />} />
          <Route path="cod-collection" element={<SubadminCOD />} />
          <Route path="tickets"        element={<SubadminTickets />} />
          <Route path="tickets/:id"    element={<TicketDetailPage />} />
          <Route path="notifications"  element={<NotificationsPage />} />
          <Route path="profile"        element={<ProfilePage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
