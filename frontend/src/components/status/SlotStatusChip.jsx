import StatusChip from '../common/StatusChip'

const statusConfig = {
  available: {
    label: 'Disponível',
    color: 'success',
  },
  pending: {
    label: 'Pendente',
    color: 'warning',
  },
  booked: {
    label: 'Reservado',
    color: 'error',
  },
  blocked: {
    label: 'Bloqueado',
    color: 'default',
  },
}

function SlotStatusChip({ status }) {
  return <StatusChip status={status} map={statusConfig} />
}

export default SlotStatusChip
