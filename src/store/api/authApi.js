import { baseApi } from './baseApi'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // POST /api/auth/register
    register: builder.mutation({
      query: (body) => ({
        url:    '/api/auth/register',
        method: 'POST',
        body,
      }),
    }),

    // POST /api/auth/login
    login: builder.mutation({
      query: (body) => ({
        url:    '/api/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    // POST /api/auth/logout
    logoutApi: builder.mutation({
      query: () => ({
        url:    '/api/auth/logout',
        method: 'POST',
      }),
    }),

    // GET /api/auth/profile
    getProfile: builder.query({
      query: () => '/api/auth/profile',
      providesTags: ['Auth'],
    }),

    // PUT /api/auth/profile
    updateProfile: builder.mutation({
      query: (body) => ({
        url:    '/api/auth/profile',
        method: 'PUT',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),

    // POST /api/auth/forgot-password
    forgotPassword: builder.mutation({
      query: (body) => ({
        url:    '/api/auth/forgot-password',
        method: 'POST',
        body,
      }),
    }),

    // POST /api/auth/reset-password
    resetPassword: builder.mutation({
      query: (body) => ({
        url:    '/api/auth/reset-password',
        method: 'POST',
        body,
      }),
    }),

    // POST /api/auth/change-password
    changePassword: builder.mutation({
      query: (body) => ({
        url:    '/api/auth/change-password',
        method: 'POST',
        body,
      }),
    }),

    // POST /api/auth/avatar  (multipart)
    uploadAvatar: builder.mutation({
      query: (file) => {
        const formData = new FormData()
        formData.append('avatar', file)
        return {
          url:    '/api/auth/avatar',
          method: 'POST',
          body:   formData,
        }
      },
      invalidatesTags: ['Auth'],
    }),

    // GET /api/oauth/google/callback?code=
    oauthCallback: builder.query({
      query: ({ provider, code, state }) =>
        `/api/oauth/${provider}/callback?code=${code}${state ? `&state=${state}` : ''}`,
    }),
  }),
  overrideExisting: false,
})

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutApiMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useUploadAvatarMutation,
  useOauthCallbackQuery,
} = authApi
