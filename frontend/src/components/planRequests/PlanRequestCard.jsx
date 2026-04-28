import { AccessTimeRounded, LocalOfferRounded } from '@mui/icons-material'
import { Card, CardContent, Divider, Stack, Typography } from '@mui/material'
import PlanRequestStatusChip from './PlanRequestStatusChip'

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function PlanRequestCard({ request }) {
  return (
    <Card sx={{ borderRadius: 1 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
          >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <LocalOfferRounded color="primary" />
              <Typography variant="h6">{request.plan_name}</Typography>
            </Stack>

            <PlanRequestStatusChip status={request.status} />
          </Stack>

          <Typography color="text.secondary">
            {request.total_classes} aulas · {request.classes_per_week} por semana ·{' '}
            {formatCurrency(request.price)}
          </Typography>

          <Divider />

          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTimeRounded fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Solicitação criada em {request.created_at}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default PlanRequestCard
