import { Button, MenuItem, Paper, Stack, TextField } from '@mui/material'

const statusOptions = [
  { label: 'Todos os status', value: '' },
  { label: 'Aguardando', value: 'pending' },
  { label: 'Aprovada', value: 'approved' },
  { label: 'Rejeitada', value: 'rejected' },
  { label: 'Cancelada', value: 'cancelled' },
]

function RequestsFilters({ filters, onChange, onApply, onReset, loading }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 1 }}>
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
        <TextField
          select
          label="Status"
          name="status"
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
          label="Data solicitada"
          name="requested_date"
          type="date"
          value={filters.requested_date}
          onChange={onChange}
          InputLabelProps={{ shrink: true }}
          fullWidth
        />

        <TextField
          label="Student ID"
          name="student_id"
          value={filters.student_id}
          onChange={onChange}
          fullWidth
        />

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button variant="outlined" onClick={onReset} disabled={loading}>
            Limpar
          </Button>
          <Button variant="contained" onClick={onApply} disabled={loading}>
            Aplicar
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default RequestsFilters
