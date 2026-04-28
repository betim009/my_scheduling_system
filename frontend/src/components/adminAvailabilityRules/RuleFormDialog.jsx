import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  MenuItem,
  Stack,
  Switch,
  TextField,
} from '@mui/material'
import { apiWeekdayOptions, normalizeTimeForInput } from '../../utils/scheduleAdmin'

function RuleFormDialog({
  open,
  mode,
  formData,
  loading,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {mode === 'create' ? 'Nova regra da agenda' : 'Editar regra da agenda'}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            select
            label="Dia da semana"
            name="weekday"
            value={formData.weekday}
            onChange={onChange}
            required
            fullWidth
          >
            {apiWeekdayOptions.map((option) => (
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
              required
              fullWidth
            />

            <TextField
              label="Fim"
              name="end_time"
              type="time"
              value={normalizeTimeForInput(formData.end_time)}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
          </Stack>

          <TextField
            label="Duração do slot (min)"
            name="slot_duration_minutes"
            type="number"
            value={formData.slot_duration_minutes}
            onChange={onChange}
            required
            fullWidth
          />

          <FormControlLabel
            control={
              <Switch
                checked={Boolean(formData.is_active)}
                onChange={(event) =>
                  onChange({
                    target: {
                      name: 'is_active',
                      value: event.target.checked,
                    },
                  })
                }
              />
            }
            label="Regra ativa"
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={onSubmit} variant="contained" loading={loading}>
          {mode === 'create' ? 'Criar regra' : 'Salvar alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RuleFormDialog
