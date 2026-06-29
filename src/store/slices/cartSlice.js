import { createSlice } from '@reduxjs/toolkit'

// cartSlice manages local UI cart state (optimistic counts, drawer open/close)
// Source of truth for cart items comes from RTK Query (cartApi)
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    isDrawerOpen: false,
    itemCount:    0,
    // Optimistic local items used before API resolves
    localItems:   [],
  },
  reducers: {
    openCartDrawer:  (state) => { state.isDrawerOpen = true  },
    closeCartDrawer: (state) => { state.isDrawerOpen = false },
    toggleCartDrawer:(state) => { state.isDrawerOpen = !state.isDrawerOpen },

    // Called when server cart data loads — sync count
    syncCartCount: (state, { payload: count }) => {
      state.itemCount = count
    },

    // Optimistic increment/decrement (real update comes from cartApi mutation)
    incrementCount: (state) => { state.itemCount += 1 },
    decrementCount: (state) => {
      state.itemCount = Math.max(0, state.itemCount - 1)
    },

    clearCart: (state) => {
      state.itemCount  = 0
      state.localItems = []
    },
  },
})

export const {
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
  syncCartCount,
  incrementCount,
  decrementCount,
  clearCart,
} = cartSlice.actions

export default cartSlice.reducer

// Selectors
export const selectCartOpen  = (state) => state.cart.isDrawerOpen
export const selectCartCount = (state) => state.cart.itemCount
