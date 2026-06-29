import { useDispatch, useSelector } from 'react-redux'
import { Sun, Moon } from 'lucide-react'
import { toggleTheme } from '../../store/slices/uiSlice'

export default function ThemeToggle({ className }) {
  const dispatch = useDispatch()
  const theme = useSelector((state) => state.ui.theme)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      onClick={() => dispatch(toggleTheme())}
      className={`w-8 h-8 flex items-center justify-center rounded-[var(--radius-sm)] text-text-tertiary hover:text-accent hover:bg-bg-tertiary transition-all ${className || ''}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  )
}
