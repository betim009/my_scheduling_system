import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import SubscriptionStatusChip from './SubscriptionStatusChip'

function SubscriptionsTable({
  subscriptions,
  loadingId,
  onEdit,
  onAdjustClasses,
}) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Aluno</TableCell>
            <TableCell>Plano</TableCell>
            <TableCell>Total</TableCell>
            <TableCell>Restantes</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Início</TableCell>
            <TableCell>Fim</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {subscriptions.map((subscription) => (
            <TableRow key={subscription.id} hover>
              <TableCell>{subscription.student_name || `Aluno #${subscription.student_id}`}</TableCell>
              <TableCell>{subscription.plan_name}</TableCell>
              <TableCell>{subscription.total_classes}</TableCell>
              <TableCell>{subscription.remaining_classes}</TableCell>
              <TableCell><SubscriptionStatusChip status={subscription.status} /></TableCell>
              <TableCell>{subscription.start_date}</TableCell>
              <TableCell>{subscription.end_date}</TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => onEdit(subscription)}>
                  Editar
                </Button>
                <Button
                  size="small"
                  onClick={() => onAdjustClasses(subscription)}
                  loading={loadingId === subscription.id}
                >
                  Ajustar aulas
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default SubscriptionsTable
