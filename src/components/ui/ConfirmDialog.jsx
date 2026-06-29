import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'
import Button from './Button'

/**
 * ConfirmDialog — reusable destructive action confirmation
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title     = 'Are you sure?',
  message   = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  loading      = false,
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={null} size="sm" hideClose>
      <div className="flex flex-col items-center gap-4 text-center py-2">
        <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
          <AlertTriangle size={22} className="text-error" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-text-primary font-[var(--font-display)] mb-1">
            {title}
          </h3>
          <p className="text-sm text-text-secondary">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button
            variant="ghost"
            className="flex-1"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            className="flex-1"
            onClick={onConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
