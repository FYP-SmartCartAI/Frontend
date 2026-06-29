import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import emailjs from '@emailjs/browser'
import {
  ShieldX,
  Mail,
  MessageSquare,
  User,
  SendHorizonal,
  CheckCircle2,
  X,
  Clock,
  Phone,
  HelpCircle,
} from 'lucide-react'
import {
  EMAILJS_SERVICE_ID,
  EMAILJS_TEMPLATE_ID,
  EMAILJS_PUBLIC_KEY,
} from '../../config/emailjs'

/* ─────────────────────────────────────────────
   Tiny helpers
───────────────────────────────────────────── */
function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

function Field({ label, icon, children, error }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-text-secondary uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none">
            {icon}
          </span>
        )}
        {children}
      </div>
      {error && (
        <p className="text-xs text-error ml-1">{error}</p>
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Support steps shown on the right side
───────────────────────────────────────────── */
const SUPPORT_CHANNELS = [
  {
    icon: <Mail size={15} />,
    label: 'Email support',
    value: 'support@smartcart.pk',
    href: 'mailto:support@smartcart.pk',
  },
  {
    icon: <Phone size={15} />,
    label: 'Call us',
    value: '+92 300 000 0000',
    href: 'tel:+923000000000',
  },
  {
    icon: <Clock size={15} />,
    label: 'Response time',
    value: 'Within 24 hours',
    href: null,
  },
]

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function BlockedAccountModal({ isOpen, email, onClose }) {
  const formRef = useRef(null)
  const [fields, setFields] = useState({ name: '', message: '' })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | success | error

  /* reset every time modal opens */
  const handleOpen = () => {
    setFields({ name: '', message: '' })
    setErrors({})
    setStatus('idle')
  }

  const validate = () => {
    const e = {}
    if (!fields.name.trim())    e.name    = 'Your name is required'
    if (!fields.message.trim()) e.message = 'Please describe your issue'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (evt) => {
    evt.preventDefault()
    if (!validate()) return

    setStatus('sending')
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:    fields.name,
          from_email:   email || 'unknown@user.com',
          message:      fields.message,
          subject:      'Account Blocked — Appeal Request',
          to_name:      'SmartCart Support Team',
        },
        EMAILJS_PUBLIC_KEY,
      )
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return createPortal(
    <AnimatePresence onExitComplete={handleOpen}>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* ── Backdrop ── */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* ── Panel ── */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[var(--radius-lg)] border border-border-accent bg-bg-secondary shadow-[0_24px_64px_rgba(0,0,0,0.6)]"
            role="dialog"
            aria-modal="true"
            aria-label="Account Blocked"
          >
            {/* Decorative top stripe */}
            <div
              className="h-1 w-full"
              style={{ background: 'linear-gradient(90deg,#C8A96E,#E8C98E,#C8A96E)' }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 text-text-tertiary hover:text-text-primary transition-colors p-1.5 rounded-[var(--radius-sm)] hover:bg-bg-tertiary"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="grid md:grid-cols-[1fr_1.1fr]">
              {/* ── LEFT: Account status info ── */}
              <div
                className="flex flex-col gap-6 p-6 md:p-7 border-b md:border-b-0 md:border-r border-border"
                style={{ background: 'linear-gradient(160deg, rgba(200,169,110,0.05) 0%, transparent 60%)' }}
              >
                {/* Shield icon */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-[var(--radius-md)] bg-error/10 border border-error/25 flex items-center justify-center">
                    <ShieldX size={24} className="text-error" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
                      Account Suspended
                    </h2>
                    <p className="text-xs text-text-tertiary mt-0.5">Access has been restricted</p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-3 text-sm text-text-secondary leading-relaxed">
                  <p>
                    Your account associated with{' '}
                    {email ? (
                      <span className="font-semibold text-accent">{email}</span>
                    ) : (
                      'this email'
                    )}{' '}
                    has been <span className="text-error font-medium">temporarily suspended</span> due to a policy violation or security concern.
                  </p>
                  <p>
                    Our support team can review your case and restore access if appropriate. Use the form to submit an appeal.
                  </p>
                </div>

                {/* Support channels */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-text-tertiary uppercase tracking-wider mb-3">
                    Other ways to reach us
                  </p>
                  {SUPPORT_CHANNELS.map((ch) => (
                    <div
                      key={ch.label}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius-md)] bg-bg-tertiary border border-border hover:border-border-accent transition-colors"
                    >
                      <span className="text-accent">{ch.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs text-text-tertiary">{ch.label}</p>
                        {ch.href ? (
                          <a
                            href={ch.href}
                            className="text-sm text-text-primary font-medium hover:text-accent transition-colors truncate block"
                          >
                            {ch.value}
                          </a>
                        ) : (
                          <p className="text-sm text-text-primary font-medium">{ch.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── RIGHT: Contact form / Success ── */}
              <div className="p-6 md:p-7">
                <AnimatePresence mode="wait">
                  {status === 'success' ? (
                    /* Success state */
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1    }}
                      exit={{ opacity: 0 }}
                      className="h-full flex flex-col items-center justify-center text-center gap-5 py-8"
                    >
                      <div className="w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center">
                        <CheckCircle2 size={32} className="text-success" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-text-primary mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                          Appeal Submitted!
                        </h3>
                        <p className="text-sm text-text-secondary leading-relaxed max-w-xs mx-auto">
                          We've received your request and will review it within <strong className="text-text-primary">24 hours</strong>. Check your email for updates.
                        </p>
                      </div>
                      <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-[var(--radius-md)] border border-accent text-accent text-sm font-semibold hover:bg-accent-dim transition-all"
                      >
                        Got it, thanks
                      </button>
                    </motion.div>
                  ) : (
                    /* Form state */
                    <motion.form
                      key="form"
                      ref={formRef}
                      onSubmit={handleSubmit}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col gap-5"
                      noValidate
                    >
                      <div>
                        <h3
                          className="text-base font-bold text-text-primary mb-1"
                          style={{ fontFamily: 'var(--font-display)' }}
                        >
                          Submit an Appeal
                        </h3>
                        <p className="text-xs text-text-tertiary flex items-center gap-1.5">
                          <HelpCircle size={12} />
                          Fill in the details below and we'll respond shortly
                        </p>
                      </div>

                      {/* Name */}
                      <Field label="Your Name" icon={<User size={14} />} error={errors.name}>
                        <input
                          type="text"
                          value={fields.name}
                          onChange={(e) => {
                            setFields((f) => ({ ...f, name: e.target.value }))
                            setErrors((er) => ({ ...er, name: undefined }))
                          }}
                          placeholder="John Doe"
                          className={cn(
                            'w-full pl-9 pr-3.5 py-2.5 rounded-[var(--radius-md)] text-sm',
                            'bg-bg-tertiary border text-text-primary placeholder:text-text-tertiary',
                            'outline-none transition-all',
                            errors.name
                              ? 'border-error/60 focus:border-error'
                              : 'border-border focus:border-accent',
                          )}
                        />
                      </Field>

                      {/* Email (read-only pre-filled) */}
                      <Field label="Email Address" icon={<Mail size={14} />}>
                        <input
                          type="email"
                          value={email || ''}
                          readOnly
                          className="w-full pl-9 pr-3.5 py-2.5 rounded-[var(--radius-md)] text-sm bg-bg-tertiary border border-border text-text-tertiary placeholder:text-text-tertiary outline-none cursor-not-allowed opacity-70"
                        />
                      </Field>

                      {/* Message */}
                      <Field label="Describe Your Issue" icon={<MessageSquare size={14} />} error={errors.message}>
                        <textarea
                          value={fields.message}
                          onChange={(e) => {
                            setFields((f) => ({ ...f, message: e.target.value }))
                            setErrors((er) => ({ ...er, message: undefined }))
                          }}
                          placeholder="Explain why you believe your account was suspended and why access should be restored..."
                          rows={4}
                          className={cn(
                            'w-full pl-9 pr-3.5 py-2.5 rounded-[var(--radius-md)] text-sm resize-none',
                            'bg-bg-tertiary border text-text-primary placeholder:text-text-tertiary',
                            'outline-none transition-all',
                            errors.message
                              ? 'border-error/60 focus:border-error'
                              : 'border-border focus:border-accent',
                          )}
                          style={{ paddingTop: '0.75rem' }}
                        />
                      </Field>

                      {/* Error banner */}
                      {status === 'error' && (
                        <div className="flex items-center gap-2 text-xs text-error bg-error/10 border border-error/25 rounded-[var(--radius-sm)] px-3 py-2">
                          <X size={12} className="shrink-0" />
                          Failed to send. Please try again or use the email address on the left.
                        </div>
                      )}

                      {/* Submit */}
                      <motion.button
                        type="submit"
                        whileTap={{ scale: 0.97 }}
                        disabled={status === 'sending'}
                        className={cn(
                          'w-full flex items-center justify-center gap-2 px-5 py-3 rounded-[var(--radius-md)] text-sm font-semibold transition-all',
                          'bg-accent text-bg-primary border border-accent',
                          'hover:bg-accent-light hover:border-accent-light',
                          'disabled:opacity-60 disabled:cursor-not-allowed',
                        )}
                      >
                        {status === 'sending' ? (
                          <>
                            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <SendHorizonal size={15} />
                            Send Appeal
                          </>
                        )}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
