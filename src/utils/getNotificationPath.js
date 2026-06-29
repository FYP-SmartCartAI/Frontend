/** Resolve in-app route for a notification row. */
export function getNotificationPath(notification, userRole) {
  if (!notification) return null

  const { type, refId, refModel } = notification
  const id = refId?._id || refId

  // Tickets
  if (refModel === 'Ticket' || ['ticket_reply', 'new_message', 'ticket_assigned', 'new_ticket', 'unresolved_ticket'].includes(type)) {
    if (userRole === 'subadmin') {
      return id ? `/subadmin/tickets/${id}` : '/subadmin/tickets'
    } else if (userRole === 'admin') {
      return id ? `/admin/tickets/${id}` : '/admin/tickets'
    }
    return id ? `/support/${id}` : '/support'
  }

  // Orders
  if (refModel === 'Order' || ['order_status', 'payment', 'new_order', 'cod_collected_admin'].includes(type)) {
    if (userRole === 'admin') {
      return '/admin/orders'
    } else if (userRole === 'subadmin') {
      return '/subadmin/orders'
    }
    return id ? `/orders/${id}` : '/orders'
  }

  // Inventory/Products (Low stock / Out of stock)
  if (type === 'low_stock' || type === 'out_of_stock') {
    return '/admin/products'
  }

  if (type === 'abandoned_cart') return '/cart'

  return null
}
