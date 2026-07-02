import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, CreditCard, Truck, ChevronRight, ChevronDown, AlertCircle } from 'lucide-react'
import { useCart } from '../../hooks/useCart'
import { useCreateOrderMutation } from '../../store/api/orderApi'
import { useVerifyCartStockMutation } from '../../store/api/cartApi'
import Input    from '../../components/ui/Input'
import Button   from '../../components/ui/Button'
import { formatPrice } from '../../utils/formatPrice'
import { PAKISTAN_CITIES } from '../../constants/pakistanCities'
import toast    from 'react-hot-toast'
import ProductImage from '../../components/product/ProductImage'

export default function CheckoutPage() {
  const { cart }                    = useCart()
  const [createOrder, { isLoading }] = useCreateOrderMutation()
  const [verifyStock]               = useVerifyCartStockMutation()
  const navigate                    = useNavigate()

  useEffect(() => {
    let active = true
    const checkStock = async () => {
      try {
        const verification = await verifyStock().unwrap()
        if (!active) return
        if (!verification?.success) {
          const errors = verification?.errors || []
          if (errors.length > 0) {
            errors.forEach((e) => toast.error(e))
          } else {
            toast.error('Some items in your cart are out of stock or have insufficient quantity.')
          }
          navigate('/cart')
        }
      } catch (err) {
        if (!active) return
        toast.error(err?.data?.message || 'Could not verify stock')
        navigate('/cart')
      }
    }
    checkStock()
    return () => { active = false }
  }, [verifyStock, navigate])

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { paymentMethod: 'stripe' },
  })

  const paymentMethod = watch('paymentMethod')
  const items         = cart?.items || []

  const onSubmit = async (data) => {
    try {
      const result = await createOrder({
        items: items.map((item) => ({
          product:  item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          street:     data.address,
          city:       data.city,
          postalCode: data.postalCode,
        },
        paymentMethod: data.paymentMethod,
      }).unwrap()

      toast.success('Order placed!')

      const orderId = result?.orderId
      if (data.paymentMethod === 'stripe') {
        navigate(`/payment?orderId=${orderId}`)
      } else {
        navigate(`/orders/${orderId}`)
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Could not place order')
    }
  }

  return (
    <div className="min-h-full p-6 max-w-4xl mx-auto">
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-text-primary mb-6"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        Checkout
      </motion.h1>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping */}
            <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5">
              <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <MapPin size={15} className="text-accent" /> Shipping Address
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Full Name"
                  placeholder="Jane Doe"
                  error={errors.fullName?.message}
                  {...register('fullName', { required: 'Required' })}
                />
                <Input
                  label="Phone"
                  type="tel"
                  placeholder="+92 300 0000000"
                  error={errors.phone?.message}
                  {...register('phone', { required: 'Required' })}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Street Address"
                    placeholder="123 Main Street, Apt 4B"
                    error={errors.address?.message}
                    {...register('address', { required: 'Required' })}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                    City
                  </label>
                  <div className="relative flex items-center">
                    <select
                      className="w-full appearance-none bg-bg-tertiary border border-border rounded-[var(--radius-md)] pl-4 pr-10 py-2.5 text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
                      defaultValue=""
                      {...register('city', { required: 'Please select your city' })}
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
                  {errors.city && (
                    <p className="text-xs text-error flex items-center gap-1.5 mt-1 select-none animate-fadeIn">
                      <AlertCircle size={13} className="shrink-0 text-error" />
                      <span>{errors.city.message}</span>
                    </p>
                  )}
                </div>
                <Input
                  label="Postal Code"
                  placeholder="75400"
                  error={errors.postalCode?.message}
                  {...register('postalCode', { required: 'Required' })}
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5">
              <h2 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <CreditCard size={15} className="text-accent" /> Payment Method
              </h2>
              <div className="space-y-2">
                {[
                  { value: 'stripe', label: 'Credit / Debit Card', icon: '💳' },
                  { value: 'cod',    label: 'Cash on Delivery',    icon: '💵' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border cursor-pointer transition-all ${
                      paymentMethod === opt.value
                        ? 'border-accent bg-accent/5'
                        : 'border-border hover:border-border-accent'
                    }`}
                  >
                    <input
                      type="radio"
                      value={opt.value}
                      className="accent-[#C8A96E]"
                      {...register('paymentMethod')}
                    />
                    <span className="text-lg">{opt.icon}</span>
                    <span className="text-sm text-text-primary">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-1">
            <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5 sticky top-20">
              <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Truck size={14} className="text-accent" /> Order Summary
              </h3>

              {/* Items */}
              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.product._id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-[var(--radius-sm)] overflow-hidden bg-bg-tertiary border border-border shrink-0">
                      <ProductImage
                        productName={item.product?.name}
                        backendImages={item.product?.images}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="text-xs text-text-secondary flex-1 truncate">{item.product.name}</span>
                    <span className="text-xs font-medium text-text-primary font-[var(--font-mono)] shrink-0">
                      ×{item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-3 space-y-1.5 mb-4">
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Subtotal</span>
                  <span className="font-[var(--font-mono)]">{formatPrice(cart?.subtotal || cart?.total || 0)}</span>
                </div>
                {(cart?.discount > 0) && (
                  <div className="flex justify-between text-xs text-success">
                    <span>Discount Savings</span>
                    <span className="font-[var(--font-mono)]">-{formatPrice(cart.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-text-secondary">
                  <span>Shipping</span>
                  <span className="font-[var(--font-mono)]">{cart?.shipping > 0 ? formatPrice(cart.shipping) : 'Free'}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-text-primary pt-2 border-t border-border">
                  <span>Total</span>
                  <div className="flex flex-col items-end gap-0.5">
                    {cart?.discount > 0 && (
                      <span className="text-[10px] text-text-tertiary line-through font-[var(--font-mono)]">
                        {formatPrice(cart.subtotal)}
                      </span>
                    )}
                    <span className="text-accent font-[var(--font-mono)]">{formatPrice(cart?.total)}</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                variant="gold"
                size="lg"
                className="w-full"
                loading={isLoading}
                iconRight={<ChevronRight size={15} />}
              >
                {paymentMethod === 'stripe' ? 'Continue to Payment' : 'Place Order'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
