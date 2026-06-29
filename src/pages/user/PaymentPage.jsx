import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { CreditCard, Lock, CheckCircle2, ShieldCheck, Wifi } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import {
  useInitiatePaymentMutation,
  useGetPaymentByOrderQuery,
  useDevConfirmPaymentMutation,
  useVerifyPaymentMutation,
} from '../../store/api/paymentApi'
import Button  from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'
import toast   from 'react-hot-toast'

// ── helpers ───────────────────────────────────────────────────────────────────
const formatCardNumber = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

const formatExpiry = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length >= 3 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

const detectBrand = (num) => {
  const n = num.replace(/\s/g, '')
  if (/^4/.test(n))          return 'visa'
  if (/^5[1-5]/.test(n))     return 'mastercard'
  if (/^3[47]/.test(n))      return 'amex'
  if (/^6(?:011|5)/.test(n)) return 'discover'
  return null
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const BrandBadge = ({ brand }) => {
  const map = { visa: 'VISA', mastercard: 'MC', amex: 'AMEX', discover: 'DISC' }
  if (!brand) return null
  return (
    <span className="text-[10px] font-bold tracking-widest text-accent border border-accent/40 rounded px-1.5 py-0.5">
      {map[brand]}
    </span>
  )
}

// ── component ─────────────────────────────────────────────────────────────────
export default function PaymentPage() {
  const [params]   = useSearchParams()
  const orderId    = params.get('orderId')
  const navigate   = useNavigate()

  const [paid, setPaid]           = useState(false)
  const [paying, setPaying]       = useState(false)
  const [intentId, setIntentId]   = useState(null)
  const [initError, setInitError] = useState(null)
  const [polling, setPolling]     = useState(true)
  const intentCreated             = useRef(false)

  // card form state
  const [cardNum,  setCardNum]  = useState('')
  const [expiry,   setExpiry]   = useState('')
  const [cvc,      setCvc]      = useState('')
  const [name,     setName]     = useState('')
  const [errors,   setErrors]   = useState({})
  const [flipped,  setFlipped]  = useState(false)

  const brand = detectBrand(cardNum)

  const [initiate, { isLoading: initing }] = useInitiatePaymentMutation()
  const [devConfirm]                       = useDevConfirmPaymentMutation()
  const [verifyPayment]                      = useVerifyPaymentMutation()

  const { data: paymentData } = useGetPaymentByOrderQuery(orderId, {
    skip: !orderId || paid || !polling,
    pollingInterval: polling ? 4_000 : 0,
  })

  const markPaidAndRedirect = useCallback(() => {
    setPolling(false)
    setPaid(true)
    toast.success('Payment confirmed! 🎉')
    setTimeout(() => navigate(`/orders/${orderId}`), 1800)
  }, [navigate, orderId])

  // stop background polling after 3 min (but not while actively paying)
  useEffect(() => {
    if (!polling || paying) return
    const t = setTimeout(() => setPolling(false), 180_000)
    return () => clearTimeout(t)
  }, [polling, paying])

  // create intent once
  useEffect(() => {
    if (!orderId || intentCreated.current) return
    intentCreated.current = true
    initiate({ orderId })
      .unwrap()
      .then((r) => setIntentId(r.paymentIntentId ?? r.data?.paymentIntentId))
      .catch((e) => setInitError(e?.data?.message || 'Could not start payment'))
  }, [orderId, initiate])

  // detect paid via background poll (backup path)
  useEffect(() => {
    if (paymentData?.order?.paymentStatus === 'paid') {
      markPaidAndRedirect()
    }
  }, [paymentData, markPaidAndRedirect])

  // ── validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    const rawNum = cardNum.replace(/\s/g, '')
    if (rawNum.length !== 16)               e.cardNum = 'Enter a valid 16-digit card number'
    const [mm, yy] = expiry.split('/')
    if (!mm || !yy || mm < 1 || mm > 12)   e.expiry  = 'Enter a valid expiry (MM/YY)'
    if (cvc.length < 3)                     e.cvc     = 'Enter a valid CVC'
    if (!name.trim())                       e.name    = 'Enter the cardholder name'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const waitForPaid = async () => {
    for (let i = 0; i < 15; i++) {
      const result = await verifyPayment({ orderId }).unwrap()
      if (result?.order?.paymentStatus === 'paid') return true
      await sleep(2_000)
    }
    return false
  }

  const handlePay = async (ev) => {
    ev.preventDefault()
    if (!validate()) return
    if (!intentId) { toast.error('Payment not ready yet, please wait'); return }
    setPaying(true)
    setPolling(true)
    try {
      await devConfirm(intentId).unwrap()
      const confirmed = await waitForPaid()
      if (confirmed) {
        markPaidAndRedirect()
      } else {
        setPaying(false)
        toast.error('Payment submitted but confirmation is delayed. Check your order shortly.')
      }
    } catch (err) {
      setPaying(false)
      toast.error(err?.data?.message || 'Payment failed. Please try again.')
    }
  }

  // ── success screen ──────────────────────────────────────────────────────────
  if (paid) {
    return (
      <div className="min-h-full flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-sm"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-20 h-20 rounded-full bg-success/10 border border-success/30 flex items-center justify-center mx-auto mb-5"
          >
            <CheckCircle2 size={36} className="text-success" />
          </motion.div>
          <h2 className="text-2xl font-bold text-text-primary mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Payment Successful!
          </h2>
          <p className="text-sm text-text-secondary">Redirecting to your order…</p>
        </motion.div>
      </div>
    )
  }

  // ── main ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-full p-6 flex items-start justify-center">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-5"
      >
        {/* Header */}
        <div className="flex items-center gap-2">
          <Lock size={15} className="text-accent" />
          <h1 className="text-xl font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Secure Payment
          </h1>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-text-tertiary">
            <ShieldCheck size={12} className="text-success" /> SSL Encrypted
          </span>
        </div>

        {/* Card visual */}
        <div className="relative h-44 perspective-1000">
          <motion.div
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.5 }}
            style={{ transformStyle: 'preserve-3d' }}
            className="w-full h-full relative"
          >
            {/* Front */}
            <div
              className="absolute inset-0 rounded-2xl p-5 flex flex-col justify-between"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                border: '1px solid rgba(200,169,110,0.3)',
                backfaceVisibility: 'hidden',
              }}
            >
              <div className="flex justify-between items-start">
                <Wifi size={22} className="text-accent/60 rotate-90" />
                <BrandBadge brand={brand} />
              </div>
              <div>
                <p className="font-mono text-lg tracking-[0.25em] text-white/90 mb-3">
                  {cardNum || '•••• •••• •••• ••••'}
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Card Holder</p>
                    <p className="text-sm text-white/80 font-medium truncate max-w-[180px]">
                      {name || 'FULL NAME'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Expires</p>
                    <p className="text-sm text-white/80 font-mono">{expiry || 'MM/YY'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Back */}
            <div
              className="absolute inset-0 rounded-2xl flex flex-col justify-center"
              style={{
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                border: '1px solid rgba(200,169,110,0.3)',
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)',
              }}
            >
              <div className="h-10 bg-black/50 w-full mb-4" />
              <div className="px-5 flex items-center gap-3">
                <div className="flex-1 h-8 bg-white/10 rounded" />
                <div className="bg-white/90 text-bg-primary font-mono font-bold text-sm px-3 py-1.5 rounded min-w-[52px] text-center">
                  {cvc || '•••'}
                </div>
              </div>
              <p className="text-[10px] text-white/30 text-center mt-3">CVC</p>
            </div>
          </motion.div>
        </div>

        {/* Loading/error state */}
        {initing && (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Spinner size="sm" /> Preparing payment…
          </div>
        )}
        {initError && <p className="text-sm text-error">{initError}</p>}

        {/* Card Form */}
        <AnimatePresence>
          {(intentId || initing) && (
            <motion.form
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handlePay}
              className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5 space-y-4"
            >
              {/* Card Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={cardNum}
                    onChange={(e) => setCardNum(formatCardNumber(e.target.value))}
                    className={`w-full bg-bg-tertiary border rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-mono text-text-primary outline-none transition-colors pr-10
                      ${errors.cardNum ? 'border-error' : 'border-border focus:border-accent'}`}
                  />
                  <CreditCard size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                </div>
                {errors.cardNum && <p className="text-xs text-error">{errors.cardNum}</p>}
              </div>

              {/* Expiry + CVC */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className={`w-full bg-bg-tertiary border rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-mono text-text-primary outline-none transition-colors
                      ${errors.expiry ? 'border-error' : 'border-border focus:border-accent'}`}
                  />
                  {errors.expiry && <p className="text-xs text-error">{errors.expiry}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                    CVC
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="123"
                    maxLength={4}
                    value={cvc}
                    onFocus={() => setFlipped(true)}
                    onBlur={() => setFlipped(false)}
                    onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    className={`w-full bg-bg-tertiary border rounded-[var(--radius-md)] px-4 py-2.5 text-sm font-mono text-text-primary outline-none transition-colors
                      ${errors.cvc ? 'border-error' : 'border-border focus:border-accent'}`}
                  />
                  {errors.cvc && <p className="text-xs text-error">{errors.cvc}</p>}
                </div>
              </div>

              {/* Cardholder Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  className={`w-full bg-bg-tertiary border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-text-primary outline-none transition-colors
                    ${errors.name ? 'border-error' : 'border-border focus:border-accent'}`}
                />
                {errors.name && <p className="text-xs text-error">{errors.name}</p>}
              </div>

              {/* Pay Now */}
              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full mt-1"
                loading={paying}
                icon={!paying && <Lock size={14} />}
              >
                {paying ? 'Processing…' : 'Pay Now'}
              </Button>

              {paying && (
                <div className="flex items-center gap-2 text-xs text-text-tertiary justify-center pt-1">
                  <Spinner size="sm" />
                  Confirming payment, please wait…
                </div>
              )}

              <p className="text-[11px] text-text-tertiary text-center">
                Test card: <span className="font-mono text-accent">4242 4242 4242 4242</span> · Any expiry · Any CVC
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
