import { cn } from '../../utils/cn'

/**
 * Spinner — animated gold ring loader
 * sizes: sm | md | lg | xl
 */
const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
  xl: 'w-12 h-12 border-4',
}

export default function Spinner({ size = 'md', className }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block rounded-full',
        'border-border-accent border-t-accent',
        'animate-spin',
        sizes[size],
        className,
      )}
    />
  )
}

/**
 * FullPageSpinner — luxury geometric orbit loader centered on screen
 */
export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary">
      <div className="relative flex items-center justify-center w-36 h-36">
        {/* Outer Orbit - Dashed luxury gold ring rotating clockwise */}
        <div className="absolute w-32 h-32 rounded-full border border-dashed border-accent/60 animate-orbit-cw" />

        {/* Middle Orbit - Solid gold ring with a glowing luxury orbital bead rotating counter-clockwise */}
        <div className="absolute w-24 h-24 rounded-full border border-accent/20 animate-orbit-ccw flex items-center justify-start">
          <div className="w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)] -ml-1" />
        </div>

        {/* Inner Orbit - Rotating diamond-shaped gold frame */}
        <div className="absolute w-16 h-16 rounded-[var(--radius-sm)] border border-accent/40 rotate-45 animate-[luxury-orbit-cw_5s_linear_infinite]" />

        {/* Glowing Gold Monogram Core */}
        <div className="absolute flex items-center justify-center w-10 h-10 rounded-full bg-bg-secondary border border-border animate-core-glow select-none">
          <span 
            className="text-xs font-bold text-accent tracking-widest uppercase"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            S
          </span>
        </div>
      </div>
      
      {/* Branding tagline */}
      <div className="mt-8 flex flex-col items-center select-none text-center">
        <h2 
          className="text-sm font-semibold tracking-[0.3em] text-text-primary uppercase mb-1"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          SmartCart
        </h2>
        <span className="text-[9px] tracking-[0.4em] text-text-tertiary uppercase font-mono">
          Intelligent Commerce
        </span>
      </div>
    </div>
  )
}
