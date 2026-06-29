import { baseApi } from './baseApi'

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/notifications
    getNotifications: builder.query({
      query: (params = {}) => ({ url: '/api/notifications', params }),
      providesTags: ['Notifications'],
    }),

    // GET /api/notifications/unread-count
    getUnreadCount: builder.query({
      query: () => '/api/notifications/unread-count',
      providesTags: [{ type: 'Notifications', id: 'COUNT' }],
    }),

    // PATCH /api/notifications/:id/read
    markAsRead: builder.mutation({
      query: (id) => ({
        url:    `/api/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // PATCH /api/notifications/read-all
    markAllAsRead: builder.mutation({
      query: () => ({
        url:    '/api/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // DELETE /api/notifications/:id
    deleteNotification: builder.mutation({
      query: (id) => ({
        url:    `/api/notifications/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} = notificationApi
