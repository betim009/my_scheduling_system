import { Box, Paper, Typography, alpha } from '@mui/material'
import { buildMonthMatrix, isSameDate, weekDayLabels } from '../../utils/calendar'
import CalendarDayCell from './CalendarDayCell'

function CalendarGrid({ currentMonthDate, selectedDate, slotsByDate, currentUserRole, onSelectDate }) {
  const monthDays = buildMonthMatrix(currentMonthDate)

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: 1,
        }}
      >
        {weekDayLabels.map((label) => (
          <Box
            key={label}
            sx={{
              px: 1,
              py: 1.5,
              textAlign: 'center',
              borderRadius: 1,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            }}
          >
            <Typography variant="subtitle2">{label}</Typography>
          </Box>
        ))}

        {monthDays.map((day) => (
          <CalendarDayCell
            key={day.dateKey}
            day={day}
            slots={slotsByDate.get(day.dateKey) || []}
            isSelected={selectedDate ? isSameDate(day.date, selectedDate) : false}
            currentUserRole={currentUserRole}
            onSelectDate={onSelectDate}
          />
        ))}
      </Box>
    </Paper>
  )
}

export default CalendarGrid
