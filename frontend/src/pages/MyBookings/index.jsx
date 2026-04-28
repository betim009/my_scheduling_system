import { EventAvailableRounded } from '@mui/icons-material'
import { Alert, Button, Stack, Typography } from '@mui/material'
import { useEffect, useState } from 'react'
import BookingsList from '../../components/bookings/BookingsList'
import EmptyState from '../../components/common/EmptyState'
import LoadingState from '../../components/common/LoadingState'
import PageHeader from '../../components/common/PageHeader'
import { fetchMyBookings } from '../../services/bookingsService'

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function MyBookingsPage() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  async function loadBookings() {
    setLoading(true)
    setErrorMessage('')

    try {
      const data = await fetchMyBookings()
      setBookings(data)
    } catch (error) {
      setErrorMessage(
        getApiMessage(error, 'Não foi possível carregar seus agendamentos no momento.')
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBookings()
  }, [])

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Meus agendamentos"
        description={
          <>
            O GET <code>/bookings/my</code> é consumido nesta tela para listar as aulas já
            vinculadas ao aluno autenticado, incluindo confirmadas e canceladas.
          </>
        }
        actionLabel="Atualizar"
        onAction={loadBookings}
        actionDisabled={loading}
      />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {loading ? <LoadingState message="Carregando seus agendamentos..." /> : null}

      {!loading && !errorMessage && bookings.length === 0 ? (
        <EmptyState
          icon={<EventAvailableRounded />}
          title="Você ainda não possui agendamentos."
          description="Quando uma solicitação for aprovada, ela aparecerá aqui com status e detalhes."
        />
      ) : null}

      {!loading && !errorMessage && bookings.length > 0 ? (
        <BookingsList bookings={bookings} />
      ) : null}
    </Stack>
  )
}

export default MyBookingsPage
