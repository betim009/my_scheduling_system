import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material'
import {
  exceptionTypeOptions,
  normalizeTimeForInput,
} from '../../utils/scheduleAdmin'

function ExceptionFormDialog({
  open,
  mode,
  formData,
  loading,
  onChange,
  onClose,
  onSubmit,
}) {
  const isFullDayBlock = formData.type === 'block_full_day'

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === 'create' ? 'Nova exceção da agenda' : 'Editar exceção da agenda'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            label="Data da exceção"
            name="exception_date"
            type="date"
            value={formData.exception_date}
            onChange={onChange}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />

          <TextField
            select
            label="Tipo"
            name="type"
            value={formData.type}
            onChange={onChange}
            required
            fullWidth
          >
            {exceptionTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Início"
              name="start_time"
              type="time"
              value={normalizeTimeForInput(formData.start_time)}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              required={!isFullDayBlock}
              disabled={isFullDayBlock}
              fullWidth
            />

            <TextField
              label="Fim"
              name="end_time"
              type="time"
              value={normalizeTimeForInput(formData.end_time)}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              required={!isFullDayBlock}
              disabled={isFullDayBlock}
              fullWidth
            />
          </Stack>

          <TextField
            label="Motivo"
            name="reason"
            value={formData.reason}
            onChange={onChange}
            multiline
            minRows={2}
            fullWidth
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={onSubmit} variant="contained" loading={loading}>
          {mode === 'create' ? 'Criar exceção' : 'Salvar alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default ExceptionFormDialog
