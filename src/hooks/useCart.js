import { useDispatch, useSelector } from 'react-redux'
import {
  openCartDrawer,
  closeCartDrawer,
  toggleCartDrawer,
  selectCartOpen,
  selectCartCount,
  syncCartCount,
} from '../store/slices/cartSlice'
import {
  useGetCartQuery,
  useAddToCartMutation,
  useRemoveFromCartMutation,
  useUpdateCartItemMutation,
  useClearCartMutation,
} from '../store/api/cartApi'
import { useEffect } from 'react'
import { useAuth }   from './useAuth'

export const useCart = () => {
  const dispatch    = useDispatch()
  const { isAuthenticated } = useAuth()
  const isOpen      = useSelector(selectCartOpen)
  const cartCount   = useSelector(selectCartCount)

  const { data: cart, isLoading, isError } = useGetCartQuery(undefined, {
    skip: !isAuthenticated,
  })

  const [addToCart,      { isLoading: addingToCart    }] = useAddToCartMutation()
  const [removeItem,     { isLoading: removingItem    }] = useRemoveFromCartMutation()
  const [updateItem,     { isLoading: updatingItem    }] = useUpdateCartItemMutation()
  const [clearCartApi,   { isLoading: clearingCart    }] = useClearCartMutation()

  // Keep redux count in sync with server cart
  useEffect(() => {
    if (cart?.items) {
      const count = cart.items.reduce((sum, item) => sum + item.quantity, 0)
      dispatch(syncCartCount(count))
    }
  }, [cart, dispatch])

  return {
    cart,
    cartCount,
    isOpen,
    isLoading,
    isError,
    isWorking: addingToCart || removingItem || updatingItem || clearingCart,

    openCart:   () => dispatch(openCartDrawer()),
    closeCart:  () => dispatch(closeCartDrawer()),
    toggleCart: () => dispatch(toggleCartDrawer()),

    addToCart:   (body)                  => addToCart(body).unwrap(),
    removeItem:  (productId)             => removeItem(productId).unwrap(),
    updateItem:  (productId, quantity)   => updateItem({ productId, quantity }).unwrap(),
    clearCart:   ()                      => clearCartApi().unwrap(),
  }
}
