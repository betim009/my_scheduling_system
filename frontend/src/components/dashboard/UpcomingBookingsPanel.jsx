import { AccessTimeRounded, EventAvailableRounded } from '@mui/icons-material'
import { Alert, Paper, Stack, Typography } from '@mui/material'
import { normalizeTimeLabel } from '../../utils/calendar'

function UpcomingBookingsPanel({ bookings }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 1, height: '100%' }}>
      <Stack spacing={2}>
        <Typography variant="h6">Próximos agendamentos</Typography>

        {bookings.length === 0 ? (
          <Alert severity="info">Nenhum agendamento confirmado a partir de hoje.</Alert>
        ) : (
          bookings.map((booking) => (
            <Stack
              key={booking.id}
              spacing={0.75}
              sx={{
                p: 2,
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <EventAvailableRounded color="primary" fontSize="small" />
                <Typography fontWeight={700}>
                  {booking.student_name || `Aluno #${booking.student_id}`}
                </Typography>
              </Stack>

              <Typography color="text.secondary">{booking.booking_date}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeRounded color="action" fontSize="small" />
                <Typography color="text.secondary">
                  {normalizeTimeLabel(booking.start_time)} - {normalizeTimeLabel(booking.end_time)}
                </Typography>
              </Stack>
            </Stack>
          ))
        )}
      </Stack>
    </Paper>
  )
}

export default UpcomingBookingsPanel
