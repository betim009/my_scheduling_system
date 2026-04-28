import {
  Button,
  Paper,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { normalizeTimeLabel } from '../../utils/calendar'
import { getWeekdayLabel } from '../../utils/scheduleAdmin'

function RulesTable({ rules, loadingId, onEdit, onDelete }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User ID</TableCell>
            <TableCell>Dia</TableCell>
            <TableCell>Início</TableCell>
            <TableCell>Fim</TableCell>
            <TableCell>Duração</TableCell>
            <TableCell>Ativa</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule.id} hover>
              <TableCell>{rule.user_id}</TableCell>
              <TableCell>{getWeekdayLabel(rule.weekday)}</TableCell>
              <TableCell>{normalizeTimeLabel(rule.start_time)}</TableCell>
              <TableCell>{normalizeTimeLabel(rule.end_time)}</TableCell>
              <TableCell>{rule.slot_duration_minutes} min</TableCell>
              <TableCell>
                <Switch checked={Boolean(rule.is_active)} disabled />
              </TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => onEdit(rule)}>
                  Editar
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => onDelete(rule)}
                  loading={loadingId === rule.id}
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

export default RulesTable
