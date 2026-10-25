import Check from '@mui/icons-material/Check'
import ErrorOutline from '@mui/icons-material/ErrorOutline'
import type { MessageStatus } from '../types'

type StatusBadgeProps = {
  status: MessageStatus | null
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  if (!status) return <span className="na-text">NA</span>

  if (status === 'sent') {
    return <span className="status-badge status-sent">Sent</span>
  }

  return (
    <span className={`status-badge ${status === 'read' ? 'status-read' : 'status-failed'}`}>
      {status === 'read' ? <Check fontSize="small" /> : <ErrorOutline fontSize="small" />}
      {status === 'read' ? 'read' : 'Failed'}
    </span>
  )
}
