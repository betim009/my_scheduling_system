import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { formatLongDate, normalizeTimeLabel } from '../../utils/calendar'

function CancelBookingDialog({
  open,
  booking,
  notes,
  loading,
  onChangeNotes,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Cancelar agendamento</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography color="text.secondary">
            O cancelamento libera o slot novamente, mas não devolve aula automaticamente para a
            assinatura nesta etapa.
          </Typography>

          {booking ? (
            <Alert severity="warning">
              {formatLongDate(booking.booking_date)} • {normalizeTimeLabel(booking.start_time)} -{' '}
              {normalizeTimeLabel(booking.end_time)}
            </Alert>
          ) : null}

          <TextField
            label="Observação do cancelamento"
            value={notes}
            onChange={(event) => onChangeNotes(event.target.value)}
            multiline
            minRows={3}
            placeholder="Opcional"
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Fechar
        </Button>
        <Button onClick={onConfirm} disabled={loading} color="warning" variant="contained">
          {loading ? 'Cancelando...' : 'Confirmar cancelamento'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CancelBookingDialog
