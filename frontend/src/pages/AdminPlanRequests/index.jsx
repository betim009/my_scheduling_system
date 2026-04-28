import { Alert, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import PlanRequestsTable from '../../components/adminPlanRequests/PlanRequestsTable'
import AppSnackbar from '../../components/common/AppSnackbar'
import EmptyState from '../../components/common/EmptyState'
import LoadingState from '../../components/common/LoadingState'
import PageHeader from '../../components/common/PageHeader'
import {
  approvePlanRequest,
  fetchPlanRequests,
  rejectPlanRequest,
} from '../../services/planRequestsService'

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function AdminPlanRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [loadingId, setLoadingId] = useState(null)
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    severity: 'success',
    message: '',
  })

  async function loadRequests() {
    setLoading(true)
    setErrorMessage('')

    try {
      const data = await fetchPlanRequests()
      setRequests(data)
    } catch (error) {
      setErrorMessage(getApiMessage(error, 'Não foi possível carregar as solicitações de planos.'))
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

  async function handleApprove(request) {
    setLoadingId(request.id)

    try {
      const { planRequest } = await approvePlanRequest(request.id)
      setRequests((current) =>
        current.map((item) => (item.id === request.id ? { ...item, ...planRequest } : item))
      )
      showSnackbar('success', 'Solicitação aprovada e assinatura criada com sucesso.')
    } catch (error) {
      showSnackbar('error', getApiMessage(error, 'Não foi possível aprovar a solicitação.'))
    } finally {
      setLoadingId(null)
    }
  }

  async function handleReject(request) {
    setLoadingId(request.id)

    try {
      const updatedRequest = await rejectPlanRequest(request.id)
      setRequests((current) =>
        current.map((item) => (item.id === request.id ? { ...item, ...updatedRequest } : item))
      )
      showSnackbar('success', 'Solicitação rejeitada com sucesso.')
    } catch (error) {
      showSnackbar('error', getApiMessage(error, 'Não foi possível rejeitar a solicitação.'))
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Solicitações de planos"
        description={
          <>
            Os endpoints <code>GET /plan-requests</code>, <code>PATCH /plan-requests/:id/approve</code>{' '}
            e <code>PATCH /plan-requests/:id/reject</code> são consumidos nesta tela.
          </>
        }
        actionLabel="Atualizar"
        onAction={loadRequests}
        actionDisabled={loading}
      />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {loading ? <LoadingState message="Carregando solicitações de planos..." /> : null}

      {!loading && !errorMessage && requests.length === 0 ? (
        <EmptyState
          title="Nenhuma solicitação de plano encontrada."
          description="Assim que um aluno solicitar um plano, ela aparecerá aqui para aprovação."
        />
      ) : null}

      {!loading && !errorMessage && requests.length > 0 ? (
        <PlanRequestsTable
          requests={requests}
          loadingId={loadingId}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ) : null}

      <AppSnackbar
        open={snackbarState.open}
        severity={snackbarState.severity}
        message={snackbarState.message}
        onClose={() => setSnackbarState((current) => ({ ...current, open: false }))}
      />
    </Stack>
  )
}

export default AdminPlanRequestsPage
