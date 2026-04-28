import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { normalizeTimeLabel } from '../../utils/calendar'
import StatusChip from './StatusChip'

function formatDateTime(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function RequestDetailsDialog({ open, request, loading, onClose }) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Detalhes da solicitação</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {request?.student_name || `Aluno #${request?.student_id || '-'}`}
            </Typography>
            {request ? <StatusChip status={request.status} /> : null}
          </Stack>

          <Divider />

          <DetailRow label="Data solicitada" value={request?.requested_date || '-'} />
          <DetailRow
            label="Horário"
            value={
              request
                ? `${normalizeTimeLabel(request.start_time)} - ${normalizeTimeLabel(request.end_time)}`
                : '-'
            }
          />
          <DetailRow label="Student ID" value={request?.student_id || '-'} />
          <DetailRow label="Teacher ID" value={request?.teacher_id || '-'} />
          <DetailRow label="Mensagem do aluno" value={request?.student_message || '-'} />
          <DetailRow label="Mensagem do admin" value={request?.admin_message || '-'} />
          <DetailRow label="Criada em" value={formatDateTime(request?.created_at)} />
          <DetailRow label="Atualizada em" value={formatDateTime(request?.updated_at)} />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function DetailRow({ label, value }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="subtitle2">{label}</Typography>
      <Typography color="text.secondary">{value}</Typography>
    </Stack>
  )
}

export default RequestDetailsDialog
