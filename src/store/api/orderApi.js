import { baseApi } from './baseApi'

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/orders/checkout  — place order
    createOrder: builder.mutation({
      query: (body) => ({
        url:    '/api/orders/checkout',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Orders', 'Cart'],
    }),

    // GET /api/orders  — user's orders
    getMyOrders: builder.query({
      query: (params = {}) => ({ url: '/api/orders', params }),
      transformResponse: (response) => {
        if (Array.isArray(response)) {
          return { orders: response, totalPages: 1 }
        }
        return {
          orders:     response?.orders || [],
          totalPages: response?.pages  || 1,
        }
      },
      providesTags: (result) =>
        result?.orders
          ? [
              ...result.orders.map(({ _id }) => ({ type: 'Orders', id: _id })),
              { type: 'Orders', id: 'LIST' },
            ]
          : [{ type: 'Orders', id: 'LIST' }],
    }),

    // GET /api/orders/:id
    getOrderById: builder.query({
      query: (id) => `/api/orders/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Orders', id }],
    }),

    // PUT /api/orders/:id/cancel
    cancelOrder: builder.mutation({
      query: (id) => ({
        url:    `/api/orders/${id}/cancel`,
        method: 'PUT',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Orders', id },
        { type: 'Orders', id: 'LIST' },
      ],
    }),

    // ---- Admin/Subadmin ----

    // GET /api/orders/all
    getAllOrders: builder.query({
      query: (params = {}) => ({ url: '/api/orders/all', params }),
      providesTags: [{ type: 'Orders', id: 'ADMIN_LIST' }],
    }),

    // PUT /api/orders/:id/status
    updateOrderStatus: builder.mutation({
      query: ({ id, status, note }) => ({
        url:    `/api/orders/${id}/status`,
        method: 'PUT',
        body:   { status, note },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Orders', id },
        { type: 'Orders', id: 'ADMIN_LIST' },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useCancelOrderMutation,
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} = orderApi
