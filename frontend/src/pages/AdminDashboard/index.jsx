import { Alert, Grid, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import LoadingState from '../../components/common/LoadingState'
import PageHeader from '../../components/common/PageHeader'
import MetricCard from '../../components/dashboard/MetricCard'
import PendingRequestsPanel from '../../components/dashboard/PendingRequestsPanel'
import SubscriptionsSummaryPanel from '../../components/dashboard/SubscriptionsSummaryPanel'
import UpcomingBookingsPanel from '../../components/dashboard/UpcomingBookingsPanel'
import { fetchAdminDashboardSummary } from '../../services/dashboardService'

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function AdminDashboardPage() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  async function loadSummary() {
    setLoading(true)
    setErrorMessage('')

    try {
      const data = await fetchAdminDashboardSummary()
      setSummary(data)
    } catch (error) {
      setErrorMessage(
        getApiMessage(error, 'Não foi possível carregar o resumo administrativo.')
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSummary()
  }, [])

  const metrics = summary?.metrics || {
    total_students: 0,
    total_pending_requests: 0,
    total_confirmed_bookings: 0,
    total_active_subscriptions: 0,
    total_remaining_classes: 0,
    total_plans: 0,
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Dashboard Admin"
        description={
          <>
            Esta tela consome <code>GET /dashboard/admin-summary</code> para montar a visão
            consolidada do sistema.
          </>
        }
        actionLabel="Atualizar dados"
        onAction={loadSummary}
        actionDisabled={loading}
      />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {loading ? <LoadingState message="Carregando visão consolidada..." /> : null}

      {!loading && !errorMessage ? (
        <>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, xl: 2 }}>
              <MetricCard title="Alunos" value={metrics.total_students} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, xl: 2 }}>
              <MetricCard
                title="Solicitações pendentes"
                value={metrics.total_pending_requests}
                highlight
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, xl: 2 }}>
              <MetricCard
                title="Bookings confirmados"
                value={metrics.total_confirmed_bookings}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, xl: 2 }}>
              <MetricCard
                title="Subscriptions ativas"
                value={metrics.total_active_subscriptions}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, xl: 2 }}>
              <MetricCard
                title="Aulas restantes"
                value={metrics.total_remaining_classes}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, xl: 2 }}>
              <MetricCard title="Planos" value={metrics.total_plans} />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, xl: 4 }}>
              <PendingRequestsPanel requests={summary?.recent_pending_requests || []} />
            </Grid>
            <Grid size={{ xs: 12, xl: 4 }}>
              <UpcomingBookingsPanel bookings={summary?.upcoming_bookings || []} />
            </Grid>
            <Grid size={{ xs: 12, xl: 4 }}>
              <SubscriptionsSummaryPanel metrics={metrics} />
            </Grid>
          </Grid>
        </>
      ) : null}
    </Stack>
  )
}

export default AdminDashboardPage
