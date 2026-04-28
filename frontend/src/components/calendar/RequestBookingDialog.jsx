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
import { normalizeTimeLabel } from '../../utils/calendar'

function RequestBookingDialog({
  open,
  slot,
  loading,
  message,
  errorMessage,
  onChangeMessage,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Solicitar horário</DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {slot ? (
            <Stack spacing={0.75}>
              <Typography variant="subtitle1" fontWeight={700}>
                {slot.slot_date}
              </Typography>
              <Typography color="text.secondary">
                {normalizeTimeLabel(slot.start_time)} - {normalizeTimeLabel(slot.end_time)}
              </Typography>
            </Stack>
          ) : null}

          {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

          <TextField
            label="Mensagem para o admin"
            value={message}
            onChange={(event) => onChangeMessage(event.target.value)}
            multiline
            minRows={3}
            placeholder="Opcional"
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={onConfirm} variant="contained" disabled={loading || !slot} loading={loading}>
          Confirmar solicitação
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RequestBookingDialog
