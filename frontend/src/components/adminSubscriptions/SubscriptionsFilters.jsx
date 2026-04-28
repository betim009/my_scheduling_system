import { FilterAltRounded, RefreshRounded } from '@mui/icons-material'
import { Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material'

const statusOptions = [
  { value: '', label: 'Todos os status' },
  { value: 'active', label: 'Ativa' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'expired', label: 'Expirada' },
]

function getActiveFiltersCount(filters) {
  return Object.values(filters).filter(Boolean).length
}

function SubscriptionsFilters({
  filters,
  students,
  plans,
  loading,
  onChange,
  onApply,
  onReset,
}) {
  const activeFiltersCount = getActiveFiltersCount(filters)

  return (
    <Paper sx={{ p: 3, borderRadius: 1 }}>
      <Stack spacing={2.5}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterAltRounded color="primary" fontSize="small" />
              <Typography variant="h6">Filtros de assinaturas</Typography>
            </Stack>
            <Typography color="text.secondary">
              {activeFiltersCount > 0
                ? `${activeFiltersCount} filtro(s) ativo(s).`
                : 'Refine a listagem por aluno, plano ou status.'}
            </Typography>
          </Stack>

          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            onClick={onReset}
            disabled={loading}
          >
            Limpar filtros
          </Button>
        </Stack>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
          <TextField
            select
            label="Aluno"
            name="student_id"
            value={filters.student_id}
            onChange={onChange}
            fullWidth
          >
            <MenuItem value="">Todos os alunos</MenuItem>
            {students.map((student) => (
              <MenuItem key={student.id} value={String(student.id)}>
                {student.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Plano"
            name="plan_id"
            value={filters.plan_id}
            onChange={onChange}
            fullWidth
          >
            <MenuItem value="">Todos os planos</MenuItem>
            {plans.map((plan) => (
              <MenuItem key={plan.id} value={String(plan.id)}>
                {plan.name}
              </MenuItem>
            ))}
          </TextField>

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
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
          <Button variant="contained" onClick={onApply} disabled={loading}>
            Aplicar filtros
          </Button>
          <Button variant="text" onClick={onReset} disabled={loading}>
            Mostrar tudo
          </Button>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default SubscriptionsFilters
