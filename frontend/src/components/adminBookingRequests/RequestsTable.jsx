import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { normalizeTimeLabel } from '../../utils/calendar'
import StatusChip from './StatusChip'

function RequestsTable({
  requests,
  loadingRequestId,
  onViewDetails,
  onApprove,
  onReject,
}) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Aluno</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Horário</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Mensagem do aluno</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id} hover>
              <TableCell>
                <Stack spacing={0.35}>
                  <Typography fontWeight={700}>
                    {request.student_name || `Aluno #${request.student_id}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {request.student_email || '-'}
                  </Typography>
                </Stack>
              </TableCell>

              <TableCell>{request.requested_date}</TableCell>
              <TableCell>
                {normalizeTimeLabel(request.start_time)} - {normalizeTimeLabel(request.end_time)}
              </TableCell>
              <TableCell>
                <StatusChip status={request.status} />
              </TableCell>
              <TableCell>{request.student_message || '-'}</TableCell>

              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                  <Button size="small" onClick={() => onViewDetails(request)}>
                    Detalhes
                  </Button>

                  {request.status === 'pending' ? (
                    <>
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        onClick={() => onApprove(request)}
                        loading={loadingRequestId === request.id}
                      >
                        Aprovar
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => onReject(request)}
                        disabled={loadingRequestId === request.id}
                      >
                        Rejeitar
                      </Button>
                    </>
                  ) : null}
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default RequestsTable
