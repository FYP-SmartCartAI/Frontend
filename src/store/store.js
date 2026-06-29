import { configureStore } from '@reduxjs/toolkit'
import { baseApi }        from './api/baseApi'
import authReducer        from './slices/authSlice'
import cartReducer        from './slices/cartSlice'
import uiReducer          from './slices/uiSlice'
import searchReducer      from './slices/searchSlice'

export const store = configureStore({
  reducer: {
    // RTK Query cache
    [baseApi.reducerPath]: baseApi.reducer,
    // Feature slices
    auth:   authReducer,
    cart:   cartReducer,
    ui:     uiReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})
