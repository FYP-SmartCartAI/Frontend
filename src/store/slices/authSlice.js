import { createSlice } from '@reduxjs/toolkit'
import { normalizeAuthUser } from '../../utils/normalizeAuthUser'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            JSON.parse(localStorage.getItem('sc_user')) || null,
    token:           localStorage.getItem('sc_token') || null,
    isAuthenticated: !!localStorage.getItem('sc_token'),
  },
  reducers: {
    setCredentials: (state, { payload: { user, token } }) => {
      state.user            = normalizeAuthUser(user)
      state.token           = token
      state.isAuthenticated = true
      localStorage.setItem('sc_token', token)
      localStorage.setItem('sc_user', JSON.stringify(state.user))
    },
    updateUser: (state, { payload }) => {
      state.user = normalizeAuthUser({ ...state.user, ...payload })
      localStorage.setItem('sc_user', JSON.stringify(state.user))
    },
    logout: (state) => {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      localStorage.removeItem('sc_token')
      localStorage.removeItem('sc_user')
    },
  },
})

export const { setCredentials, updateUser, logout } = authSlice.actions
export default authSlice.reducer

// Selectors
export const selectCurrentUser  = (state) => state.auth.user
export const selectToken        = (state) => state.auth.token
export const selectIsAuth       = (state) => state.auth.isAuthenticated
export const selectUserRole     = (state) => state.auth.user?.role || null
