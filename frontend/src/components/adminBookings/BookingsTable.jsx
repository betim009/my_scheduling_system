import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { formatLongDate, normalizeTimeLabel } from '../../utils/calendar'
import BookingStatusChip from '../bookings/BookingStatusChip'

function BookingsTable({
  bookings,
  activeBookingId,
  onCancel,
  onReschedule,
}) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Aluno</TableCell>
            <TableCell>Plano</TableCell>
            <TableCell>Data</TableCell>
            <TableCell>Horário</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Aulas restantes</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {bookings.map((booking) => {
            const isLoading = activeBookingId === booking.id
            const canManage = booking.status === 'confirmed'

            return (
              <TableRow key={booking.id} hover>
                <TableCell>
                  <Stack spacing={0.35}>
                    <Typography fontWeight={600}>{booking.student_name || `Aluno #${booking.student_id}`}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {booking.student_email || '-'}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>{booking.plan_name || '-'}</TableCell>
                <TableCell>{formatLongDate(booking.booking_date)}</TableCell>
                <TableCell>
                  {normalizeTimeLabel(booking.start_time)} - {normalizeTimeLabel(booking.end_time)}
                </TableCell>
                <TableCell>
                  <BookingStatusChip status={booking.status} />
                </TableCell>
                <TableCell>{booking.subscription_remaining_classes ?? '-'}</TableCell>
                <TableCell align="right">
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1}
                    justifyContent="flex-end"
                  >
                    <Button
                      variant="outlined"
                      color="warning"
                      disabled={!canManage || isLoading}
                      onClick={() => onCancel(booking)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="contained"
                      disabled={!canManage || isLoading}
                      onClick={() => onReschedule(booking)}
                    >
                      Reagendar
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default BookingsTable
