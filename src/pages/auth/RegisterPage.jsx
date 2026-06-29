import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock } from 'lucide-react'
import { useRegisterMutation } from '../../store/api/authApi'
import { useAuth } from '../../hooks/useAuth'
import Input  from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import PasswordRequirements from '../../components/ui/PasswordRequirements'
import { passwordFieldRules, PASSWORD_PLACEHOLDER } from '../../utils/passwordHelpers'
import toast  from 'react-hot-toast'

export default function RegisterPage() {
  const { login }                      = useAuth()
  const [registerApi, { isLoading }]   = useRegisterMutation()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password') || ''

  const onSubmit = async (data) => {
    try {
      const result = await registerApi({
        name:     data.name,
        email:    data.email,
        password: data.password,
      }).unwrap()
      login({ user: result.user, token: result.token })
      toast.success('Account created — welcome!')
    } catch (err) {
      if (err?.data?.errors && Array.isArray(err.data.errors)) {
        err.data.errors.forEach((e) => toast.error(e))
      } else {
        toast.error(err?.data?.message || 'Registration failed')
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-sm"
    >
      <div className="text-center mb-8">
        <h1
          className="text-3xl font-bold text-text-primary mb-2 gold-underline"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Create account
        </h1>
        <p className="text-sm text-text-secondary">
          Start your intelligent shopping journey
        </p>
      </div>

      <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)]">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            icon={<User size={15} />}
            placeholder="Jane Doe"
            error={errors.name?.message}
            {...register('name', {
              required:  'Name is required',
              minLength: { value: 2, message: 'Min 2 characters' },
            })}
          />

          <Input
            label="Email"
            type="email"
            icon={<Mail size={15} />}
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
            })}
          />

          <div>
            <Input
              label="Password"
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
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (val) =>
                val === watch('password') || 'Passwords do not match',
            })}
          />

          <Button
            type="submit"
            variant="gold"
            size="lg"
            className="w-full mt-2"
            loading={isLoading}
          >
            Create Account
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-text-secondary mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-accent hover:text-accent-light transition-colors font-medium">
          Sign in
        </Link>
      </p>
    </motion.div>
  )
}
