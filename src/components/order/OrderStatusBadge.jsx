import Badge from '../ui/Badge'

const STATUS_MAP = {
  pending:    { variant: 'warning', label: 'Pending'     },
  confirmed:  { variant: 'info',    label: 'Confirmed'   },
  processing: { variant: 'info',    label: 'Processing'  },
  shipped:    { variant: 'gold',    label: 'Shipped'     },
  delivered:  { variant: 'success', label: 'Delivered'   },
  cancelled:  { variant: 'error',   label: 'Cancelled'   },
  refunded:   { variant: 'muted',   label: 'Refunded'    },
}

export default function OrderStatusBadge({ status, dot = true }) {
  const config = STATUS_MAP[status?.toLowerCase()] || {
    variant: 'muted', label: status || 'Unknown',
  }
  return <Badge variant={config.variant} dot={dot}>{config.label}</Badge>
}
