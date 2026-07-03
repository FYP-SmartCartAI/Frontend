import { baseApi } from './baseApi'

export const flashSaleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/flash-sale/active
    getActiveFlashSale: builder.query({
      query: () => '/api/flash-sale/active',
      providesTags: ['FlashSale'],
    }),

    // GET /api/flash-sale
    getAllFlashSales: builder.query({
      query: () => '/api/flash-sale',
      providesTags: ['FlashSale'],
    }),

    // POST /api/flash-sale
    createFlashSale: builder.mutation({
      query: (body) => ({
        url:    '/api/flash-sale',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['FlashSale'],
    }),

    // PATCH /api/flash-sale/:id/terminate
    terminateFlashSale: builder.mutation({
      query: (id) => ({
        url:    `/api/flash-sale/${id}/terminate`,
        method: 'PATCH',
      }),
      invalidatesTags: ['FlashSale'],
    }),

    // DELETE /api/flash-sale/:id
    deleteFlashSale: builder.mutation({
      query: (id) => ({
        url:    `/api/flash-sale/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['FlashSale'],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetActiveFlashSaleQuery,
  useGetAllFlashSalesQuery,
  useCreateFlashSaleMutation,
  useTerminateFlashSaleMutation,
  useDeleteFlashSaleMutation,
} = flashSaleApi
