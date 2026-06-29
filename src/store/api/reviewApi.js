import { baseApi } from './baseApi'

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/reviews/:productId
    getProductReviews: builder.query({
      query: ({ productId, params = {} }) => ({
        url:    `/api/reviews/${productId}`,
        params,
      }),
      providesTags: (_r, _e, { productId }) => [
        { type: 'Reviews', id: productId },
      ],
    }),

    // POST /api/reviews/:productId
    createReview: builder.mutation({
      query: ({ productId, ...body }) => ({
        url:    `/api/reviews/${productId}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { productId }) => [
        { type: 'Reviews', id: productId },
        { type: 'Products', id: productId },
      ],
    }),

    // PUT /api/reviews/:reviewId
    updateReview: builder.mutation({
      query: ({ reviewId, productId, ...body }) => ({
        url:    `/api/reviews/${reviewId}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { productId }) => {
        const tags = ['Reviews']
        if (productId) {
          tags.push({ type: 'Products', id: productId })
          tags.push({ type: 'Reviews', id: productId })
        }
        return tags
      },
    }),

    // DELETE /api/reviews/:reviewId
    deleteReview: builder.mutation({
      query: ({ reviewId }) => ({
        url:    `/api/reviews/${reviewId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { productId }) => {
        const tags = ['Reviews']
        if (productId) {
          tags.push({ type: 'Products', id: productId })
          tags.push({ type: 'Reviews', id: productId })
        }
        return tags
      },
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetProductReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi
