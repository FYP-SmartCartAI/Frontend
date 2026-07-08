import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock } from 'lucide-react'
import { useLoginMutation } from '../../store/api/authApi'
import { useAuth } from '../../hooks/useAuth'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import BlockedAccountModal from '../../components/ui/BlockedAccountModal'
import toast from 'react-hot-toast'
import { BACKEND_URL } from '../../config/api'

export default function LoginPage() {
  const { login } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [loginApi, { isLoading }] = useLoginMutation()
  const [loginError, setLoginError] = useState(null)
  const [blockedModal, setBlockedModal] = useState({ open: false, email: '' })
  const emailRef = useRef('')

  useEffect(() => {
    if (searchParams.get('error') !== 'account_blocked') return

    setBlockedModal({
      open: true,
      email: searchParams.get('email') || '',
    })
    setSearchParams({}, { replace: true })
  }, [searchParams, setSearchParams])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoginError(null)
    emailRef.current = data.email
    try {
      const result = await loginApi(data).unwrap()
      login({ user: result.user, token: result.token })
      toast.success(`Welcome back, ${result.user.name}!`)
    } catch (err) {
      const status = err?.status
      const msg = err?.data?.message || err?.error

      if (status === 429) {
        setLoginError('Too many attempts. Please wait a moment and try again.')
      } else if (status === 401 || status === 400) {
        setLoginError('Incorrect email or password. Please try again.')
      } else if (status === 403) {
        // Open the premium blocked-account modal instead of a plain error
        setBlockedModal({ open: true, email: emailRef.current })
      } else {
        setLoginError(msg || 'Something went wrong. Please try again.')
      }
    }
  }

  return (
    <>
      {/* ── Blocked-account modal (portal, renders outside this tree) ── */}
      <BlockedAccountModal
        isOpen={blockedModal.open}
        email={blockedModal.email}
        onClose={() => setBlockedModal((s) => ({ ...s, open: false }))}
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Heading */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold text-text-primary mb-2 gold-underline"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Welcome back
          </h1>
          <p className="text-sm text-text-secondary">
            Sign in to continue shopping
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-6 shadow-[var(--shadow-card)]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              icon={<Mail size={15} />}
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                onChange: () => setLoginError(null),
              })}
            />

            <Input
              label="Password"
              type="password"
              icon={<Lock size={15} />}
              placeholder="••••••••"
              error={errors.password?.message || (loginError ? true : false)}
              hideErrorText={loginError ? true : false}
              {...register('password', {
                required: 'Password is required',
                onChange: () => setLoginError(null),
              })}
            />

            {loginError && (
              <div
                className="flex items-center gap-3 bg-[#FEF2F2] border border-[#FDE8E8] text-[#9B1C1C] rounded-[var(--radius-md)] p-3 text-sm font-medium"
                style={{ animation: 'fadeIn 0.25s ease-out' }}
              >
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#EF4444] flex items-center justify-center text-white text-xs font-bold font-sans">
                  !
                </div>
                <p className="leading-snug">{loginError}</p>
              </div>
            )}

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-xs text-accent hover:text-accent-light transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="gold"
              size="lg"
              className="w-full mt-2"
              loading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-text-tertiary">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* OAuth Buttons */}
          <div className="flex flex-col gap-2">
            <a
              href={`${BACKEND_URL}/api/auth/oauth/google`}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border text-sm text-text-secondary hover:border-border-accent hover:text-text-primary transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </a>

            <a
              href={`${BACKEND_URL}/api/auth/oauth/facebook`}
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-[var(--radius-md)] border border-border text-sm text-text-secondary hover:border-border-accent hover:text-text-primary transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
              </svg>
              Continue with Facebook
            </a>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-text-secondary mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-accent hover:text-accent-light transition-colors font-medium">
            Sign up free
          </Link>
        </p>
      </motion.div>
    </>
  )
}
