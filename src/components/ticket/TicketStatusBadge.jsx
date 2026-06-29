import Badge from '../ui/Badge'

const MAP = {
  open:        { variant: 'warning', label: 'Open'        },
  in_progress: { variant: 'info',    label: 'In Progress' },
  resolved:    { variant: 'success', label: 'Resolved'    },
  closed:      { variant: 'muted',   label: 'Closed'      },
}

export default function TicketStatusBadge({ status, dot = true }) {
  const config = MAP[status?.toLowerCase()] || { variant: 'muted', label: status || 'Unknown' }
  return <Badge variant={config.variant} dot={dot}>{config.label}</Badge>
}
