import { forwardRef, useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { cn } from '../../utils/cn'

/**
 * Input — Dark Luxury Commerce
 * types: text | email | password | search | number | tel
 */
const Input = forwardRef(function Input(
  {
    label,
    type      = 'text',
    error,
    hint,
    icon,
    iconRight,
    className,
    wrapperClassName,
    hideErrorText,
    ...props
  },
  ref
) {
  const [showPass, setShowPass] = useState(false)
  const isPassword = type === 'password'
  const inputType  = isPassword ? (showPass ? 'text' : 'password') : type

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
      {label && (
        <label className="text-xs font-medium text-text-secondary uppercase tracking-widest">
          {label}
        </label>
      )}

      <div className="relative flex items-center">
        {icon && (
          <span className="absolute left-3.5 text-text-tertiary pointer-events-none">
            {icon}
          </span>
        )}

        <input
          ref={ref}
          type={inputType}
          className={cn(
            'w-full bg-bg-tertiary text-text-primary placeholder-text-tertiary',
            'border border-border rounded-[var(--radius-md)]',
            'px-4 py-2.5 text-sm font-[var(--font-body)]',
            'transition-all duration-200',
            'focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30',
            'hover:border-border-accent',
            icon      && 'pl-10',
            (iconRight || isPassword) && 'pr-10',
            error     && 'border-error focus:border-error focus:ring-error/20',
            className,
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass((p) => !p)}
            className="absolute right-3.5 text-text-tertiary hover:text-accent transition-colors"
            tabIndex={-1}
            aria-label={showPass ? 'Hide password' : 'Show password'}
          >
            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}

        {iconRight && !isPassword && (
          <span className="absolute right-3.5 text-text-tertiary">
            {iconRight}
          </span>
        )}
      </div>

      {error && !hideErrorText && (
        <p className="text-xs text-error flex items-center gap-1.5 mt-1 select-none animate-fadeIn">
          <AlertCircle size={13} className="shrink-0 text-error" />
          <span>{error}</span>
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-text-tertiary">{hint}</p>
      )}
    </div>
  )
})

export default Input
