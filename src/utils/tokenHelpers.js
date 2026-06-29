const TOKEN_KEY = 'sc_token'
const USER_KEY  = 'sc_user'

export const getToken  = ()        => localStorage.getItem(TOKEN_KEY)
export const setToken  = (token)   => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = ()       => localStorage.removeItem(TOKEN_KEY)

export const getUser  = ()        => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY))
  } catch {
    return null
  }
}
export const setUser  = (user)    => localStorage.setItem(USER_KEY, JSON.stringify(user))
export const clearUser = ()       => localStorage.removeItem(USER_KEY)

export const isTokenExpired = (token) => {
  if (!token) return true
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}
