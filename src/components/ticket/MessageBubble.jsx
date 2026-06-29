import { motion } from 'framer-motion'
import Avatar from '../ui/Avatar'
import { formatDateTime } from '../../utils/formatDate'
import { cn } from '../../utils/cn'

export default function MessageBubble({ message, isOwn = false }) {
  const { sender, text, createdAt, attachments = [] } = message

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex gap-2.5 max-w-[85%]',
        isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto',
      )}
    >
      {/* Avatar */}
      <Avatar
        name={sender?.name}
        src={sender?.avatar}
        size="xs"
        className="shrink-0 mt-1"
      />

      <div className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
        {/* Name */}
        <p className="text-[10px] text-text-tertiary px-1">
          {sender?.name}
          {sender?.role && sender.role !== 'user' && (
            <span className="ml-1 text-accent uppercase tracking-widest text-[9px]">
              · {sender.role}
            </span>
          )}
        </p>

        {/* Bubble */}
        <div
          className={cn(
            'px-3.5 py-2.5 rounded-[var(--radius-md)] max-w-full',
            'text-sm leading-relaxed',
            isOwn
              ? 'bg-accent/15 text-text-primary border border-accent/20 rounded-tr-sm'
              : 'bg-bg-tertiary text-text-primary border border-border rounded-tl-sm',
          )}
        >
          <p className="whitespace-pre-wrap break-words">{text}</p>

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {attachments.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-xs text-accent hover:text-accent-light underline truncate"
                >
                  Attachment {i + 1}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-[10px] text-text-tertiary px-1">
          {formatDateTime(createdAt)}
        </p>
      </div>
    </motion.div>
  )
}
