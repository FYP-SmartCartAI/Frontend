import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserCog, Plus, Trash2, ChevronDown, AlertCircle, UserX, UserCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  useGetAllSubadminsQuery,
  useCreateSubadminMutation,
  useDeleteSubadminMutation,
  useDeleteUserMutation,
  useBlockUserMutation,
  useUnblockUserMutation,
} from '../../store/api/adminApi'
import Avatar        from '../../components/ui/Avatar'
import Button        from '../../components/ui/Button'
import Input         from '../../components/ui/Input'
import Modal         from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Spinner       from '../../components/ui/Spinner'
import EmptyState    from '../../components/ui/EmptyState'
import { formatShortDate } from '../../utils/formatDate'
import { PAKISTAN_CITIES } from '../../constants/pakistanCities'
import { passwordFieldRules, PASSWORD_PLACEHOLDER } from '../../utils/passwordHelpers'
import PasswordRequirements from '../../components/ui/PasswordRequirements'
import toast from 'react-hot-toast'

export default function AdminSubadminsPage() {
  const { data: subadmins = [], isLoading } = useGetAllSubadminsQuery()
  const [createSubadmin, { isLoading: creating }] = useCreateSubadminMutation()
  const [demoteSubadmin, { isLoading: demoting }] = useDeleteSubadminMutation()
  const [deleteUser, { isLoading: deleting }] = useDeleteUserMutation()
  const [blockUser, { isLoading: blocking }] = useBlockUserMutation()
  const [unblockUser, { isLoading: unblocking }] = useUnblockUserMutation()

  const [showCreate, setShowCreate] = useState(false)
  const [demoteId, setDemoteId]     = useState(null)
  const [deleteId, setDeleteId]     = useState(null)

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm()
  const createPassword = watch('password') || ''

  const onSubmit = async (data) => {
    try {
      await createSubadmin(data).unwrap()
      toast.success('Sub-admin created')
      setShowCreate(false)
      reset()
    } catch (err) {
      const msg = err?.data?.errors?.[0] || err?.data?.message || 'Failed to create sub-admin'
      const cleanMsg = typeof msg === 'string'
        ? msg.replace(/['"]/g, '').charAt(0).toUpperCase() + msg.replace(/['"]/g, '').slice(1)
        : msg
      toast.error(cleanMsg)
    }
  }

  const handleDemote = async () => {
    try {
      await demoteSubadmin(demoteId).unwrap()
      toast.success('Sub-admin role removed')
      setDemoteId(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Could not remove sub-admin role')
    }
  }

  const handleDelete = async () => {
    try {
      await deleteUser(deleteId).unwrap()
      toast.success('Sub-admin account deleted')
      setDeleteId(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Could not delete sub-admin')
    }
  }

  const handleToggleBlock = async (sub) => {
    try {
      if (sub.isBlocked) {
        await unblockUser(sub._id).unwrap()
        toast.success('Sub-admin unblocked')
      } else {
        await blockUser(sub._id).unwrap()
        toast.success('Sub-admin blocked')
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Action failed')
    }
  }

  const list = subadmins?.subadmins || subadmins

  return (
    <div className="min-h-full p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-5"
      >
        <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
          Sub-Admins
        </h1>
        <Button variant="gold" size="sm" icon={<Plus size={14} />} onClick={() => { setShowCreate(true); reset() }}>
          Add Sub-Admin
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !list.length ? (
        <EmptyState icon={UserCog} title="No sub-admins" message="Create sub-admins to manage orders and tickets." />
      ) : (
        <div className="space-y-2">
          {list.map((sub) => (
            <motion.div
              key={sub._id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 px-4 py-3 bg-bg-secondary border border-border rounded-[var(--radius-lg)] hover:border-accent/20 transition-all"
            >
              <Avatar name={sub.name} src={sub.avatar} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{sub.name}</p>
                <p className="text-xs text-text-secondary">{sub.email}</p>
              </div>
              {sub.city && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 capitalize">
                  {sub.city}
                </span>
              )}
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${sub.isBlocked ? 'bg-error/10 text-error border-error/20' : 'bg-success/10 text-success border-success/20'}`}>
                {sub.isBlocked ? 'Blocked' : 'Active'}
              </span>
              <p className="text-xs text-text-tertiary">{formatShortDate(sub.createdAt)}</p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleBlock(sub)}
                  disabled={blocking || unblocking}
                  className={`p-1.5 rounded transition-colors ${sub.isBlocked ? 'text-text-tertiary hover:text-success' : 'text-text-tertiary hover:text-warning'}`}
                  title={sub.isBlocked ? 'Unblock' : 'Block'}
                >
                  {sub.isBlocked ? <UserCheck size={13} /> : <UserX size={13} />}
                </button>
                <button
                  onClick={() => setDemoteId(sub._id)}
                  className="p-1.5 text-text-tertiary hover:text-accent transition-colors"
                  title="Remove sub-admin role"
                >
                  <UserCog size={13} />
                </button>
                <button
                  onClick={() => setDeleteId(sub._id)}
                  className="p-1.5 text-text-tertiary hover:text-error transition-colors"
                  title="Delete account"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showCreate}
        onClose={() => { setShowCreate(false); reset() }}
        title="Create New Account"
        size="md"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            error={errors.name?.message}
            {...register('name', { required: 'Name is required' })}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. john@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' }
            })}
          />

          <div>
            <Input
              label="Password"
              type="password"
              placeholder={PASSWORD_PLACEHOLDER}
              error={errors.password?.message}
              {...register('password', passwordFieldRules)}
            />
            <PasswordRequirements password={createPassword} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
              Assigned City
            </label>
            <div className="relative flex items-center">
              <select
                className="w-full appearance-none bg-bg-tertiary border border-border rounded-[var(--radius-md)] pl-4 pr-10 py-2.5 text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
                defaultValue=""
                {...register('city', { required: 'Assigned City is required' })}
              >
                <option value="" disabled>Select a city</option>
                {PAKISTAN_CITIES.map((c) => (
                  <option key={c} value={c.toLowerCase()}>{c}</option>
                ))}
              </select>
              <div className="absolute right-4 pointer-events-none text-text-secondary">
                <ChevronDown size={16} />
              </div>
            </div>
            {errors.city && (
              <p className="text-xs text-error flex items-center gap-1.5 mt-1 select-none animate-fadeIn">
                <AlertCircle size={13} className="shrink-0 text-error" />
                <span>{errors.city.message}</span>
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button variant="ghost" onClick={() => { setShowCreate(false); reset() }}>
              Cancel
            </Button>
            <Button type="submit" variant="gold" loading={creating}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!demoteId}
        onClose={() => setDemoteId(null)}
        onConfirm={handleDemote}
        loading={demoting}
        title="Remove sub-admin role?"
        message="This person will become a regular user and lose sub-admin panel access. Their account will not be deleted."
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete sub-admin account?"
        message="This permanently deletes the account and all associated data. This cannot be undone."
      />
    </div>
  )
}
