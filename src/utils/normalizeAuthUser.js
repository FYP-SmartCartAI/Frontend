/**
 * Normalize user objects from login, profile, or OAuth into a consistent shape
 * so role/id are always preserved in Redux + localStorage.
 */
export function normalizeAuthUser(raw) {
  if (!raw) return null

  const id = raw.id ?? raw._id

  return {
    ...raw,
    id:   id ? String(id) : undefined,
    _id:  id ? String(id) : undefined,
    role: raw.role ?? null,
    city: raw.city && String(raw.city).trim()
      ? String(raw.city).trim().toLowerCase()
      : (raw.city ?? null),
    avatar: raw.avatar ?? null,
  }
}
