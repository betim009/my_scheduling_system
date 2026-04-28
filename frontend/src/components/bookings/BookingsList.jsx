import { Stack } from '@mui/material'
import BookingCard from './BookingCard'

function BookingsList({ bookings }) {
  return (
    <Stack spacing={2}>
      {bookings.map((booking) => (
        <BookingCard key={booking.id} booking={booking} />
      ))}
    </Stack>
  )
}

export default BookingsList
