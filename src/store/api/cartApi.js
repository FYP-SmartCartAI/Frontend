import { baseApi } from './baseApi'

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/cart
    getCart: builder.query({
      query: () => '/api/cart',
      providesTags: ['Cart'],
    }),

    // POST /api/cart/add
    addToCart: builder.mutation({
      query: (body) => ({
        url:    '/api/cart/add',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),

    // PUT /api/cart/update
    updateCartItem: builder.mutation({
      query: ({ productId, quantity }) => ({
        url:    '/api/cart/update',
        method: 'PUT',
        body:   { productId, quantity },
      }),
      // Optimistic update: reflect the new quantity (and recompute the total)
      // in the cached cart immediately, so the UI feels instant. We don't
      // invalidate the tag here — the optimistic patch mirrors the backend's
      // own total formula, which avoids a refetch and prevents flicker when
      // the user clicks +/- rapidly. Roll back if the request fails.
      async onQueryStarted({ productId, quantity }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            const item = draft?.items?.find(
              (it) => (it.product?._id || it.product) === productId,
            )
            if (!item) return
            item.quantity = quantity
            draft.total = draft.items.reduce(
              (sum, it) => sum + (it.price || 0) * it.quantity, 0,
            )
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),

    // DELETE /api/cart/remove/:productId
    removeFromCart: builder.mutation({
      query: (productId) => ({
        url:    `/api/cart/remove/${productId}`,
        method: 'DELETE',
      }),
      // Optimistically drop the item so it disappears instantly.
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData('getCart', undefined, (draft) => {
            if (!draft?.items) return
            draft.items = draft.items.filter(
              (it) => (it.product?._id || it.product) !== productId,
            )
            draft.total = draft.items.reduce(
              (sum, it) => sum + (it.price || 0) * it.quantity, 0,
            )
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: ['Cart'],
    }),

    // DELETE /api/cart/clear
    clearCart: builder.mutation({
      query: () => ({
        url:    '/api/cart/clear',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    // POST /api/cart/coupon
    applyCoupon: builder.mutation({
      query: (body) => ({
        url:    '/api/cart/coupon',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Cart'],
    }),

    // DELETE /api/cart/coupon
    removeCoupon: builder.mutation({
      query: () => ({
        url:    '/api/cart/coupon',
        method: 'DELETE',
      }),
      invalidatesTags: ['Cart'],
    }),

    // POST /api/cart/verify-stock
    verifyCartStock: builder.mutation({
      query: () => ({
        url:    '/api/cart/verify-stock',
        method: 'POST',
      }),
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
  useApplyCouponMutation,
  useRemoveCouponMutation,
  useVerifyCartStockMutation,
} = cartApi
