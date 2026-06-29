import { baseApi } from './baseApi'

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/payments/create-intent
    initiatePayment: builder.mutation({
      query: (body) => ({
        url:    '/api/payments/create-intent',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Payments', 'Orders'],
    }),

    // GET /api/payments/:orderId
    getPaymentByOrder: builder.query({
      query: (orderId) => `/api/payments/${orderId}`,
      providesTags: (_r, _e, orderId) => [{ type: 'Payments', id: orderId }],
      async onQueryStarted(orderId, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (data?.order?.paymentStatus === 'paid') {
            dispatch(paymentApi.util.invalidateTags([
              { type: 'Orders', id: orderId },
              { type: 'Orders', id: 'LIST' },
            ]))
          }
        } catch { /* sync poll — ignore */ }
      },
    }),

    // GET /api/payments/:orderId  (used to confirm payment status after Stripe redirect)
    verifyPayment: builder.mutation({
      query: ({ orderId }) => ({
        url:    `/api/payments/${orderId}`,
        method: 'GET',
      }),
      invalidatesTags: ['Payments', 'Orders'],
    }),

    // POST /api/payments/dev-confirm/:intentId  (DEV only — confirms intent with pm_card_visa)
    devConfirmPayment: builder.mutation({
      query: (intentId) => ({
        url:    `/api/payments/dev-confirm/${intentId}`,
        method: 'POST',
      }),
      invalidatesTags: ['Payments', 'Orders'],
    }),

    // GET /api/admin/payments  (admin)
    getAllPayments: builder.query({
      query: (params = {}) => ({ url: '/api/admin/payments', params }),
      providesTags: [{ type: 'Payments', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useInitiatePaymentMutation,
  useVerifyPaymentMutation,
  useGetPaymentByOrderQuery,
  useDevConfirmPaymentMutation,
  useGetAllPaymentsQuery,
} = paymentApi
