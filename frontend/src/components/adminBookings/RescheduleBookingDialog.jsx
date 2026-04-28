import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { formatLongDate, normalizeTimeLabel } from '../../utils/calendar'

function RescheduleBookingDialog({
  open,
  booking,
  form,
  loading,
  onChange,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Reagendar agendamento</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Typography color="text.secondary">
            O reagendamento cancela o booking atual, reserva um novo slot disponível e mantém a
            mesma assinatura sem consumir aula extra.
          </Typography>

          {booking ? (
            <Alert severity="info">
              Atual: {formatLongDate(booking.booking_date)} •{' '}
              {normalizeTimeLabel(booking.start_time)} - {normalizeTimeLabel(booking.end_time)}
            </Alert>
          ) : null}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Nova data"
              name="new_date"
              type="date"
              value={form.new_date}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Início"
              name="new_start_time"
              type="time"
              value={form.new_start_time}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              fullWidth
            />
            <TextField
              label="Fim"
              name="new_end_time"
              type="time"
              value={form.new_end_time}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              inputProps={{ step: 300 }}
              fullWidth
            />
          </Stack>

          <TextField
            label="Observação do reagendamento"
            name="notes"
            value={form.notes}
            onChange={onChange}
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
        <Button onClick={onConfirm} disabled={loading} variant="contained">
          {loading ? 'Reagendando...' : 'Confirmar reagendamento'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RescheduleBookingDialog
