import { baseApi } from './baseApi'

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ---- Dashboard Stats ----
    // GET /api/admin/stats
    getDashboardStats: builder.query({
      query: () => '/api/admin/stats',
      providesTags: ['Stats'],
    }),

    // GET /api/admin/stats/revenue?period=
    getRevenueStats: builder.query({
      query: (period = '7d') => ({
        url:    '/api/admin/stats/revenue',
        params: { period },
      }),
      providesTags: [{ type: 'Stats', id: 'REVENUE' }],
    }),

    // ---- Users ----
    // GET /api/admin/users
    getAllUsers: builder.query({
      query: (params = {}) => ({ url: '/api/admin/users', params }),
      transformResponse: (response) => ({
        users:      response?.users || [],
        totalPages: response?.pagination?.pages || 1,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.users.map(({ _id }) => ({ type: 'Users', id: _id })),
              { type: 'Users', id: 'LIST' },
            ]
          : [{ type: 'Users', id: 'LIST' }],
    }),

    // PATCH /api/admin/users/:id/block  (toggles block/unblock)
    blockUser: builder.mutation({
      query: (id) => ({
        url:    `/api/admin/users/${id}/block`,
        method: 'PATCH',
      }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Users', id }, 'Subadmins'],
    }),

    // PATCH /api/admin/users/:id/block  (same toggle endpoint)
    unblockUser: builder.mutation({
      query: (id) => ({
        url:    `/api/admin/users/${id}/block`,
        method: 'PATCH',
      }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Users', id }, 'Subadmins'],
    }),

    // DELETE /api/admin/users/:id
    deleteUser: builder.mutation({
      query: (id) => ({
        url:    `/api/admin/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }, 'Subadmins'],
    }),

    // PATCH /api/admin/users/:id/role
    updateUserRole: builder.mutation({
      query: ({ id, role, city }) => ({
        url:    `/api/admin/users/${id}/role`,
        method: 'PATCH',
        body:   { role, city },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }, 'Subadmins'],
    }),

    // POST /api/admin/users
    createUser: builder.mutation({
      query: (body) => ({
        url:    '/api/admin/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Users', id: 'LIST' }],
    }),

    // ---- Subadmins ----
    // GET /api/admin/subadmins
    getAllSubadmins: builder.query({
      query: () => '/api/admin/subadmins',
      providesTags: ['Subadmins'],
    }),

    // POST /api/admin/subadmins
    createSubadmin: builder.mutation({
      query: (body) => ({
        url:    '/api/admin/users',
        method: 'POST',
        body:   { ...body, role: 'subadmin' },
      }),
      invalidatesTags: ['Subadmins', { type: 'Users', id: 'LIST' }],
    }),

    // DELETE /api/admin/subadmins/:id/demote
    deleteSubadmin: builder.mutation({
      query: (id) => ({
        url:    `/api/admin/subadmins/${id}/demote`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subadmins', { type: 'Users', id: 'LIST' }],
    }),

    // ---- Abandoned Cart Job ----
    // POST /api/admin/cart/trigger-abandoned-check
    triggerAbandonedCartJob: builder.mutation({
      query: () => ({
        url:    '/api/admin/cart/trigger-abandoned-check',
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Stats', id: 'ABANDONED_CART' }],
    }),

    // GET /api/admin/cart/stats
    getAbandonedCartStats: builder.query({
      query: () => '/api/admin/cart/stats',
      providesTags: [{ type: 'Stats', id: 'ABANDONED_CART' }],
    }),

    // ---- Vector Sync ----
    // GET /api/admin/vector-sync/status
    getVectorSyncStatus: builder.query({
      query: () => '/api/admin/vector-sync/status',
      providesTags: [{ type: 'Stats', id: 'VECTOR_SYNC' }],
    }),

    // ---- COD Collection (subadmin) ----
    // GET /api/orders/cod-pending
    getCODCollection: builder.query({
      query: (params = {}) => ({ url: '/api/orders/cod-pending', params }),
      providesTags: [{ type: 'Orders', id: 'COD' }],
    }),

    // PATCH /api/orders/:id/cod-collect
    markCODCollected: builder.mutation({
      query: ({ orderId, ...body }) => ({
        url:    `/api/orders/${orderId}/cod-collect`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [{ type: 'Orders', id: 'COD' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetDashboardStatsQuery,
  useGetRevenueStatsQuery,
  useGetAllUsersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useDeleteUserMutation,
  useCreateUserMutation,
  useUpdateUserRoleMutation,
  useGetAllSubadminsQuery,
  useCreateSubadminMutation,
  useDeleteSubadminMutation,
  useTriggerAbandonedCartJobMutation,
  useGetAbandonedCartStatsQuery,
  useGetVectorSyncStatusQuery,
  useGetCODCollectionQuery,
  useMarkCODCollectedMutation,
} = adminApi
