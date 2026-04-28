import StatusChip from '../common/StatusChip'

const statusMap = {
  pending: {
    label: 'Pendente',
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
}

function PlanRequestStatusChip({ status }) {
  return <StatusChip status={status} map={statusMap} />
}

export default PlanRequestStatusChip
