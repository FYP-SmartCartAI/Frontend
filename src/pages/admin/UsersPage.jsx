import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Search, UserX, UserCheck, Trash2, Plus, UserCog, ShieldCheck, ChevronDown } from 'lucide-react'
import {
  useGetAllUsersQuery,
  useBlockUserMutation,
  useUnblockUserMutation,
  useDeleteUserMutation,
  useCreateUserMutation,
  useDeleteSubadminMutation,
  useUpdateUserRoleMutation,
} from '../../store/api/adminApi'
import Avatar        from '../../components/ui/Avatar'
import Badge         from '../../components/ui/Badge'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import Pagination    from '../../components/ui/Pagination'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import EmptyState    from '../../components/ui/EmptyState'
import { formatShortDate } from '../../utils/formatDate'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'
import { getPasswordValidationError, PASSWORD_HINT, PASSWORD_PLACEHOLDER } from '../../utils/passwordHelpers'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import { PAKISTAN_CITIES } from '../../constants/pakistanCities'

const ROLE_BADGE = {
  admin:    'gold',
  subadmin: 'info',
  user:     'muted',
}

const ROLE_LABEL = {
  admin:    'Admin',
  subadmin: 'Sub-Admin',
  user:     'User',
}

export default function AdminUsersPage() {
  const [search, setSearch]     = useState('')
  const [page, setPage]         = useState(1)
  const [delId, setDelId]       = useState(null)
  const debSearch               = useDebounce(search, 400)

  // Create user modal
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [name, setName]           = useState('')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [role, setRole]           = useState('user')
  const [city, setCity]           = useState('')

  // Change role modal
  const [roleTarget, setRoleTarget]   = useState(null)   // { _id, name, role, city }
  const [newRole, setNewRole]         = useState('user')
  const [newCity, setNewCity]         = useState('')

  const { data, isLoading }     = useGetAllUsersQuery({ search: debSearch, page, limit: 15 })
  const [blockUser,   { isLoading: blocking }]   = useBlockUserMutation()
  const [unblockUser, { isLoading: unblocking }] = useUnblockUserMutation()
  const [deleteUser,  { isLoading: deleting }]   = useDeleteUserMutation()
  const [createUser,  { isLoading: creating }]   = useCreateUserMutation()
  const [demoteSubadmin, { isLoading: demoting }] = useDeleteSubadminMutation()
  const [updateRole,  { isLoading: updatingRole }] = useUpdateUserRoleMutation()

  const users      = data?.users      || []
  const totalPages = data?.totalPages || 1

  // ── Handlers ────────────────────────────────────────────────────────────────

  const openRoleModal = (user) => {
    setRoleTarget(user)
    setNewRole(user.role)
    setNewCity(user.city || '')
  }

  const handleRoleChange = async (e) => {
    e.preventDefault()
    if (!roleTarget) return
    try {
      await updateRole({ id: roleTarget._id, role: newRole, city: newRole === 'subadmin' ? newCity : undefined }).unwrap()
      toast.success(`${roleTarget.name}'s role changed to ${ROLE_LABEL[newRole]}`)
      setRoleTarget(null)
      setNewCity('')
    } catch (err) {
      toast.error(err?.data?.message || 'Could not change role')
    }
  }

  const handleAddUser = async (e) => {
    e.preventDefault()
    const passwordError = getPasswordValidationError(password)
    if (passwordError) { toast.error(passwordError); return }
    try {
      await createUser({ name, email, password, role, city: role === 'subadmin' ? city : null }).unwrap()
      toast.success('User created successfully')
      setIsAddOpen(false)
      setName(''); setEmail(''); setPassword(''); setRole('user'); setCity('')
    } catch (err) {
      const msg = err?.data?.errors?.[0] || err?.data?.message || 'Failed to create user'
      const cleanMsg = typeof msg === 'string'
        ? msg.replace(/['\"]/g, '').charAt(0).toUpperCase() + msg.replace(/['\"]/g, '').slice(1)
        : msg
      toast.error(cleanMsg)
    }
  }

  const handleDemoteSubadmin = async (userId) => {
    try {
      await demoteSubadmin(userId).unwrap()
      toast.success('Sub-admin role removed')
    } catch (err) {
      toast.error(err?.data?.message || 'Could not remove sub-admin role')
    }
  }

  const handleToggleBlock = async (user) => {
    if (user.role === 'admin') return
    try {
      if (user.isBlocked) {
        await unblockUser(user._id).unwrap()
        toast.success('User unblocked')
      } else {
        await blockUser(user._id).unwrap()
        toast.success('User blocked')
      }
    } catch {
      toast.error('Action failed')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(delId).unwrap()
      toast.success('User deleted')
      setDelId(null)
    } catch {
      toast.error('Could not delete user')
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-full p-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5"
      >
        <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
          Users
        </h1>
        <div className="flex items-center gap-3">
          <Button variant="gold" size="sm" icon={<Plus size={14} />} onClick={() => setIsAddOpen(true)}>
            Add User
          </Button>
          <div className="relative w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Search users…"
              className="w-full bg-bg-tertiary border border-border rounded-[var(--radius-md)] pl-8 pr-4 py-2 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-accent"
            />
          </div>
        </div>
      </motion.div>

      <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['User', 'Email', 'Role', 'City', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-text-tertiary uppercase tracking-wider font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 10 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                : users.length === 0
                ? (<tr><td colSpan={7} className="py-16"><EmptyState icon={Users} title="No users found" /></td></tr>)
                : users.map((user) => (
                  <tr key={user._id} className="border-b border-border last:border-0 hover:bg-bg-tertiary transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={user.name} src={user.avatar} size="xs" />
                        <span className="font-medium text-text-primary">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={ROLE_BADGE[user.role] || 'muted'}>
                        {ROLE_LABEL[user.role] || user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs capitalize">
                      {user.role === 'subadmin' ? user.city || '—' : '—'}
                    </td>
                    <td className="px-4 py-3 text-text-secondary text-xs">{formatShortDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.isBlocked ? 'error' : 'success'} dot>
                        {user.isBlocked ? 'Blocked' : 'Active'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* Change Role */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => openRoleModal(user)}
                            className="p-1.5 rounded text-text-tertiary hover:text-accent transition-colors"
                            title="Change role"
                          >
                            <ShieldCheck size={13} />
                          </button>
                        )}
                        {/* Block / Unblock */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBlock(user)}
                            disabled={blocking || unblocking}
                            className={`p-1.5 rounded transition-colors ${user.isBlocked ? 'text-text-tertiary hover:text-success' : 'text-text-tertiary hover:text-warning'}`}
                            title={user.isBlocked ? 'Unblock' : 'Block'}
                          >
                            {user.isBlocked ? <UserCheck size={13} /> : <UserX size={13} />}
                          </button>
                        )}
                        {/* Demote sub-admin shortcut */}
                        {user.role === 'subadmin' && (
                          <button
                            onClick={() => handleDemoteSubadmin(user._id)}
                            disabled={demoting}
                            className="p-1.5 rounded text-text-tertiary hover:text-warning transition-colors"
                            title="Demote to User"
                          >
                            <UserCog size={13} />
                          </button>
                        )}
                        {/* Delete */}
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => setDelId(user._id)}
                            className="p-1.5 rounded text-text-tertiary hover:text-error transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-end mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* ── Delete confirm ─────────────────────────────────────────────────── */}
      <ConfirmDialog
        isOpen={!!delId}
        onClose={() => setDelId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete user?"
        message="This will permanently delete the user account and all associated data."
      />

      {/* ── Change Role modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={!!roleTarget}
        onClose={() => { setRoleTarget(null); setNewCity('') }}
        title="Change User Role"
        size="sm"
      >
        {roleTarget && (
          <form onSubmit={handleRoleChange} className="space-y-4">
            {/* User info */}
            <div className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-bg-tertiary border border-border">
              <Avatar name={roleTarget.name} src={roleTarget.avatar} size="sm" />
              <div>
                <p className="text-sm font-medium text-text-primary">{roleTarget.name}</p>
                <p className="text-xs text-text-tertiary">{roleTarget.email}</p>
              </div>
              <Badge variant={ROLE_BADGE[roleTarget.role] || 'muted'} className="ml-auto shrink-0">
                {ROLE_LABEL[roleTarget.role] || roleTarget.role}
              </Badge>
            </div>

            {/* Role selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                New Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['user', 'subadmin', 'admin'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => { setNewRole(r); if (r !== 'subadmin') setNewCity('') }}
                    className={`py-2 px-3 rounded-[var(--radius-md)] text-xs font-semibold border transition-all capitalize
                      ${newRole === r
                        ? 'bg-accent text-bg-primary border-accent'
                        : 'bg-bg-tertiary text-text-secondary border-border hover:border-accent/50'
                      }`}
                  >
                    {ROLE_LABEL[r]}
                  </button>
                ))}
              </div>
            </div>

            {/* City — only for subadmin */}
            {newRole === 'subadmin' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                  Assigned City
                </label>
                <div className="relative">
                  <select
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    required
                    className="w-full appearance-none bg-bg-tertiary text-text-primary border border-border rounded-[var(--radius-md)] pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-accent capitalize cursor-pointer"
                  >
                    <option value="" disabled>Select a city</option>
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c.toLowerCase()}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown
                    size={15}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary"
                  />
                </div>
              </div>
            )}

            {/* Warning for admin promotion */}
            {newRole === 'admin' && (
              <div className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-warning/10 border border-warning/30">
                <ShieldCheck size={14} className="text-warning mt-0.5 shrink-0" />
                <p className="text-xs text-warning">
                  Promoting to Admin grants full system access including user management, product control, and all admin features.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button variant="ghost" type="button" onClick={() => { setRoleTarget(null); setNewCity('') }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gold"
                loading={updatingRole}
                disabled={newRole === roleTarget.role && newCity === (roleTarget.city || '')}
              >
                Save Role
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Add User modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Create New Account"
        size="md"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="e.g. John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. john@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder={PASSWORD_PLACEHOLDER}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="text-xs text-text-tertiary -mt-2">{PASSWORD_HINT}</p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-bg-tertiary text-text-primary border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 hover:border-border-accent transition-all duration-200"
            >
              <option value="user">User</option>
              <option value="subadmin">Sub-Admin</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {role === 'subadmin' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                Assigned City
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full bg-bg-tertiary text-text-primary border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm focus:outline-none focus:border-accent capitalize cursor-pointer"
              >
                <option value="" disabled>Select a city</option>
                {PAKISTAN_CITIES.map((c) => (
                  <option key={c} value={c.toLowerCase()}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" loading={creating}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
