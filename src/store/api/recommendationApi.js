import { baseApi } from './baseApi'

export const recommendationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/recommendations
    // Returns AI-powered personalized product recommendations
    getRecommendations: builder.query({
      query: (params = {}) => ({ url: '/api/recommendations', params }),
      transformResponse: (response) => ({
        products: response || [],
      }),
      providesTags: ['Recommendations'],
    }),

    // GET /api/recommendations/similar/:productId
    getSimilarProducts: builder.query({
      query: (productId) => `/api/recommendations/similar/${productId}`,
      transformResponse: (response) => ({
        products: response || [],
      }),
      providesTags: (_r, _e, productId) => [
        { type: 'Recommendations', id: productId },
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useGetRecommendationsQuery,
  useGetSimilarProductsQuery,
} = recommendationApi
