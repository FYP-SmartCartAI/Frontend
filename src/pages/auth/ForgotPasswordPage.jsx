import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { useForgotPasswordMutation } from '../../store/api/authApi'
import Input  from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import toast  from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const [sent, setSent]                         = useState(false)
  const [forgotPw, { isLoading }]               = useForgotPasswordMutation()
  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    try {
      await forgotPw(data).unwrap()
      setSent(true)
    } catch (err) {
      toast.error(err?.data?.message || 'Something went wrong')
    }
  }

  if (sent) {
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
          Check your email
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          We've sent a password reset link to your email address.
        </p>
        <Link to="/login" className="text-sm text-accent hover:text-accent-light transition-colors">
          ← Back to sign in
        </Link>
      </motion.div>
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
        <h1
          className="text-3xl font-bold text-text-primary mb-2 gold-underline"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Forgot password?
        </h1>
        <p className="text-sm text-text-secondary">
          Enter your email and we'll send you a reset link
        </p>
      </div>

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
              pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
            })}
          />
          <Button type="submit" variant="gold" size="lg" className="w-full" loading={isLoading}>
            Send Reset Link
          </Button>
        </form>
      </div>

      <p className="text-center text-sm text-text-secondary mt-6">
        <Link to="/login" className="text-accent hover:text-accent-light transition-colors flex items-center justify-center gap-1">
          <ArrowLeft size={13} /> Back to sign in
        </Link>
      </p>
    </motion.div>
  )
}
