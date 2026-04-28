import { Chip } from '@mui/material'

const statusMap = {
  active: { label: 'Ativa', color: 'success' },
  completed: { label: 'Concluída', color: 'primary' },
  cancelled: { label: 'Cancelada', color: 'default' },
  expired: { label: 'Expirada', color: 'warning' },
}

function SubscriptionStatusChip({ status }) {
  const config = statusMap[status] || { label: status, color: 'default' }

  return <Chip label={config.label} color={config.color} sx={{ fontWeight: 700 }} />
}

export default SubscriptionStatusChip
