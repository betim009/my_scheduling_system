import { Box, Chip, Stack, Typography, alpha } from '@mui/material'
import { getStatusSummary } from '../../utils/calendar'

const statusMeta = {
  available: { label: 'Disponíveis', shortLabel: 'disp.', color: '#16a34a' },
  pending: { label: 'Pendentes', shortLabel: 'pend.', color: '#ca8a04' },
  booked: { label: 'Reservados', shortLabel: 'ocup.', color: '#dc2626' },
  blocked: { label: 'Bloqueados', shortLabel: 'bloq.', color: '#6b7280' },
}

function getRoleHighlight(summary, currentUserRole) {
  if (currentUserRole === 'student') {
    if (summary.available > 0) {
      return `${summary.available} disponível${summary.available > 1 ? 'eis' : ''}`
    }

    if (summary.pending > 0) {
      return `${summary.pending} pendente${summary.pending > 1 ? 's' : ''}`
    }

    if (summary.booked > 0) {
      return `${summary.booked} ocupado${summary.booked > 1 ? 's' : ''}`
    }

    if (summary.blocked > 0) {
      return `${summary.blocked} indisponível${summary.blocked > 1 ? 'eis' : ''}`
    }
  }

  if (summary.pending > 0) {
    return `${summary.pending} aguardando`
  }

  if (summary.booked > 0) {
    return `${summary.booked} reservado${summary.booked > 1 ? 's' : ''}`
  }

  if (summary.available > 0) {
    return `${summary.available} livre${summary.available > 1 ? 's' : ''}`
  }

  if (summary.blocked > 0) {
    return `${summary.blocked} bloqueado${summary.blocked > 1 ? 's' : ''}`
  }

  return 'Sem slots'
}

function CalendarDayCell({ day, slots, isSelected, currentUserRole, onSelectDate }) {
  const summary = getStatusSummary(slots)
  const hasSlots = slots.length > 0
  const hasAvailable = summary.available > 0
  const statusEntries = Object.entries(summary).filter(([, count]) => count > 0)

  return (
    <Box
      onClick={() => onSelectDate(day.date)}
      sx={{
        minHeight: { xs: 118, md: 140 },
        p: 1.4,
        borderRadius: 1,
        cursor: 'pointer',
        border: (theme) =>
          `1px solid ${
            isSelected
              ? theme.palette.primary.main
              : day.isToday
                ? theme.palette.secondary.main
                : alpha(theme.palette.text.primary, 0.08)
          }`,
        background: (theme) => {
          if (isSelected) {
            return `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`
          }

          if (hasAvailable) {
            return `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.04)} 0%, ${alpha('#16a34a', 0.08)} 100%)`
          }

          if (hasSlots) {
            return `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`
          }

          return day.isCurrentMonth
            ? theme.palette.background.paper
            : alpha(theme.palette.text.primary, 0.03)
        },
        opacity: day.isCurrentMonth ? 1 : 0.52,
        boxShadow: 'none',
        transition: 'border-color 0.2s ease, background-color 0.2s ease',
        '&:hover': {
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.36),
        },
      }}
    >
      <Stack justifyContent="space-between" sx={{ height: '100%' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
          <Typography variant="subtitle1" fontWeight={800}>
            {day.dayNumber}
          </Typography>

          <Stack direction="row" spacing={0.75} flexWrap="wrap" justifyContent="flex-end">
            {day.isToday ? (
              <Chip
                label="Hoje"
                size="small"
                color="secondary"
                sx={{ height: 22, fontWeight: 700 }}
              />
            ) : null}
            {isSelected ? (
              <Chip
                label="Selecionado"
                size="small"
                color="primary"
                sx={{ height: 22, fontWeight: 700 }}
              />
            ) : null}
          </Stack>
        </Stack>

        <Stack spacing={1}>
          <Typography variant="caption" color="text.secondary" sx={{ minHeight: 18 }}>
            {getRoleHighlight(summary, currentUserRole)}
          </Typography>

          {hasSlots ? (
            <Stack spacing={0.75}>
              <Stack direction="row" spacing={0.75} flexWrap="wrap">
                {statusEntries.map(([status, count]) => (
                  <Stack key={status} direction="row" spacing={0.5} alignItems="center">
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: statusMeta[status].color,
                      }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {count} {statusMeta[status].shortLabel}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: hasAvailable ? 'success.main' : 'text.secondary',
                }}
              >
                {slots.length} slot{slots.length > 1 ? 's' : ''} no dia
              </Typography>
            </Stack>
          ) : (
            <Typography variant="caption" color="text.secondary">
              Nenhuma disponibilidade
            </Typography>
          )}
        </Stack>
      </Stack>
    </Box>
  )
}

export default CalendarDayCell
