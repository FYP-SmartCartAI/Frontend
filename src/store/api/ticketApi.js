import { baseApi } from './baseApi'

export const ticketApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/tickets
    createTicket: builder.mutation({
      query: (body) => ({
        url:    '/api/tickets',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Tickets'],
    }),

    // GET /api/tickets  (user sees their own; admin/subadmin see all)
    getTickets: builder.query({
      query: (params = {}) => ({ url: '/api/tickets', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.tickets.map(({ _id }) => ({ type: 'Tickets', id: _id })),
              { type: 'Tickets', id: 'LIST' },
            ]
          : [{ type: 'Tickets', id: 'LIST' }],
    }),

    // GET /api/tickets/:id
    getTicketById: builder.query({
      query: (id) => `/api/tickets/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Tickets', id }],
    }),

    // POST /api/tickets/:id/messages
    addMessage: builder.mutation({
      query: ({ ticketId, ...body }) => ({
        url:    `/api/tickets/${ticketId}/messages`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { ticketId }) => [
        { type: 'Tickets', id: ticketId },
      ],
    }),

    // PATCH /api/tickets/:id/close  (subadmin for their city, or admin)
    closeTicket: builder.mutation({
      query: (id) => ({
        url:    `/api/tickets/${id}/close`,
        method: 'PATCH',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Tickets', id },
        { type: 'Tickets', id: 'LIST' },
      ],
    }),

    // PATCH /api/tickets/:id/reassign  (admin only)
    reassignTicket: builder.mutation({
      query: ({ id, subadminId }) => ({
        url:    `/api/tickets/${id}/reassign`,
        method: 'PATCH',
        body:   { subadminId },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Tickets', id }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateTicketMutation,
  useGetTicketsQuery,
  useGetTicketByIdQuery,
  useAddMessageMutation,
  useCloseTicketMutation,
  useReassignTicketMutation,
} = ticketApi
