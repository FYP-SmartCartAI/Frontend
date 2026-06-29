import { Check } from 'lucide-react'
import { passwordChecks } from '../../utils/passwordHelpers'

const REQUIREMENTS = [
  { key: 'minLength', label: 'At least 8 characters' },
  { key: 'maxLength', label: 'At most 25 characters' },
  { key: 'uppercase', label: 'One uppercase letter (A–Z)' },
  { key: 'lowercase', label: 'One lowercase letter (a–z)' },
  { key: 'number',    label: 'One number (0–9)' },
  { key: 'special',   label: 'One special character (!@#$…)' },
]

export default function PasswordRequirements({ password = '' }) {
  const checks = passwordChecks(password)

  return (
    <div className="mt-3 p-3 bg-bg-tertiary/40 border border-border rounded-[var(--radius-md)] space-y-2 text-[11px] font-[var(--font-body)]">
      <p className="font-semibold text-text-secondary tracking-wide uppercase text-[9px] mb-1">
        Password requirements
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
        {REQUIREMENTS.map(({ key, label }) => {
          const met = checks[key]
          return (
            <li key={key} className="flex items-center gap-2">
              <div
                className={`w-3.5 h-3.5 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                  met
                    ? 'bg-success/15 border border-success/35 text-success'
                    : 'border border-border-accent'
                }`}
              >
                {met && <Check size={8} strokeWidth={3.5} />}
              </div>
              <span
                className={`transition-colors duration-200 ${
                  met ? 'text-text-secondary line-through opacity-70' : 'text-text-secondary'
                }`}
              >
                {label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
