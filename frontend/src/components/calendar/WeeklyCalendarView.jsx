import { Box, Paper, Stack, Typography, alpha } from '@mui/material'
import CalendarDayCell from './CalendarDayCell'
import { buildWeekDays, formatWeekRange, isSameDate } from '../../utils/calendar'

function WeeklyCalendarView({ referenceDate, selectedDate, slotsByDate, currentUserRole, onSelectDate }) {
  const weekDays = buildWeekDays(referenceDate)

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 1 }}>
      <Stack spacing={2}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={1}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
        >
          <Typography variant="h6">Visão semanal</Typography>
          <Typography color="text.secondary">
            {formatWeekRange(referenceDate)}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(7, minmax(0, 1fr))' },
            gap: 1.25,
          }}
        >
          {weekDays.map((day) => (
            <Stack key={day.dateKey} spacing={0.75}>
              <Box
                sx={{
                  px: 1.25,
                  py: 1,
                  borderRadius: 1,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.06),
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(day.date)}
                </Typography>
              </Box>
              <CalendarDayCell
                day={day}
                slots={slotsByDate.get(day.dateKey) || []}
                isSelected={selectedDate ? isSameDate(day.date, selectedDate) : false}
                currentUserRole={currentUserRole}
                onSelectDate={onSelectDate}
              />
            </Stack>
          ))}
        </Box>
      </Stack>
    </Paper>
  )
}

export default WeeklyCalendarView
