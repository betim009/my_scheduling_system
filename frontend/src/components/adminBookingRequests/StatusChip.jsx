import { Chip } from '@mui/material'

const statusMap = {
  pending: {
    label: 'Aguardando',
    color: 'warning',
  },
  approved: {
    label: 'Aprovada',
    color: 'success',
  },
  rejected: {
    label: 'Rejeitada',
    color: 'error',
  },
  cancelled: {
    label: 'Cancelada',
    color: 'default',
  },
}

function StatusChip({ status }) {
  const config = statusMap[status] || {
    label: status,
    color: 'default',
  }

  return <Chip label={config.label} color={config.color} sx={{ fontWeight: 700 }} />
}

export default StatusChip
