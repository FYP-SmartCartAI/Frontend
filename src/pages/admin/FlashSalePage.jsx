import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles, Clock, Plus, X, Trash2,
  AlertCircle, CheckCircle2, Zap, Search, Package, Calendar
} from 'lucide-react'
import {
  useGetActiveFlashSaleQuery,
  useGetAllFlashSalesQuery,
  useCreateFlashSaleMutation,
  useTerminateFlashSaleMutation,
  useDeleteFlashSaleMutation
} from '../../store/api/flashSaleApi'
import { useGetProductsQuery } from '../../store/api/productApi'
import Button from '../../components/ui/Button'
import { formatDateTime } from '../../utils/formatDate'
import { useDebounce } from '../../hooks/useDebounce'
import toast from 'react-hot-toast'
import ConfirmDialog from '../../components/ui/ConfirmDialog'

// ── Countdown Hook for Admin view ────────────────────────────────────────────
function useActiveCountdown(targetTime) {
  const getLeft = () => {
    if (!targetTime) return '00:00:00'
    const now = new Date()
    const end = new Date(targetTime)
    const d = Math.max(0, Math.floor((end - now) / 1000))
    if (d === 0) return 'Ended'
    const h = String(Math.floor(d / 3600)).padStart(2, '0')
    const m = String(Math.floor((d % 3600) / 60)).padStart(2, '0')
    const s = String(d % 60).padStart(2, '0')
    return `${h}h : ${m}m : ${s}s`
  }
  const [t, setT] = useState(getLeft)
  useEffect(() => {
    setT(getLeft())
    const id = setInterval(() => setT(getLeft()), 1000)
    return () => clearInterval(id)
  }, [targetTime])
  return t
}

export default function AdminFlashSalePage() {
  const [title, setTitle] = useState('')
  const [duration, setDuration] = useState(6)
  const [selectedProds, setSelectedProds] = useState([])
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [termSaleId, setTermSaleId] = useState(null)
  const [delSaleId, setDelSaleId] = useState(null)
  const debSearch = useDebounce(search, 300)
  const dropdownRef = useRef(null)

  // Close search dropdown on clicking outside the wrapper
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false)
      }
    }
    if (showDropdown) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showDropdown])

  // API Hooks
  const { data: activeRes, isLoading: loadingActive } = useGetActiveFlashSaleQuery()
  const { data: allSales = [], isLoading: loadingAll } = useGetAllFlashSalesQuery()
  const { data: prodsData } = useGetProductsQuery({ q: debSearch, limit: 20 })

  const [createSale, { isLoading: creating }] = useCreateFlashSaleMutation()
  const [terminateSale, { isLoading: terminating }] = useTerminateFlashSaleMutation()
  const [deleteSale, { isLoading: deleting }] = useDeleteFlashSaleMutation()

  const activeSale = activeRes?.active ? activeRes.sale : null
  const hasActiveSale = !!activeSale
  const timerStr = useActiveCountdown(activeSale?.endTime)

  // Filter fetched products so we only offer products that have a discountPrice set
  const filteredProducts = (prodsData?.products || []).filter(
    (p) => p.discountPrice && p.discountPrice < p.price
  )

  const handleSelectProduct = (prod) => {
    if (selectedProds.some((p) => p._id === prod._id)) {
      toast.error('Product already added')
      return
    }
    setSelectedProds((prev) => [...prev, prod])
    setSearch('')
    setShowDropdown(false)
  }

  const handleRemoveProduct = (id) => {
    setSelectedProds((prev) => prev.filter((p) => p._id !== id))
  }

  const handleLaunch = async (e) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Please enter a flash sale title')
      return
    }
    if (selectedProds.length === 0) {
      toast.error('Please select at least one product')
      return
    }

    try {
      await createSale({
        title: title.trim(),
        productIds: selectedProds.map((p) => p._id),
        duration: Number(duration),
      }).unwrap()
      toast.success('Flash sale launched successfully!')
      // Reset form
      setTitle('')
      setDuration(6)
      setSelectedProds([])
    } catch (err) {
      toast.error(err?.data?.message || 'Could not launch flash sale')
    }
  }

  const handleTerminate = async () => {
    if (!termSaleId) return
    try {
      await terminateSale(termSaleId).unwrap()
      toast.success('Flash sale terminated early')
      setTermSaleId(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Could not terminate sale')
    }
  }

  const handleDelete = async () => {
    if (!delSaleId) return
    try {
      await deleteSale(delSaleId).unwrap()
      toast.success('Record deleted')
      setDelSaleId(null)
    } catch (err) {
      toast.error(err?.data?.message || 'Could not delete record')
    }
  }

  return (
    <div className="min-h-full p-6 max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 border-b border-border pb-4"
      >
        <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
          <Zap size={20} className="text-accent animate-pulse" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary" style={{ fontFamily: 'var(--font-display)' }}>
            Flash Sale Dashboard
          </h1>
          <p className="text-xs text-text-secondary">
            Manage timed flash events. Customers see these on the homepage hero section.
          </p>
        </div>
      </motion.div>

      {/* Active Sale Status */}
      <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5">
        <h3 className="text-xs text-text-tertiary uppercase tracking-widest font-medium mb-4">
          Active Campaign Status
        </h3>

        {loadingActive ? (
          <div className="h-20 bg-bg-tertiary/20 rounded animate-pulse" />
        ) : activeSale ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-accent/20 bg-accent/5"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-ping" />
                <span className="w-2.5 h-2.5 rounded-full bg-accent absolute" />
                <span className="text-sm font-bold text-text-primary ml-3">{activeSale.title}</span>
              </div>
              <p className="text-xs text-text-secondary">
                Running from {formatDateTime(activeSale.startTime)} to {formatDateTime(activeSale.endTime)}
              </p>
              <div className="text-[11px] text-text-tertiary">
                Products: {activeSale.products?.map((p) => p.name).join(', ') || 'None'}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className="text-right">
                <p className="text-[10px] text-text-tertiary uppercase tracking-wider">Time Remaining</p>
                <p className="text-base font-mono font-extrabold text-accent">{timerStr}</p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setTermSaleId(activeSale._id)}
                loading={terminating}
              >
                Terminate Early
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center border border-dashed border-border rounded-xl">
            <Clock size={24} className="text-text-tertiary mb-2" />
            <p className="text-sm text-text-secondary font-medium">No Active Flash Sale</p>
            <p className="text-xs text-text-tertiary mt-1">
              Create a timed sale event below to showcase products on the landing page.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Create Form */}
        <div className="lg:col-span-7 space-y-4">
          <form onSubmit={handleLaunch} className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5 space-y-4">
            <h3 className="text-xs text-text-tertiary uppercase tracking-widest font-medium">
              Create Timed Sale
            </h3>

            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                Campaign Title
              </label>
              <input
                type="text"
                placeholder="e.g. Midnight Power Hour, Weekend Rush"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={hasActiveSale}
                className="w-full bg-bg-tertiary border border-border rounded-[var(--radius-md)] px-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-accent disabled:opacity-50"
              />
            </div>

            {/* Duration slider */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs font-medium text-text-secondary uppercase tracking-widest">
                <span>Duration</span>
                <span className="text-accent font-mono font-bold">{duration} Hour{duration > 1 ? 's' : ''}</span>
              </div>
              <input
                type="range"
                min="1"
                max="24"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={hasActiveSale}
                className="w-full accent-accent bg-bg-tertiary cursor-pointer disabled:opacity-50"
              />
              <div className="flex justify-between text-[9px] text-text-tertiary font-mono">
                <span>1h</span>
                <span>6h (default)</span>
                <span>12h</span>
                <span>24h</span>
              </div>
            </div>

            {/* Product Selector */}
            <div className="flex flex-col gap-1.5 relative" ref={dropdownRef}>
              <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
                Add Products
              </label>
              <div className="relative">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  type="text"
                  placeholder="Search products with active discount price..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)}
                  disabled={hasActiveSale}
                  className="w-full bg-bg-tertiary border border-border rounded-[var(--radius-md)] pl-9 pr-4 py-2.5 text-sm text-text-primary placeholder-text-tertiary outline-none focus:border-accent disabled:opacity-50"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Search results dropdown */}
              <AnimatePresence>
                {showDropdown && search.trim() && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute z-20 left-0 right-0 top-full mt-1 bg-bg-secondary border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto"
                  >
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((p) => (
                        <button
                          key={p._id}
                          type="button"
                          onClick={() => handleSelectProduct(p)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-bg-tertiary text-left text-xs transition-colors border-b border-border/40 last:border-0"
                        >
                          {p.images?.[0] ? (
                            <img src={p.images[0]} alt="" className="w-8 h-8 object-cover rounded" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-bg-tertiary flex items-center justify-center"><Package size={12} /></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-text-primary truncate">{p.name}</p>
                            <p className="text-[10px] text-text-tertiary">
                              Orig: PKR {p.price.toLocaleString()} · Sale: <span className="text-accent font-semibold">PKR {p.discountPrice.toLocaleString()}</span>
                            </p>
                          </div>
                          <Plus size={14} className="text-accent shrink-0" />
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-text-tertiary">
                        No products found with an active discount price set.
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>



            {/* Selected Products list */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-wider block">
                Selected Products ({selectedProds.length})
              </label>
              {selectedProds.length > 0 ? (
                <div className="space-y-1.5">
                  {selectedProds.map((prod) => (
                    <div
                      key={prod._id}
                      className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-bg-tertiary/40"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {prod.images?.[0] ? (
                          <img src={prod.images[0]} alt="" className="w-8 h-8 object-cover rounded" />
                        ) : (
                          <div className="w-8 h-8 rounded bg-bg-tertiary flex items-center justify-center"><Package size={12} /></div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">{prod.name}</p>
                          <p className="text-[10px] text-accent font-bold">
                            PKR {prod.discountPrice?.toLocaleString()} <span className="text-text-tertiary line-through font-normal text-[9px] ml-1">PKR {prod.price?.toLocaleString()}</span>
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(prod._id)}
                        className="text-text-tertiary hover:text-error transition-colors p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-text-tertiary italic">No products added. Search and select above.</p>
              )}
            </div>

            {/* Launch CTA */}
            <div className="pt-2">
              {hasActiveSale ? (
                <div className="flex items-start gap-2 p-3 bg-warning/10 border border-warning/30 rounded-lg text-warning text-xs">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <p>A flash sale campaign is currently running. You must terminate it or wait for it to expire before launching a new one.</p>
                </div>
              ) : (
                <Button
                  type="submit"
                  variant="gold"
                  className="w-full"
                  loading={creating}
                  disabled={selectedProds.length === 0}
                >
                  Launch Flash Sale
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Right Column: Information/Best Practices */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5 space-y-4">
            <h3 className="text-xs text-text-tertiary uppercase tracking-widest font-medium flex items-center gap-1.5">
              <Sparkles size={13} className="text-accent" /> How Flash Sales Work
            </h3>
            
            <ul className="space-y-3 text-xs text-text-secondary leading-relaxed list-disc pl-4">
              <li>
                <strong>One Live Event:</strong> The system enforces only one active flash sale at a time for optimal homepage focus.
              </li>
              <li>
                <strong>Discount Pre-requisite:</strong> Products must have a <code>Discount Price</code> set in their basic details before they can be added to flash sales.
              </li>
              <li>
                <strong>Automated Expiry:</strong> Once the duration ends, the server-side cron job will automatically mark the sale as inactive.
              </li>
              <li>
                <strong>Cart Pricing Integrity:</strong> User carts automatically retrieve active product pricing. When a flash sale ends (or the discount is removed), cart pricing instantly synchronizes to the base price.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="bg-bg-secondary border border-border rounded-[var(--radius-lg)] p-5">
        <h3 className="text-xs text-text-tertiary uppercase tracking-widest font-medium mb-4 flex items-center gap-1.5">
          <Calendar size={13} /> Campaign History
        </h3>

        {loadingAll ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-bg-tertiary/20 rounded animate-pulse" />
            ))}
          </div>
        ) : allSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-text-tertiary uppercase tracking-wider">
                  <th className="py-2.5 font-medium">Campaign</th>
                  <th className="py-2.5 font-medium">Timeline</th>
                  <th className="py-2.5 font-medium">Products</th>
                  <th className="py-2.5 font-medium">Created By</th>
                  <th className="py-2.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {allSales.map((sale) => {
                  const isFutureOrActive = new Date(sale.endTime) > new Date() && sale.isActive
                  return (
                    <tr key={sale._id} className="text-text-secondary hover:bg-bg-tertiary/20">
                      <td className="py-3 pr-2">
                        <span className="font-semibold text-text-primary block">{sale.title}</span>
                        <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded font-mono font-bold mt-1 uppercase ${
                          isFutureOrActive
                            ? 'text-accent bg-accent/10 border border-accent/25'
                            : 'text-text-tertiary bg-bg-tertiary border border-border'
                        }`}>
                          {isFutureOrActive ? 'Active' : 'Expired'}
                        </span>
                      </td>
                      <td className="py-3 pr-2 whitespace-nowrap">
                        <p className="font-medium text-text-primary">{sale.duration} Hours</p>
                        <p className="text-[10px] text-text-tertiary mt-0.5">Ended: {formatDateTime(sale.endTime)}</p>
                      </td>
                      <td className="py-3 pr-2 max-w-[200px] truncate" title={sale.products?.map(p => p.name).join(', ')}>
                        {sale.products?.length || 0} items
                      </td>
                      <td className="py-3 pr-2">
                        <p className="text-text-primary">{sale.createdBy?.name || 'Admin'}</p>
                        <p className="text-[10px] text-text-tertiary">{sale.createdBy?.email || ''}</p>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => setDelSaleId(sale._id)}
                          disabled={sale.isActive && isFutureOrActive}
                          className="text-text-tertiary hover:text-error disabled:opacity-30 disabled:pointer-events-none p-1.5"
                          title="Delete history record"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-text-tertiary text-center py-6">No campaign history recorded.</p>
        )}
      </div>

      {/* Confirm Dialog: Terminate Sale */}
      <ConfirmDialog
        isOpen={!!termSaleId}
        onClose={() => setTermSaleId(null)}
        onConfirm={handleTerminate}
        loading={terminating}
        title="Terminate Flash Sale?"
        message="This will instantly end the flash sale event for all users."
        confirmLabel="Terminate"
        variant="danger"
      />

      {/* Confirm Dialog: Delete Record */}
      <ConfirmDialog
        isOpen={!!delSaleId}
        onClose={() => setDelSaleId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Sale Record?"
        message="This will remove the campaign record from your logs permanently."
        confirmLabel="Delete"
        variant="danger"
      />

    </div>
  )
}
