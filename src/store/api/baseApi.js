import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { getToken } from '../../utils/tokenHelpers'
import { logout } from '../slices/authSlice'
import { BACKEND_URL } from '../../config/api'

// Base query with JWT injection
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: BACKEND_URL,
  prepareHeaders: (headers) => {
    const token = getToken()
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return headers
  },
})

// Wrapper that handles 401 → auto-logout
const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await baseQueryWithAuth(args, api, extraOptions)
  
  const url = typeof args === 'string' ? args : args?.url || ''
  const isAuthRoute =
    url.includes('/login') ||
    url.includes('/register') ||
    url.includes('/reset-password') ||
    url.includes('/change-password')

  if (result.error?.status === 401 && !isAuthRoute) {
    api.dispatch(logout())
    window.location.href = '/login'
  }

  if (result.error?.status === 403 && !isAuthRoute) {
    const message = result.error?.data?.message
    if (message?.includes('account has been suspended')) {
      api.dispatch(logout())
      window.location.href = '/login?error=account_blocked'
    }
  }
  // Globally unwrap backend envelope { success: true, data: ... }
  if (result.data && result.data.success === true && result.data.data !== undefined) {
    result.data = result.data.data
  }
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Auth',
    'Products',
    'Cart',
    'Orders',
    'Payments',
    'Reviews',
    'Categories',
    'Notifications',
    'Wishlist',
    'Tickets',
    'Recommendations',
    'Behaviors',
    'Admin',
    'Users',
    'Subadmins',
    'Stats',
    'FlashSale',
  ],
  endpoints: () => ({}),
})
