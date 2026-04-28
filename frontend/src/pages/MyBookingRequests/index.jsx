import { EventNoteRounded } from '@mui/icons-material'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { useEffect, useState } from 'react'
import AppSnackbar from '../../components/common/AppSnackbar'
import EmptyState from '../../components/common/EmptyState'
import LoadingState from '../../components/common/LoadingState'
import PageHeader from '../../components/common/PageHeader'
import RequestsList from '../../components/bookingRequests/RequestsList'
import {
  cancelBookingRequest,
  fetchMyBookingRequests,
} from '../../services/bookingRequestsService'

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function MyBookingRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [cancellingRequestId, setCancellingRequestId] = useState(null)
  const [requestToCancel, setRequestToCancel] = useState(null)
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    severity: 'success',
    message: '',
  })

  async function loadRequests() {
    setLoading(true)
    setErrorMessage('')

    try {
      const data = await fetchMyBookingRequests()
      setRequests(data)
    } catch (error) {
      setErrorMessage(
        getApiMessage(error, 'Não foi possível carregar suas solicitações no momento.')
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRequests()
  }, [])

  function showSnackbar(severity, message) {
    setSnackbarState({
      open: true,
      severity,
      message,
    })
  }

  async function handleConfirmCancel() {
    if (!requestToCancel) {
      return
    }

    setCancellingRequestId(requestToCancel.id)

    try {
      const updatedRequest = await cancelBookingRequest(requestToCancel.id)

      setRequests((current) =>
        current.map((request) => (request.id === updatedRequest.id ? updatedRequest : request))
      )
      setRequestToCancel(null)
      showSnackbar('success', 'Solicitação cancelada com sucesso.')
    } catch (error) {
      showSnackbar(
        'error',
        getApiMessage(error, 'Não foi possível cancelar esta solicitação.')
      )
    } finally {
      setCancellingRequestId(null)
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Minhas solicitações"
        description={
          <>
            O GET <code>/booking-requests/my</code> é consumido nesta tela para listar os
            pedidos do aluno autenticado.
          </>
        }
        actionLabel="Atualizar"
        onAction={loadRequests}
        actionDisabled={loading}
      />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {loading ? <LoadingState message="Carregando suas solicitações..." /> : null}

      {!loading && !errorMessage && requests.length === 0 ? (
        <EmptyState
          icon={<EventNoteRounded />}
          title="Nenhuma solicitação encontrada."
          description="Escolha um horário no calendário para enviar sua primeira solicitação."
        />
      ) : null}

      {!loading && !errorMessage && requests.length > 0 ? (
        <RequestsList
          requests={requests}
          onCancelRequest={setRequestToCancel}
          cancellingRequestId={cancellingRequestId}
        />
      ) : null}

      <Dialog
        open={Boolean(requestToCancel)}
        onClose={cancellingRequestId ? undefined : () => setRequestToCancel(null)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Cancelar solicitação</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Esta ação só deve ser usada se você realmente não quiser mais este horário.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setRequestToCancel(null)} disabled={Boolean(cancellingRequestId)}>
            Voltar
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={handleConfirmCancel}
            loading={Boolean(cancellingRequestId)}
          >
            Confirmar cancelamento
          </Button>
        </DialogActions>
      </Dialog>

      <AppSnackbar
        open={snackbarState.open}
        severity={snackbarState.severity}
        message={snackbarState.message}
        onClose={() => setSnackbarState((current) => ({ ...current, open: false }))}
      />
    </Stack>
  )
}

export default MyBookingRequestsPage
