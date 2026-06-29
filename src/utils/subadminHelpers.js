/** Sub-admin managed city (ticket/order routing) — not address.city */
export function getManagedCity(user) {
  const city = user?.city
  if (!city || typeof city !== 'string') return null
  const trimmed = city.trim()
  return trimmed ? trimmed.toLowerCase() : null
}

export function subadminNeedsCity(user) {
  return user?.role === 'subadmin' && !getManagedCity(user)
}
