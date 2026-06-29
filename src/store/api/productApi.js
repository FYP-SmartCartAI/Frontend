import { baseApi } from './baseApi'

/** RTK arg may be a string (legacy) or { q, r } — always extract the search text. */
const normalizeAiSearchArg = (arg) => {
  if (typeof arg === 'string') return { q: arg.trim(), r: '' }
  if (arg && typeof arg === 'object') {
    const q = typeof arg.q === 'string' ? arg.q.trim() : ''
    return { q, r: String(arg.r ?? '') }
  }
  return { q: '', r: '' }
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/products/facets
    getProductFacets: builder.query({
      query: () => '/api/products/facets',
      transformResponse: (response) => response?.data || response || { brands: [] },
      providesTags: [{ type: 'Products', id: 'FACETS' }],
    }),

    // GET /api/products?page=&limit=&category=&sort=&minPrice=&maxPrice=
    getProducts: builder.query({
      query: (params = {}) => {
        const { search, q, ...rest } = params
        const query = q || search
        return {
          url: '/api/products',
          params: {
            ...rest,
            ...(query ? { q: query } : {}),
          },
        }
      },
      transformResponse: (response) => ({
        products:   response?.products || response || [],
        totalPages: response?.pages || 1,
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.products.map(({ _id }) => ({ type: 'Products', id: _id })),
              { type: 'Products', id: 'LIST' },
            ]
          : [{ type: 'Products', id: 'LIST' }],
    }),

    // GET /api/products/:slug
    getProductBySlug: builder.query({
      query: (slug) => `/api/products/${slug}`,
      providesTags: (result, _e, slug) => [
        { type: 'Products', id: result?.slug || slug },
      ],
    }),

    // GET /api/products/ai-search?q=
    // Arg { q, r } — r is a client-only refresh key so re-submitting the same query refetches.
    aiSearchProducts: builder.query({
      query: (arg) => {
        const { q } = normalizeAiSearchArg(arg)
        return {
          url:    '/api/products/ai-search',
          params: q ? { q } : {},
        }
      },
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { q, r } = normalizeAiSearchArg(queryArgs)
        return `${endpointName}|${q}|${r}`
      },
      transformResponse: (response) => {
        const products = Array.isArray(response)
          ? response
          : (response?.products || response?.data || [])
        return { products, count: products.length }
      },
      keepUnusedDataFor: 0,
    }),

    // GET /api/products/featured
    getFeaturedProducts: builder.query({
      query: () => ({
        url:    '/api/products',
        params: { sortBy: 'rating', limit: 8 }
      }),
      transformResponse: (response) => ({
        products: response?.products || response || [],
      }),
      providesTags: [{ type: 'Products', id: 'FEATURED' }],
    }),

    // POST /api/products  (admin)
    createProduct: builder.mutation({
      query: (body) => ({
        url:    '/api/products',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }, { type: 'Products', id: 'FACETS' }],
    }),

    // PUT /api/products/:slug  (admin)
    updateProduct: builder.mutation({
      query: ({ slug, ...body }) => ({
        url:    `/api/products/${slug}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_r, _e, { slug }) => [
        { type: 'Products', id: slug },
        { type: 'Products', id: 'LIST' },
        { type: 'Products', id: 'FACETS' },
      ],
    }),

    // DELETE /api/products/:slug  (admin)
    deleteProduct: builder.mutation({
      query: (slug) => ({
        url:    `/api/products/${slug}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Products', id: 'LIST' }, { type: 'Products', id: 'FACETS' }],
    }),

    // POST /api/products/:slug/images  (admin — multipart)
    uploadProductImages: builder.mutation({
      query: ({ slug, formData }) => ({
        url:    `/api/products/${slug}/images`,
        method: 'POST',
        body:   formData,
      }),
      invalidatesTags: (_r, _e, { slug }) => [{ type: 'Products', id: slug }],
    }),

    // DELETE /api/products/:slug/images  (admin)
    deleteProductImage: builder.mutation({
      query: ({ slug, url }) => ({
        url:    `/api/products/${slug}/images`,
        method: 'DELETE',
        body:   { url },
      }),
      invalidatesTags: (_r, _e, { slug }) => [{ type: 'Products', id: slug }],
    }),

    // POST /api/products/vector-sync  (admin)
    syncVectors: builder.mutation({
      query: () => ({
        url:    '/api/products/vector-sync',
        method: 'POST',
      }),
    }),
  }),
  overrideExisting: true,
})

export const {
  useGetProductsQuery,
  useGetProductFacetsQuery,
  useGetProductBySlugQuery,
  useAiSearchProductsQuery,
  useGetFeaturedProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImagesMutation,
  useDeleteProductImageMutation,
  useSyncVectorsMutation,
} = productApi

export { useGetProductBySlugQuery as useGetProductByIdQuery }
