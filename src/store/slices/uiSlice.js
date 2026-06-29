import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    // Sidebar
    sidebarOpen:   true,
    sidebarMobile: false,

    // Active modal: null | string (modal id)
    activeModal:   null,
    modalPayload:  null,

    // Global loading overlay
    globalLoading: false,

    // Theme (future extensibility)
    theme: localStorage.getItem('theme') || 'dark',
  },
  reducers: {
    toggleSidebar:       (state) => { state.sidebarOpen = !state.sidebarOpen },
    openSidebar:         (state) => { state.sidebarOpen = true  },
    closeSidebar:        (state) => { state.sidebarOpen = false },

    toggleMobileSidebar: (state) => { state.sidebarMobile = !state.sidebarMobile },
    closeMobileSidebar:  (state) => { state.sidebarMobile = false },

    openModal: (state, { payload }) => {
      // payload can be a string id or { id, data }
      if (typeof payload === 'string') {
        state.activeModal  = payload
        state.modalPayload = null
      } else {
        state.activeModal  = payload.id
        state.modalPayload = payload.data ?? null
      }
    },
    closeModal: (state) => {
      state.activeModal  = null
      state.modalPayload = null
    },

    setGlobalLoading: (state, { payload }) => {
      state.globalLoading = payload
    },

    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem('theme', state.theme)
    },
  },
})

export const {
  toggleSidebar,
  openSidebar,
  closeSidebar,
  toggleMobileSidebar,
  closeMobileSidebar,
  openModal,
  closeModal,
  setGlobalLoading,
  toggleTheme,
} = uiSlice.actions

export default uiSlice.reducer

// Selectors
export const selectSidebarOpen   = (state) => state.ui.sidebarOpen
export const selectMobileSidebar = (state) => state.ui.sidebarMobile
export const selectActiveModal   = (state) => state.ui.activeModal
export const selectModalPayload  = (state) => state.ui.modalPayload
