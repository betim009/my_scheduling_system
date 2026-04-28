import StatusChip from '../common/StatusChip'

const statusConfig = {
  confirmed: {
    label: 'Confirmado',
    color: 'success',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'default',
  },
  completed: {
    label: 'Concluído',
    color: 'primary',
  },
  no_show: {
    label: 'No-show',
    color: 'warning',
  },
}

function BookingStatusChip({ status }) {
  return <StatusChip status={status} map={statusConfig} />
}

export default BookingStatusChip
