import { useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Camera, LogOut, Phone, MapPin, Building2, ChevronDown, AlertCircle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useUpdateProfileMutation, useChangePasswordMutation, useGetProfileQuery, useUploadAvatarMutation } from '../../store/api/authApi'
import { useDispatch } from 'react-redux'
import { updateUser } from '../../store/slices/authSlice'
import { normalizeAuthUser } from '../../utils/normalizeAuthUser'
import Input   from '../../components/ui/Input'
import Button  from '../../components/ui/Button'
import Avatar  from '../../components/ui/Avatar'
import Badge   from '../../components/ui/Badge'
import PasswordRequirements from '../../components/ui/PasswordRequirements'
import { passwordFieldRules, PASSWORD_PLACEHOLDER } from '../../utils/passwordHelpers'
import { getRoleLabel } from '../../utils/roleHelpers'
import { PAKISTAN_CITIES } from '../../constants/pakistanCities'
import { PAKISTAN_PROVINCES } from '../../constants/pakistanProvinces'
import toast   from 'react-hot-toast'

const PAKISTAN_CITIES_LC = PAKISTAN_CITIES.map((c) => c.toLowerCase())
const PAKISTAN_PROVINCES_LC = PAKISTAN_PROVINCES.map((p) => p.toLowerCase())

const normalizePkCity = (value) => {
  if (!value) return ''
  const lc = value.trim().toLowerCase()
  return PAKISTAN_CITIES_LC.includes(lc) ? lc : ''
}

const normalizePkProvince = (value) => {
  if (!value) return ''
  const lc = value.trim().toLowerCase()
  return PAKISTAN_PROVINCES_LC.includes(lc) ? lc : ''
}

export default function ProfilePage() {
  const { user, logout, role }     = useAuth()
  const dispatch                   = useDispatch()
  const isSubadmin                 = role === 'subadmin'
  const { data: profileData }      = useGetProfileQuery()
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation()
  const [changePw,      { isLoading: changingPw }] = useChangePasswordMutation()
  const [uploadAvatar,  { isLoading: uploadingAvatar }] = useUploadAvatarMutation()
  const fileInputRef = useRef(null)

  const fullUser = profileData?.user || user
  const avatarSrc = user?.avatar || fullUser?.avatar

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: errProfile },
  } = useForm({ defaultValues: { name: user?.name, email: user?.email } })

  // Populate the form once the full profile (with phone/address) loads
  useEffect(() => {
    if (fullUser) {
      resetProfile({
        name:    fullUser.name  || '',
        email:   fullUser.email || '',
        phone:   fullUser.phone || '',
        city:    fullUser.city  || '',
        address: {
          street:     fullUser.address?.street     || '',
          city:       normalizePkCity(fullUser.address?.city),
          state:      normalizePkProvince(fullUser.address?.state),
          postalCode: fullUser.address?.postalCode || '',
          country:    fullUser.address?.country     || 'Pakistan',
        },
      })
    }
  }, [fullUser, resetProfile])

  const {
    register: regPw,
    handleSubmit: handlePw,
    watch: watchPw,
    reset: resetPw,
    formState: { errors: errPw },
  } = useForm()

  const onProfileSave = async (data) => {
    try {
      const payload = { ...data }
      // Sub-admin managed city is required — don't send empty value (would be ignored server-side anyway)
      if (isSubadmin && !payload.city?.trim()) {
        delete payload.city
      }
      const result = await updateProfile(payload).unwrap()
      // baseApi already unwraps { success, data } → so result is the user object directly
      const updatedUser = result?.user ?? result
      dispatch(updateUser(normalizeAuthUser(updatedUser)))
      toast.success('Profile updated')
    } catch (err) {
      const msg = err?.data?.errors?.length
        ? err.data.errors.join('. ')
        : err?.data?.message || 'Could not update profile'
      toast.error(msg)
    }
  }

  const handleAvatarPick = () => fileInputRef.current?.click()

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (JPG, PNG, or WebP)')
      e.target.value = ''
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be 2 MB or smaller')
      e.target.value = ''
      return
    }

    try {
      const result = await uploadAvatar(file).unwrap()
      dispatch(updateUser({ avatar: result?.avatar ?? result?.data?.avatar }))
      toast.success('Profile photo updated')
    } catch (err) {
      toast.error(err?.data?.message || 'Could not upload photo')
    } finally {
      e.target.value = ''
    }
  }

  const onPasswordChange = async (data) => {
    try {
      await changePw({ currentPassword: data.current, newPassword: data.newPw }).unwrap()
      resetPw()
      toast.success('Password changed. Please sign in again.')
      logout()
    } catch (err) {
      const msg = err?.data?.errors?.length
        ? err.data.errors.join('. ')
        : err?.data?.message || 'Could not change password'
      toast.error(msg)
    }
  }

  return (
    <div className="min-h-full p-6 max-w-2xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-2"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        <User size={20} className="text-accent" />
        My Profile
      </motion.h1>

      <div className="space-y-5">
        {/* Avatar card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5 flex items-center gap-5"
        >
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <Avatar name={user?.name} src={avatarSrc} size="xl" />
            <button
              type="button"
              onClick={handleAvatarPick}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 w-6 h-6 bg-accent rounded-full flex items-center justify-center hover:bg-accent-light transition-colors disabled:opacity-60"
              aria-label="Change avatar"
            >
              {uploadingAvatar ? (
                <span className="w-3 h-3 border border-bg-primary border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={10} className="text-bg-primary" />
              )}
            </button>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
              {user?.name}
            </h2>
            <p className="text-sm text-text-secondary mb-2">{user?.email}</p>
            <Badge variant="gold">{getRoleLabel(role)}</Badge>
          </div>
        </motion.div>

        {/* Profile form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-1.5">
            <User size={13} className="text-accent" /> Personal Information
          </h3>
          <form onSubmit={handleProfile(onProfileSave)} className="space-y-4">
            <Input
              label="Full Name"
              icon={<User size={15} />}
              error={errProfile.name?.message}
              {...regProfile('name', { required: 'Name is required' })}
            />
            <Input
              label="Email"
              type="email"
              icon={<Mail size={15} />}
              error={errProfile.email?.message}
              {...regProfile('email', {
                required: 'Email is required',
                pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
              })}
            />
            <Input
              label="Phone"
              type="tel"
              icon={<Phone size={15} />}
              placeholder="+92 300 0000000"
              error={errProfile.phone?.message}
              {...regProfile('phone')}
            />

            {isSubadmin && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                  Managed City
                </label>
                <div className="relative flex items-center">
                  <select
                    className="w-full appearance-none bg-bg-tertiary border border-border rounded-[var(--radius-md)] pl-4 pr-10 py-2.5 text-sm text-text-primary outline-none focus:border-accent capitalize cursor-pointer"
                    {...regProfile('city', { required: 'City is required for sub-admins' })}
                  >
                    <option value="" disabled>Select your city</option>
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c.toLowerCase()}>{c}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 pointer-events-none text-text-secondary">
                    <ChevronDown size={16} />
                  </div>
                </div>
                {errProfile.city && (
                  <p className="text-xs text-error flex items-center gap-1.5 mt-1 select-none animate-fadeIn">
                    <AlertCircle size={13} className="shrink-0 text-error" />
                    <span>{errProfile.city.message}</span>
                  </p>
                )}
              </div>
            )}

            <Button type="submit" variant="gold" size="md" loading={saving}>
              Save Changes
            </Button>
          </form>
        </motion.div>

        {/* Address form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-1.5">
            <MapPin size={13} className="text-accent" /> Address
          </h3>
          <form onSubmit={handleProfile(onProfileSave)} className="space-y-4">
            <Input
              label="Street Address"
              icon={<MapPin size={15} />}
              placeholder="123 Main Street, Apt 4B"
              {...regProfile('address.street')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                  City
                </label>
                <div className="relative flex items-center">
                  <select
                    className="w-full appearance-none bg-bg-tertiary border border-border rounded-[var(--radius-md)] pl-4 pr-10 py-2.5 text-sm text-text-primary outline-none focus:border-accent capitalize cursor-pointer"
                    defaultValue=""
                    {...regProfile('address.city', { required: 'Please select a Pakistani city' })}
                  >
                    <option value="" disabled>Select your city</option>
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c.toLowerCase()}>{c}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 pointer-events-none text-text-secondary">
                    <ChevronDown size={16} />
                  </div>
                </div>
                {errProfile.address?.city && (
                  <p className="text-xs text-error flex items-center gap-1.5 mt-1 select-none animate-fadeIn">
                    <AlertCircle size={13} className="shrink-0 text-error" />
                    <span>{errProfile.address.city.message}</span>
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                  State / Province
                </label>
                <div className="relative flex items-center">
                  <select
                    className="w-full appearance-none bg-bg-tertiary border border-border rounded-[var(--radius-md)] pl-4 pr-10 py-2.5 text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
                    defaultValue=""
                    {...regProfile('address.state', { required: 'Please select a province' })}
                  >
                    <option value="" disabled>Select your province</option>
                    {PAKISTAN_PROVINCES.map((p) => (
                      <option key={p} value={p.toLowerCase()}>{p}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 pointer-events-none text-text-secondary">
                    <ChevronDown size={16} />
                  </div>
                </div>
                {errProfile.address?.state && (
                  <p className="text-xs text-error flex items-center gap-1.5 mt-1 select-none animate-fadeIn">
                    <AlertCircle size={13} className="shrink-0 text-error" />
                    <span>{errProfile.address.state.message}</span>
                  </p>
                )}
              </div>
              <Input
                label="Postal Code"
                placeholder="75400"
                {...regProfile('address.postalCode')}
              />
              <Input
                label="Country"
                readOnly
                {...regProfile('address.country')}
              />
            </div>
            <Button type="submit" variant="gold" size="md" loading={saving}>
              Save Address
            </Button>
          </form>
        </motion.div>

        {/* Password form */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5"
        >
          <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-1.5">
            <Lock size={13} className="text-accent" /> Change Password
          </h3>
          <form onSubmit={handlePw(onPasswordChange)} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              icon={<Lock size={15} />}
              error={errPw.current?.message}
              {...regPw('current', { required: 'Current password is required' })}
            />
            <div>
              <Input
                label="New Password"
                type="password"
                icon={<Lock size={15} />}
                placeholder={PASSWORD_PLACEHOLDER}
                error={errPw.newPw?.message}
                {...regPw('newPw', passwordFieldRules)}
              />
              <PasswordRequirements password={watchPw('newPw') || ''} />
            </div>
            <Input
              label="Confirm New Password"
              type="password"
              icon={<Lock size={15} />}
              error={errPw.confirmPw?.message}
              {...regPw('confirmPw', {
                required: 'Required',
                validate: (v) => v === watchPw('newPw') || 'Passwords do not match',
              })}
            />
            <Button type="submit" variant="gold" size="md" loading={changingPw}>
              Update Password
            </Button>
          </form>
        </motion.div>

        {/* Sign out */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Button
            variant="danger"
            size="md"
            icon={<LogOut size={14} />}
            onClick={logout}
          >
            Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
