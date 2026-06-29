export const ROLES = {
  USER:     'user',
  SUBADMIN: 'subadmin',
  ADMIN:    'admin',
}

export const isAdmin    = (role) => role === ROLES.ADMIN
export const isSubadmin = (role) => role === ROLES.SUBADMIN
export const isUser     = (role) => role === ROLES.USER

export const isAdminOrSubadmin = (role) =>
  role === ROLES.ADMIN || role === ROLES.SUBADMIN

export const getRoleDashboardPath = (role) => {
  switch (role) {
    case ROLES.ADMIN:    return '/admin/dashboard'
    case ROLES.SUBADMIN: return '/subadmin/dashboard'
    default:             return '/'
  }
}

export const getRoleLabel = (role) => {
  switch (role) {
    case ROLES.ADMIN:    return 'Administrator'
    case ROLES.SUBADMIN: return 'Sub-Admin'
    default:             return 'Customer'
  }
}
