import { baseApi } from './baseApi'

export const behaviorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/behavior
    // Logs user behavior events for the recommendation engine
    logBehavior: builder.mutation({
      query: (body) => ({
        url:    '/api/behaviors',
        method: 'POST',
        body,
      }),
      // No tag invalidation — fire-and-forget analytics call
    }),
  }),
  overrideExisting: false,
})

export const { useLogBehaviorMutation } = behaviorApi
