import { useMemo } from 'react'
import { useGetWishlistQuery } from '../store/api/wishlistApi'
import { useAuth } from './useAuth'

/** Set of product IDs currently in the user's wishlist (from RTK cache / API). */
export function useWishlistIds() {
  const { isAuthenticated } = useAuth()
  const { data } = useGetWishlistQuery(undefined, { skip: !isAuthenticated })

  return useMemo(() => {
    const products = data?.wishlist?.products ?? []
    return new Set(products.map((p) => String(p._id ?? p)))
  }, [data])
}

export function useIsWishlisted(productId) {
  const ids = useWishlistIds()
  if (!productId) return false
  return ids.has(String(productId))
}
