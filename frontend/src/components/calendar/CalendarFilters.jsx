import {
  CalendarViewMonthRounded,
  FilterAltRounded,
  ViewWeekRounded,
} from '@mui/icons-material'
import {
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from '@mui/material'
import SlotStatusChip from '../status/SlotStatusChip'

const filterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'available', label: 'Disponíveis' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'booked', label: 'Reservados' },
  { value: 'blocked', label: 'Bloqueados' },
]

function getRoleHelper(currentUserRole) {
  return currentUserRole === 'admin'
    ? 'Leitura operacional com foco em pendências, reservas e bloqueios.'
    : 'Encontre horários livres com mais rapidez e solicite diretamente pelo painel do dia.'
}

function CalendarFilters({
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  currentUserRole,
  monthSummary,
}) {
  return (
    <Paper
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 1,
        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', lg: 'center' }}
      >
        <Stack spacing={0.75}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FilterAltRounded color="primary" fontSize="small" />
            <Typography variant="subtitle1" fontWeight={700}>
              Filtros e visualização
            </Typography>
          </Stack>
          <Typography color="text.secondary">{getRoleHelper(currentUserRole)}</Typography>
        </Stack>

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', md: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, nextValue) => {
              if (nextValue) {
                onViewModeChange(nextValue)
              }
            }}
            size="small"
          >
            <ToggleButton value="month">
              <CalendarViewMonthRounded fontSize="small" sx={{ mr: 0.75 }} />
              Mês
            </ToggleButton>
            <ToggleButton value="week">
              <ViewWeekRounded fontSize="small" sx={{ mr: 0.75 }} />
              Semana
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={(_, nextValue) => {
              if (nextValue) {
                onStatusFilterChange(nextValue)
              }
            }}
            size="small"
            sx={{ flexWrap: 'wrap' }}
          >
            {filterOptions.map((option) => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center', mr: 0.5 }}>
          Resumo do período:
        </Typography>
        <StatusMetric label="Total" value={monthSummary.total} />
        <StatusMetric label="Disponíveis" value={monthSummary.available} status="available" />
        <StatusMetric label="Pendentes" value={monthSummary.pending} status="pending" />
        <StatusMetric label="Reservados" value={monthSummary.booked} status="booked" />
        <StatusMetric label="Bloqueados" value={monthSummary.blocked} status="blocked" />
      </Stack>
    </Paper>
  )
}

function StatusMetric({ label, value, status }) {
  if (!value && status) {
    return null
  }

  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      {status ? <SlotStatusChip status={status} /> : null}
      <Typography variant="body2" color="text.secondary">
        {label}: <strong>{value}</strong>
      </Typography>
    </Stack>
  )
}

export default CalendarFilters
