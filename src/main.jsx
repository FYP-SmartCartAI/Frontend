import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { store } from './store/store'
import { SocketProvider } from './context/SocketContext'
import App from './App'
import './index.css'

// Custom global error toast rendering that fits the Dark Luxury theme
toast.error = (message, options) => {
  let errorText = 'An error occurred'
  if (typeof message === 'string') {
    errorText = message
  } else if (message && typeof message === 'object') {
    errorText = message.message || message.error || JSON.stringify(message)
  }

  return toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-toast-enter' : 'animate-toast-exit'
        } max-w-sm w-full bg-bg-secondary border border-border border-l-4 border-l-error shadow-card rounded-[var(--radius-md)] p-4 flex items-start gap-3 pointer-events-auto`}
      >
        {/* Pulsating error dot indicator */}
        <div className="w-2 h-2 rounded-full bg-error mt-1.5 shrink-0 animate-pulse" />

        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-error uppercase tracking-wider mb-0.5">
            Error
          </p>
          <p className="text-xs text-text-primary font-medium leading-relaxed break-words">
            {errorText}
          </p>
        </div>

        <button
          onClick={() => toast.dismiss(t.id)}
          className="text-[10px] text-text-tertiary hover:text-accent font-semibold uppercase tracking-wider transition-colors shrink-0 self-center pl-2"
        >
          Dismiss
        </button>
      </div>
    ),
    {
      position: 'top-right',
      duration: 4500,
      ...options,
    }
  )
}


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <App />
      </SocketProvider>
      <Toaster
        position="top-right"
        gutter={8}
        toastOptions={{
          duration: 3500,
          style: {
            background:  '#1A1A1F',
            color:       '#F2F0EB',
            border:      '1px solid #3D3D4A',
            borderRadius: '10px',
            fontSize:    '13px',
            fontFamily:  '"DM Sans", sans-serif',
            boxShadow:   '0 4px 24px rgba(0,0,0,0.4)',
          },
          success: {
            iconTheme: {
              primary:    '#C8A96E',
              secondary:  '#0A0A0B',
            },
          },
          error: {
            iconTheme: {
              primary:    '#F87171',
              secondary:  '#0A0A0B',
            },
          },
        }}
      />
    </Provider>
  </StrictMode>
)
