import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material'
import { useCallback, useEffect, useState } from 'react'
import AppSnackbar from '../../components/common/AppSnackbar'
import RequestDetailsDialog from '../../components/adminBookingRequests/RequestDetailsDialog'
import RejectRequestDialog from '../../components/adminBookingRequests/RejectRequestDialog'
import RequestsFilters from '../../components/adminBookingRequests/RequestsFilters'
import RequestsTable from '../../components/adminBookingRequests/RequestsTable'
import {
  approveBookingRequest,
  fetchAdminBookingRequests,
  fetchBookingRequestById,
  rejectBookingRequest,
} from '../../services/bookingRequestsService'

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function buildApiFilters(filters) {
  return Object.fromEntries(
    Object.entries(filters).filter(([, value]) => value !== undefined && value !== null && value !== '')
  )
}

function AdminBookingRequestsPage() {
  const [filters, setFilters] = useState({
    status: '',
    requested_date: '',
    student_id: '',
  })
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectMessage, setRejectMessage] = useState('')
  const [activeRequestId, setActiveRequestId] = useState(null)
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    severity: 'success',
    message: '',
  })

  const loadRequests = useCallback(async (nextFilters = filters) => {
    setLoading(true)
    setErrorMessage('')

    try {
      const data = await fetchAdminBookingRequests(buildApiFilters(nextFilters))
      setRequests(data)
    } catch (error) {
      setErrorMessage(
        getApiMessage(error, 'Não foi possível carregar as solicitações administrativas.')
      )
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

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
    const clearedFilters = {
      status: '',
      requested_date: '',
      student_id: '',
    }

    setFilters(clearedFilters)
    loadRequests(clearedFilters)
  }

  async function handleOpenDetails(request) {
    setDetailsOpen(true)
    setSelectedRequest(request)

    try {
      const fullRequest = await fetchBookingRequestById(request.id)
      setSelectedRequest(fullRequest)
    } catch (error) {
      showSnackbar(
        'error',
        getApiMessage(error, 'Não foi possível carregar os detalhes da solicitação.')
      )
    }
  }

  async function handleApprove(request) {
    setActiveRequestId(request.id)

    try {
      const updatedRequest = await approveBookingRequest(request.id)

      setRequests((current) =>
        current.map((item) => (item.id === request.id ? { ...item, ...updatedRequest } : item))
      )

      if (selectedRequest?.id === request.id && updatedRequest) {
        setSelectedRequest((current) => ({ ...current, ...updatedRequest }))
      }

      showSnackbar('success', 'Solicitação aprovada com sucesso.')
    } catch (error) {
      showSnackbar(
        'error',
        getApiMessage(error, 'Não foi possível aprovar esta solicitação.')
      )
    } finally {
      setActiveRequestId(null)
    }
  }

  function handleOpenReject(request) {
    setSelectedRequest(request)
    setRejectMessage('')
    setRejectDialogOpen(true)
  }

  async function handleConfirmReject() {
    if (!selectedRequest) {
      return
    }

    setActiveRequestId(selectedRequest.id)

    try {
      const updatedRequest = await rejectBookingRequest(selectedRequest.id, {
        admin_message: rejectMessage.trim() || undefined,
      })

      setRequests((current) =>
        current.map((item) =>
          item.id === selectedRequest.id ? { ...item, ...updatedRequest } : item
        )
      )

      setSelectedRequest((current) => (current ? { ...current, ...updatedRequest } : current))
      setRejectDialogOpen(false)
      setRejectMessage('')
      showSnackbar('success', 'Solicitação rejeitada com sucesso.')
    } catch (error) {
      showSnackbar(
        'error',
        getApiMessage(error, 'Não foi possível rejeitar esta solicitação.')
      )
    } finally {
      setActiveRequestId(null)
    }
  }

  return (
    <Stack spacing={3}>
      <Stack spacing={0.75}>
        <Typography variant="h4">Gerenciar solicitações</Typography>
        <Typography color="text.secondary">
          Os endpoints <code>GET /booking-requests</code>, <code>GET /booking-requests/:id</code>,
          <code> PATCH /booking-requests/:id/approve</code> e
          <code> PATCH /booking-requests/:id/reject</code> são consumidos nesta tela.
        </Typography>
      </Stack>

      <RequestsFilters
        filters={filters}
        onChange={handleFilterChange}
        onApply={() => loadRequests(filters)}
        onReset={handleResetFilters}
        loading={loading}
      />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {loading ? (
        <Box sx={{ minHeight: 240, display: 'grid', placeItems: 'center' }}>
          <CircularProgress />
        </Box>
      ) : null}

      {!loading && !errorMessage && requests.length === 0 ? (
        <Alert severity="info">Nenhuma solicitação encontrada para os filtros informados.</Alert>
      ) : null}

      {!loading && !errorMessage && requests.length > 0 ? (
        <RequestsTable
          requests={requests}
          loadingRequestId={activeRequestId}
          onViewDetails={handleOpenDetails}
          onApprove={handleApprove}
          onReject={handleOpenReject}
        />
      ) : null}

      <RequestDetailsDialog
        open={detailsOpen}
        request={selectedRequest}
        loading={activeRequestId === selectedRequest?.id}
        onClose={() => setDetailsOpen(false)}
      />

      <RejectRequestDialog
        open={rejectDialogOpen}
        request={selectedRequest}
        loading={activeRequestId === selectedRequest?.id}
        message={rejectMessage}
        onChangeMessage={setRejectMessage}
        onClose={() => setRejectDialogOpen(false)}
        onConfirm={handleConfirmReject}
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

export default AdminBookingRequestsPage
