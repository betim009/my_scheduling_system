import { Box, Card, CardContent, Grid, LinearProgress, Stack, Typography } from '@mui/material'

function formatCurrency(value) {
  if (value === null || value === undefined) {
    return '-'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function getProgressValue(subscription) {
  if (!subscription || subscription.total_classes <= 0) {
    return 0
  }

  const consumedClasses = subscription.total_classes - subscription.remaining_classes
  return (consumedClasses / subscription.total_classes) * 100
}

function SubscriptionSummary({ summary }) {
  const currentSubscription = summary?.current_subscription

  return (
    <Card
      sx={{
        borderRadius: 1,
        background:
          'linear-gradient(135deg, rgba(109,40,217,1) 0%, rgba(17,17,17,1) 100%)',
        color: '#ffffff',
      }}
    >
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: '0.14em' }}>
              Resumo das aulas
            </Typography>
            <Typography variant="h4" sx={{ mt: 1 }}>
              {currentSubscription?.plan_name || 'Nenhum plano ativo'}
            </Typography>
            <Typography sx={{ mt: 1, color: 'rgba(255,255,255,0.82)' }}>
              {currentSubscription
                ? `Validade de ${currentSubscription.start_date} até ${currentSubscription.end_date}`
                : 'Assim que um plano ativo existir, ele aparecerá destacado aqui.'}
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <MetricCard
                label="Aulas restantes"
                value={String(summary?.total_remaining_classes || 0)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <MetricCard
                label="Subscriptions ativas"
                value={String(summary?.active_subscriptions_count || 0)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <MetricCard
                label="Valor do plano"
                value={currentSubscription ? formatCurrency(currentSubscription.price) : '-'}
              />
            </Grid>
          </Grid>

          {currentSubscription ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2" sx={{ color: 'rgba(255,255,255,0.82)' }}>
                Consumo do pacote
              </Typography>
              <LinearProgress
                variant="determinate"
                value={getProgressValue(currentSubscription)}
                color="secondary"
                sx={{
                  height: 10,
                  borderRadius: 999,
                  bgcolor: 'rgba(255,255,255,0.14)',
                }}
              />
            </Stack>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}

function MetricCard({ label, value }) {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        bgcolor: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.74)' }}>
        {label}
      </Typography>
      <Typography variant="h5" sx={{ mt: 1 }}>
        {value}
      </Typography>
    </Box>
  )
}

export default SubscriptionSummary
