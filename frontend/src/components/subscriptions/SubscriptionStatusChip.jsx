import StatusChip from '../common/StatusChip'

const statusMap = {
  active: {
    label: 'Ativa',
    color: 'success',
  },
  completed: {
    label: 'Concluída',
    color: 'primary',
  },
  cancelled: {
    label: 'Cancelada',
    color: 'default',
  },
  expired: {
    label: 'Expirada',
    color: 'warning',
  },
}

function SubscriptionStatusChip({ status }) {
  return <StatusChip status={status} map={statusMap} />
}

export default SubscriptionStatusChip
