import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { normalizeTimeLabel } from '../../utils/calendar'
import { getExceptionTypeLabel } from '../../utils/scheduleAdmin'

function ExceptionsTable({ exceptions, loadingId, onEdit, onDelete }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User ID</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Tipo</TableCell>
            <TableCell>Início</TableCell>
            <TableCell>Fim</TableCell>
            <TableCell>Motivo</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {exceptions.map((exception) => (
            <TableRow key={exception.id} hover>
              <TableCell>{exception.user_id}</TableCell>
              <TableCell>{exception.exception_date}</TableCell>
              <TableCell>{getExceptionTypeLabel(exception.type)}</TableCell>
              <TableCell>{exception.start_time ? normalizeTimeLabel(exception.start_time) : '-'}</TableCell>
              <TableCell>{exception.end_time ? normalizeTimeLabel(exception.end_time) : '-'}</TableCell>
              <TableCell>{exception.reason || '-'}</TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => onEdit(exception)}>
                  Editar
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => onDelete(exception)}
                  loading={loadingId === exception.id}
                >
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ExceptionsTable
