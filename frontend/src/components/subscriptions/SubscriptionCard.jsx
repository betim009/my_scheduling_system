import {
  CalendarMonthRounded,
  SchoolRounded,
  TrendingUpRounded,
} from '@mui/icons-material'
import { alpha, Card, CardContent, LinearProgress, Stack, Typography } from '@mui/material'
import SubscriptionStatusChip from './SubscriptionStatusChip'

function formatCurrency(value) {
  if (value === null || value === undefined) {
    return '-'
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function SubscriptionCard({ subscription }) {
  const consumedClasses = subscription.total_classes - subscription.remaining_classes
  const progressValue =
    subscription.total_classes > 0
      ? (consumedClasses / subscription.total_classes) * 100
      : 0

  return (
    <Card
      sx={{
        borderRadius: 1,
        borderColor:
          subscription.status === 'active'
            ? (theme) => alpha(theme.palette.primary.main, 0.28)
            : undefined,
        bgcolor:
          subscription.status === 'active'
            ? (theme) => alpha(theme.palette.primary.main, 0.04)
            : 'background.paper',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Stack spacing={0.5}>
              <Typography variant="h6">{subscription.plan_name}</Typography>
              <Typography color="text.secondary">
                Plano #{subscription.plan_id}
              </Typography>
            </Stack>

            <SubscriptionStatusChip status={subscription.status} />
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarMonthRounded color="primary" fontSize="small" />
            <Typography color="text.secondary">
              {subscription.start_date} até {subscription.end_date}
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle2">Uso do pacote</Typography>
              <Typography variant="body2" color="text.secondary">
                {consumedClasses} usadas de {subscription.total_classes}
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={progressValue}
              color={subscription.status === 'active' ? 'primary' : 'secondary'}
              sx={{ height: 10, borderRadius: 999 }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <InfoRow
              icon={<SchoolRounded fontSize="small" color="action" />}
              label="Aulas restantes"
              value={String(subscription.remaining_classes)}
            />
            <InfoRow
              icon={<TrendingUpRounded fontSize="small" color="action" />}
              label="Aulas por semana"
              value={String(subscription.classes_per_week ?? '-')}
            />
            <InfoRow
              icon={<TrendingUpRounded fontSize="small" color="action" />}
              label="Valor por aula"
              value={formatCurrency(subscription.price_per_class)}
            />
            <InfoRow
              icon={<TrendingUpRounded fontSize="small" color="action" />}
              label="Valor do plano"
              value={formatCurrency(subscription.price)}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
      {icon}
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="subtitle2">{value}</Typography>
      </Stack>
    </Stack>
  )
}

export default SubscriptionCard
