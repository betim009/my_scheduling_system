import { Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import PlanRequestStatusChip from '../planRequests/PlanRequestStatusChip'

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function PlanRequestsTable({ requests, loadingId, onApprove, onReject }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Aluno</TableCell>
            <TableCell>Plano</TableCell>
            <TableCell>Aulas</TableCell>
            <TableCell>Preço</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Solicitada em</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {requests.map((request) => {
            const isPending = request.status === 'pending'

            return (
              <TableRow key={request.id} hover>
                <TableCell>{request.student_name}</TableCell>
                <TableCell>{request.plan_name}</TableCell>
                <TableCell>{request.total_classes}</TableCell>
                <TableCell>{formatCurrency(request.price)}</TableCell>
                <TableCell>
                  <PlanRequestStatusChip status={request.status} />
                </TableCell>
                <TableCell>{request.created_at}</TableCell>
                <TableCell align="right">
                  <Button
                    size="small"
                    variant="contained"
                    onClick={() => onApprove(request)}
                    loading={loadingId === request.id}
                    disabled={!isPending}
                  >
                    Aprovar
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => onReject(request)}
                    disabled={!isPending || loadingId === request.id}
                  >
                    Rejeitar
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default PlanRequestsTable
