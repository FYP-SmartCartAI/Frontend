import toast from 'react-hot-toast'

export function showNotificationToast(title, body) {
  toast.success(
    <div className="flex flex-col gap-0.5">
      <strong className="block text-accent font-semibold">{title}</strong>
      {body ? <span className="text-xs text-[#d1d1d6]">{body}</span> : null}
    </div>,
    { duration: 5000, icon: '🔔' },
  )
}
