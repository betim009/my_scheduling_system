import { LayersRounded } from '@mui/icons-material'
import { Alert, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import EmptyState from '../../components/common/EmptyState'
import LoadingState from '../../components/common/LoadingState'
import PageHeader from '../../components/common/PageHeader'
import PlanRequestsList from '../../components/planRequests/PlanRequestsList'
import SubscriptionSummary from '../../components/subscriptions/SubscriptionSummary'
import SubscriptionsList from '../../components/subscriptions/SubscriptionsList'
import { fetchPlanRequests } from '../../services/planRequestsService'
import {
  fetchMySubscriptions,
  fetchMySubscriptionsSummary,
} from '../../services/subscriptionsService'

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function MySubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [planRequests, setPlanRequests] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  async function loadSubscriptions() {
    setLoading(true)
    setErrorMessage('')

    try {
      const [subscriptionsData, summaryData, planRequestsData] = await Promise.all([
        fetchMySubscriptions(),
        fetchMySubscriptionsSummary(),
        fetchPlanRequests(),
      ])

      setSubscriptions(subscriptionsData)
      setSummary(summaryData)
      setPlanRequests(planRequestsData)
    } catch (error) {
      setErrorMessage(
        getApiMessage(error, 'Não foi possível carregar suas subscriptions no momento.')
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubscriptions()
  }, [])

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Minhas aulas"
        description={
          <>
            Os endpoints <code>/subscriptions/my</code> e <code>/subscriptions/my/summary</code>{' '}
            são consumidos nesta tela para mostrar plano, validade e saldo do aluno.
          </>
        }
        actionLabel="Atualizar"
        onAction={loadSubscriptions}
        actionDisabled={loading}
      />

      <SubscriptionSummary summary={summary} />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {loading ? <LoadingState message="Carregando suas aulas e saldo..." /> : null}

      {!loading && !errorMessage && subscriptions.length === 0 ? (
        <EmptyState
          icon={<LayersRounded />}
          title="Nenhuma assinatura encontrada."
          description="Assim que um plano for vinculado à sua conta, o saldo e o período aparecerão aqui."
        />
      ) : null}

      {!loading && !errorMessage && subscriptions.length > 0 ? (
        <SubscriptionsList subscriptions={subscriptions} />
      ) : null}

      {!loading && !errorMessage && planRequests.length > 0 ? (
        <Stack spacing={2}>
          <Alert severity="info">
            Acompanhe abaixo o histórico das suas solicitações de planos.
          </Alert>
          <PlanRequestsList requests={planRequests} />
        </Stack>
      ) : null}
    </Stack>
  )
}

export default MySubscriptionsPage
