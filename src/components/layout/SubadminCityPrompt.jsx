import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Building2, ChevronDown } from 'lucide-react'
import Modal  from '../ui/Modal'
import Button from '../ui/Button'
import { useUpdateProfileMutation } from '../../store/api/authApi'
import { updateUser } from '../../store/slices/authSlice'
import { normalizeAuthUser } from '../../utils/normalizeAuthUser'
import { PAKISTAN_CITIES } from '../../constants/pakistanCities'
import toast from 'react-hot-toast'

/**
 * Blocking modal shown to a sub-admin who has no managed city set.
 * Their assigned city drives support-ticket routing, so it must be set
 * before they can operate. The modal cannot be dismissed until saved.
 */
export default function SubadminCityPrompt() {
  const dispatch = useDispatch()
  const [city, setCity] = useState('')
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()

  const handleSubmit = async (e) => {
    e.preventDefault()
    const trimmed = city.trim()
    if (!trimmed) return toast.error('Please enter your city')
    try {
      const result = await updateProfile({ city: trimmed }).unwrap()
      const savedUser = result?.user ?? result
      dispatch(updateUser(normalizeAuthUser(savedUser)))
      toast.success('City saved')
    } catch (err) {
      toast.error(err?.data?.message || 'Could not save city')
    }
  }

  return (
    <Modal isOpen onClose={() => {}} hideClose title="Set Your City">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <Building2 size={16} className="text-accent" />
          </div>
          <p className="text-sm text-text-secondary leading-relaxed">
            As a sub-admin, support tickets and orders are routed to you based on
            your assigned city. Please enter the city you manage to continue.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
            Managed City
          </label>
          <div className="relative flex items-center">
            <select
              className="w-full appearance-none bg-bg-tertiary border border-border rounded-[var(--radius-md)] pl-4 pr-10 py-2.5 text-sm text-text-primary outline-none focus:border-accent cursor-pointer"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              autoFocus
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
        </div>

        <Button
          type="submit"
          variant="gold"
          size="md"
          className="w-full"
          loading={isLoading}
          disabled={!city.trim()}
        >
          Save & Continue
        </Button>
      </form>
    </Modal>
  )
}
