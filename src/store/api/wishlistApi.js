import { baseApi } from './baseApi'

const patchWishlistProducts = (draft, productId, add) => {
  if (!draft) return
  if (!draft.wishlist) draft.wishlist = { products: [] }
  const list = draft.wishlist.products ?? (draft.wishlist.products = [])
  const idStr = String(productId)
  if (add) {
    if (!list.some((p) => String(p._id ?? p) === idStr)) {
      list.push({ _id: productId })
    }
  } else {
    draft.wishlist.products = list.filter((p) => String(p._id ?? p) !== idStr)
  }
}

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/wishlist
    getWishlist: builder.query({
      query: () => '/api/wishlist',
      providesTags: ['Wishlist'],
    }),

    // POST /api/wishlist/:productId
    addToWishlist: builder.mutation({
      query: (productId) => ({
        url:    `/api/wishlist/${productId}`,
        method: 'POST',
      }),
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          wishlistApi.util.updateQueryData('getWishlist', undefined, (draft) => {
            patchWishlistProducts(draft, productId, true)
          }),
        )
        try {
          const { data } = await queryFulfilled
          if (data?.wishlist) {
            dispatch(
              wishlistApi.util.updateQueryData('getWishlist', undefined, (draft) => {
                draft.wishlist = data.wishlist
              }),
            )
          }
        } catch (err) {
          if (err?.error?.status === 409) return
          patch.undo()
        }
      },
    }),

    // DELETE /api/wishlist/:productId
    removeFromWishlist: builder.mutation({
      query: (productId) => ({
        url:    `/api/wishlist/${productId}`,
        method: 'DELETE',
      }),
      async onQueryStarted(productId, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          wishlistApi.util.updateQueryData('getWishlist', undefined, (draft) => {
            patchWishlistProducts(draft, productId, false)
          }),
        )
        try {
          const { data } = await queryFulfilled
          if (data?.wishlist) {
            dispatch(
              wishlistApi.util.updateQueryData('getWishlist', undefined, (draft) => {
                draft.wishlist = data.wishlist
              }),
            )
          }
        } catch {
          patch.undo()
        }
      },
    }),

    // DELETE /api/wishlist
    clearWishlist: builder.mutation({
      query: () => ({
        url:    '/api/wishlist',
        method: 'DELETE',
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          wishlistApi.util.updateQueryData('getWishlist', undefined, (draft) => {
            if (draft?.wishlist) draft.wishlist.products = []
          }),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
      invalidatesTags: ['Wishlist'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useClearWishlistMutation,
} = wishlistApi
