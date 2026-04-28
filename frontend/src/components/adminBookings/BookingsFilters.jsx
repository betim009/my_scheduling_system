import { Button, MenuItem, Paper, Stack, TextField } from '@mui/material'

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'cancelled', label: 'Cancelado' },
  { value: 'completed', label: 'Concluído' },
  { value: 'no_show', label: 'No-show' },
]

function BookingsFilters({ filters, loading, onChange, onApply, onReset }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 1 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            select
            name="status"
            label="Status"
            value={filters.status}
            onChange={onChange}
            fullWidth
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value || 'all'} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            name="booking_date"
            label="Data da aula"
            type="date"
            value={filters.booking_date}
            onChange={onChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            name="student_id"
            label="ID do aluno"
            value={filters.student_id}
            onChange={onChange}
            fullWidth
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button variant="contained" onClick={onApply} disabled={loading}>
            Aplicar filtros
          </Button>
          <Button variant="outlined" onClick={onReset} disabled={loading}>
            Limpar
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default BookingsFilters
