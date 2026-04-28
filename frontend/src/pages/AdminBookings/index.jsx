import { Alert, Box, Button, CircularProgress, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import BookingsFilters from '../../components/adminBookings/BookingsFilters'
import BookingsTable from '../../components/adminBookings/BookingsTable'
import CancelBookingDialog from '../../components/adminBookings/CancelBookingDialog'
import RescheduleBookingDialog from '../../components/adminBookings/RescheduleBookingDialog'
import AppSnackbar from '../../components/common/AppSnackbar'
import {
  cancelBooking,
  fetchAdminBookings,
  rescheduleBooking,
} from '../../services/bookingsService'

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function AdminBookingsPage() {
  const [filters, setFilters] = useState({
    status: '',
    booking_date: '',
    student_id: '',
  })
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [activeBookingId, setActiveBookingId] = useState(null)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancelNotes, setCancelNotes] = useState('')
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [rescheduleForm, setRescheduleForm] = useState({
    new_date: '',
    new_start_time: '',
    new_end_time: '',
    notes: '',
  })
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    severity: 'success',
    message: '',
  })

  const loadBookings = useCallback(async (nextFilters = filters) => {
    setLoading(true)
    setErrorMessage('')

    try {
      const data = await fetchAdminBookings(nextFilters)
      setBookings(data)
    } catch (error) {
      setErrorMessage(
        getApiMessage(error, 'Não foi possível carregar os agendamentos administrativos.')
      )
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadBookings()
  }, [loadBookings])

  function showSnackbar(severity, message) {
    setSnackbarState({
      open: true,
      severity,
      message,
    })
  }

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleResetFilters() {
    const nextFilters = {
      status: '',
      booking_date: '',
      student_id: '',
    }

    setFilters(nextFilters)
    loadBookings(nextFilters)
  }

  function handleOpenCancel(booking) {
    setSelectedBooking(booking)
    setCancelNotes('')
    setCancelDialogOpen(true)
  }

  function handleOpenReschedule(booking) {
    setSelectedBooking(booking)
    setRescheduleForm({
      new_date: booking.booking_date,
      new_start_time: booking.start_time.slice(0, 5),
      new_end_time: booking.end_time.slice(0, 5),
      notes: booking.notes || '',
    })
    setRescheduleDialogOpen(true)
  }

  async function handleConfirmCancel() {
    if (!selectedBooking) {
      return
    }

    setActiveBookingId(selectedBooking.id)

    try {
      await cancelBooking(selectedBooking.id, {
        notes: cancelNotes.trim() || undefined,
      })
      setCancelDialogOpen(false)
      await loadBookings()
      showSnackbar('success', 'Agendamento cancelado com sucesso.')
    } catch (error) {
      showSnackbar('error', getApiMessage(error, 'Não foi possível cancelar este agendamento.'))
    } finally {
      setActiveBookingId(null)
    }
  }

  async function handleConfirmReschedule() {
    if (!selectedBooking) {
      return
    }

    setActiveBookingId(selectedBooking.id)

    try {
      await rescheduleBooking(selectedBooking.id, {
        new_date: rescheduleForm.new_date,
        new_start_time: rescheduleForm.new_start_time,
        new_end_time: rescheduleForm.new_end_time,
        notes: rescheduleForm.notes.trim() || undefined,
      })
      setRescheduleDialogOpen(false)
      await loadBookings()
      showSnackbar('success', 'Agendamento reagendado com sucesso.')
    } catch (error) {
      showSnackbar('error', getApiMessage(error, 'Não foi possível reagendar este agendamento.'))
    } finally {
      setActiveBookingId(null)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
      >
        <Stack spacing={0.75}>
          <Typography variant="h4">Gerenciar agendamentos</Typography>
          <Typography color="text.secondary">
            Os endpoints <code>GET /bookings</code>, <code>PATCH /bookings/:id/cancel</code> e{' '}
            <code>PATCH /bookings/:id/reschedule</code> são consumidos nesta tela.
          </Typography>
        </Stack>

        <Button variant="outlined" onClick={() => loadBookings(filters)} disabled={loading}>
          Atualizar
        </Button>
      </Stack>

      <BookingsFilters
        filters={filters}
        loading={loading}
        onChange={handleFilterChange}
        onApply={() => loadBookings(filters)}
        onReset={handleResetFilters}
      />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {loading ? (
        <Box sx={{ minHeight: 240, display: 'grid', placeItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : null}

      {!loading && !errorMessage && bookings.length === 0 ? (
        <Alert severity="info">Nenhum agendamento encontrado para os filtros informados.</Alert>
      ) : null}

      {!loading && !errorMessage && bookings.length > 0 ? (
        <BookingsTable
          bookings={bookings}
          activeBookingId={activeBookingId}
          onCancel={handleOpenCancel}
          onReschedule={handleOpenReschedule}
        />
      ) : null}

      <CancelBookingDialog
        open={cancelDialogOpen}
        booking={selectedBooking}
        notes={cancelNotes}
        loading={activeBookingId === selectedBooking?.id}
        onChangeNotes={setCancelNotes}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleConfirmCancel}
      />

      <RescheduleBookingDialog
        open={rescheduleDialogOpen}
        booking={selectedBooking}
        form={rescheduleForm}
        loading={activeBookingId === selectedBooking?.id}
        onChange={(event) =>
          setRescheduleForm((current) => ({
            ...current,
            [event.target.name]: event.target.value,
          }))
        }
        onClose={() => setRescheduleDialogOpen(false)}
        onConfirm={handleConfirmReschedule}
      />

      <AppSnackbar
        open={snackbarState.open}
        severity={snackbarState.severity}
        message={snackbarState.message}
        onClose={() => setSnackbarState((current) => ({ ...current, open: false }))}
      />
    </Stack>
  )
}

export default AdminBookingsPage
