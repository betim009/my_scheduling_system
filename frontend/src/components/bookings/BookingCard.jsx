import { AccessTimeRounded, CalendarMonthRounded, NotesRounded } from '@mui/icons-material'
import { Card, CardContent, Divider, Stack, Typography } from '@mui/material'
import { formatLongDate, normalizeTimeLabel } from '../../utils/calendar'
import BookingStatusChip from './BookingStatusChip'

function formatCreatedAt(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function BookingCard({ booking }) {
  return (
    <Card sx={{ borderRadius: 1 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <CalendarMonthRounded color="primary" />
              <Typography variant="h6">{formatLongDate(booking.booking_date)}</Typography>
            </Stack>

            <BookingStatusChip status={booking.status} />
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTimeRounded fontSize="small" color="action" />
            <Typography color="text.secondary">
              {normalizeTimeLabel(booking.start_time)} - {normalizeTimeLabel(booking.end_time)}
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle2">Observações</Typography>
            <Typography color="text.secondary">
              {booking.notes || 'Nenhuma observação registrada para este agendamento.'}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <NotesRounded fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Booking criado em {formatCreatedAt(booking.created_at)}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default BookingCard
