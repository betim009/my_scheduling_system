import { LocalOfferRounded } from '@mui/icons-material'
import { Alert, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material'
import { useEffect, useMemo, useState } from 'react'
import AppSnackbar from '../components/common/AppSnackbar'
import EmptyState from '../components/common/EmptyState'
import LoadingState from '../components/common/LoadingState'
import PageHeader from '../components/common/PageHeader'
import PlanRequestStatusChip from '../components/planRequests/PlanRequestStatusChip'
import { createPlanRequest, fetchPlanRequests } from '../services/planRequestsService'
import { fetchPlans } from '../services/plansService'
import { fetchPublicSystemSettings } from '../services/publicSystemSettingsService'

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function Plans() {
  const [plans, setPlans] = useState([])
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [requestingPlanId, setRequestingPlanId] = useState(null)
  const [teacherSettings, setTeacherSettings] = useState({
    main_teacher_name: '',
    main_teacher_phone: '',
  })
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    severity: 'success',
    message: '',
  })

  async function loadData() {
    setLoading(true)
    setErrorMessage('')

    try {
      const [plansData, requestsData, publicSettings] = await Promise.all([
        fetchPlans(),
        fetchPlanRequests(),
        fetchPublicSystemSettings().catch(() => ({})),
      ])
      setPlans(plansData)
      setRequests(requestsData)
      setTeacherSettings({
        main_teacher_name: publicSettings.main_teacher_name || '',
        main_teacher_phone: publicSettings.main_teacher_phone || '',
      })
    } catch (error) {
      setErrorMessage(getApiMessage(error, 'Não foi possível carregar os planos disponíveis.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const latestRequestByPlanId = useMemo(() => {
    return requests.reduce((accumulator, request) => {
      if (!accumulator[request.plan_id]) {
        accumulator[request.plan_id] = request
      }

      return accumulator
    }, {})
  }, [requests])

  async function handleRequestPlan(plan) {
    setRequestingPlanId(plan.id)

    try {
      const { planRequest, whatsappLink, whatsappContactName } = await createPlanRequest({
        plan_id: plan.id,
      })

      if (planRequest) {
        setRequests((current) => [planRequest, ...current])
      }

      if (whatsappLink) {
        window.open(whatsappLink, '_blank', 'noopener,noreferrer')
      }

      setSnackbarState({
        open: true,
        severity: 'success',
        message: whatsappContactName
          ? `Solicitação enviada com sucesso para ${whatsappContactName}.`
          : 'Solicitação enviada com sucesso.',
      })
    } catch (error) {
      setSnackbarState({
        open: true,
        severity: 'error',
        message: getApiMessage(error, 'Não foi possível solicitar este plano.'),
      })
    } finally {
      setRequestingPlanId(null)
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Planos"
        description={
          <>
            Visualize os planos disponíveis e solicite o ideal para o seu ritmo de aulas. Ao
            solicitar, o sistema abre a notificação para o professor principal no WhatsApp.
          </>
        }
        actionLabel="Atualizar"
        onAction={loadData}
        actionDisabled={loading}
      />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {teacherSettings.main_teacher_name || teacherSettings.main_teacher_phone ? (
        <Alert severity="info">
          Atendimento principal:{' '}
          <strong>{teacherSettings.main_teacher_name || 'Professor principal'}</strong>
          {teacherSettings.main_teacher_phone
            ? ` · WhatsApp ${teacherSettings.main_teacher_phone}`
            : ''}
        </Alert>
      ) : null}
      {loading ? <LoadingState message="Carregando planos disponíveis..." /> : null}

      {!loading && !errorMessage && plans.length === 0 ? (
        <EmptyState
          icon={<LocalOfferRounded />}
          title="Nenhum plano disponível."
          description="Assim que novos planos forem publicados, eles aparecerão aqui."
        />
      ) : null}

      {!loading && !errorMessage && plans.length > 0 ? (
        <Grid container spacing={3}>
          {plans.map((plan) => {
            const latestRequest = latestRequestByPlanId[plan.id]
            const hasPendingRequest = latestRequest?.status === 'pending'

            return (
              <Grid key={plan.id} size={{ xs: 12, md: 6, xl: 4 }}>
                <Card sx={{ borderRadius: 1, height: '100%' }}>
                  <CardContent sx={{ p: 3, height: '100%' }}>
                    <Stack spacing={2.5} sx={{ height: '100%' }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                      >
                        <Stack spacing={0.5}>
                          <Typography variant="h6">{plan.name}</Typography>
                          <Typography color="text.secondary">
                            {plan.total_classes} aulas · {plan.classes_per_week} por semana
                          </Typography>
                        </Stack>

                        {latestRequest ? <PlanRequestStatusChip status={latestRequest.status} /> : null}
                      </Stack>

                      <Typography variant="h4">{formatCurrency(plan.price)}</Typography>
                      <Typography color="text.secondary">
                        Valor por aula: {formatCurrency(plan.price_per_class)}
                      </Typography>

                      <Typography color="text.secondary" sx={{ flexGrow: 1 }}>
                        Ideal para quem busca constância com um plano estruturado e aprovação do
                        admin antes da ativação.
                      </Typography>

                      {latestRequest ? (
                        <Typography variant="body2" color="text.secondary">
                          Última solicitação em {latestRequest.created_at}.
                        </Typography>
                      ) : null}

                      <Button
                        variant={hasPendingRequest ? 'outlined' : 'contained'}
                        onClick={() => handleRequestPlan(plan)}
                        disabled={hasPendingRequest || requestingPlanId === plan.id}
                        loading={requestingPlanId === plan.id}
                      >
                        {hasPendingRequest ? 'Solicitação pendente' : 'Solicitar plano'}
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
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

export default Plans
