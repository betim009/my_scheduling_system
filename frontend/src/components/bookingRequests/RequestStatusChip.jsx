import StatusChip from '../common/StatusChip'

const statusConfig = {
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

function RequestStatusChip({ status }) {
  return <StatusChip status={status} map={statusConfig} />
}

export default RequestStatusChip
