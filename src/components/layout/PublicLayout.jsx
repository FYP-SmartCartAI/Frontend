import { Outlet } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import ThemeToggle from '../ui/ThemeToggle'

/**
 * PublicLayout — minimal shell for auth pages (login, register, etc.)
 * Full-screen dark background, centered content, no sidebar/header
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Minimal branding header */}
      <div className="px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent rounded-[var(--radius-sm)] flex items-center justify-center">
            <Sparkles size={12} className="text-bg-primary" />
          </div>
          <span
            className="text-sm font-semibold text-text-primary"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            SmartCart<span className="text-accent"> AI</span>
          </span>
        </div>

        <ThemeToggle />
      </div>

      {/* Page content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Outlet />
      </main>

      {/* Subtle footer */}
      <div className="px-6 py-4 text-center">
        <p className="text-xs text-text-tertiary">
          © {new Date().getFullYear()} SmartCart AI. All rights reserved.
        </p>
      </div>
    </div>
  )
}
