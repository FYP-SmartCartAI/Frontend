import { baseApi } from './baseApi'

export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/categories
    getCategories: builder.query({
      query: () => '/api/categories',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ slug }) => ({ type: 'Categories', id: slug })),
              { type: 'Categories', id: 'LIST' },
            ]
          : [{ type: 'Categories', id: 'LIST' }],
    }),

    // GET /api/categories/:slug
    getCategoryBySlug: builder.query({
      query: (slug) => `/api/categories/${slug}`,
      providesTags: (_r, _e, slug) => [{ type: 'Categories', id: slug }],
    }),

    // POST /api/categories  (admin)
    createCategory: builder.mutation({
      query: (body) => ({
        url:    '/api/categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),

    // PUT /api/categories/:slug  (admin)
    updateCategory: builder.mutation({
      query: ({ slug, ...body }) => ({
        url:    `/api/categories/${slug}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { slug }) => [
        { type: 'Categories', id: slug },
        { type: 'Categories', id: 'LIST' },
      ],
    }),

    // DELETE /api/categories/:slug  (admin)
    deleteCategory: builder.mutation({
      query: (slug) => ({
        url:    `/api/categories/${slug}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),

    // POST /api/categories/:slug/subcategories  (admin)
    addSubcategory: builder.mutation({
      query: ({ slug, name }) => ({
        url:    `/api/categories/${slug}/subcategories`,
        method: 'POST',
        body:   { name },
      }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),

    // DELETE /api/categories/:slug/subcategories/:subSlug  (admin)
    deleteSubcategory: builder.mutation({
      query: ({ slug, subSlug }) => ({
        url:    `/api/categories/${slug}/subcategories/${subSlug}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Categories', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetCategoriesQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useAddSubcategoryMutation,
  useDeleteSubcategoryMutation,
} = categoryApi

// Legacy alias — route param is always the category slug
export { useGetCategoryBySlugQuery as useGetCategoryByIdQuery }
