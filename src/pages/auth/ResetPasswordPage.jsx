import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { useResetPasswordMutation } from '../../store/api/authApi'
import Input  from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import PasswordRequirements from '../../components/ui/PasswordRequirements'
import { passwordFieldRules, PASSWORD_HINT, PASSWORD_PLACEHOLDER } from '../../utils/passwordHelpers'
import toast  from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [params]                    = useSearchParams()
  const token                       = params.get('token')
  const [done, setDone]             = useState(false)
  const [resetPw, { isLoading }]    = useResetPasswordMutation()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password') || ''

  const onSubmit = async (data) => {
    try {
      await resetPw({ token, password: data.password }).unwrap()
      setDone(true)
    } catch (err) {
      if (err?.data?.errors && Array.isArray(err.data.errors)) {
        err.data.errors.forEach((e) => toast.error(e))
      } else {
        toast.error(err?.data?.message || 'Reset failed. The link may have expired.')
      }
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center"
      >
        <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={28} className="text-success" />
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2" style={{ fontFamily: 'var(--font-display)' }}>
          Password updated
        </h2>
        <p className="text-sm text-text-secondary mb-6">You can now sign in with your new password.</p>
        <Link to="/login">
          <Button variant="gold" size="md">Sign In</Button>
        </Link>
      </motion.div>
    )
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-sm text-error">Invalid or missing reset token.</p>
        <Link to="/forgot-password" className="text-accent text-sm mt-2 block">Request a new link</Link>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2 gold-underline" style={{ fontFamily: 'var(--font-display)' }}>
          Reset password
        </h1>
        <p className="text-sm text-text-secondary">{PASSWORD_HINT}</p>
      </div>

      <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="New Password"
              type="password"
              icon={<Lock size={15} />}
              placeholder={PASSWORD_PLACEHOLDER}
              error={errors.password?.message}
              {...register('password', passwordFieldRules)}
            />
            <PasswordRequirements password={password} />
          </div>
          <Input
            label="Confirm Password"
            type="password"
            icon={<Lock size={15} />}
            placeholder="Repeat your password"
            error={errors.confirm?.message}
            {...register('confirm', {
              required: 'Please confirm your password',
              validate: (val) => val === watch('password') || 'Passwords do not match',
            })}
          />
          <Button type="submit" variant="gold" size="lg" className="w-full" loading={isLoading}>
            Update Password
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
