import {
  AccessTimeRounded,
  CalendarMonthRounded,
  ChatRounded,
  RefreshRounded,
} from '@mui/icons-material'
import { Button, Card, CardContent, Divider, Stack, Typography } from '@mui/material'
import { formatLongDate, normalizeTimeLabel } from '../../utils/calendar'
import RequestStatusChip from './RequestStatusChip'

function formatCreatedAt(value) {
  if (!value) {
    return '-'
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(new Date(value))
}

function RequestCard({ request, onCancel, cancelling }) {
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
              <CalendarMonthRounded color="primary" />
              <Typography variant="h6">{formatLongDate(request.requested_date)}</Typography>
            </Stack>

            <RequestStatusChip status={request.status} />
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTimeRounded fontSize="small" color="action" />
            <Typography color="text.secondary">
              {normalizeTimeLabel(request.start_time)} - {normalizeTimeLabel(request.end_time)}
            </Typography>
          </Stack>

          <Divider />

          <Stack spacing={1}>
            <Typography variant="subtitle2">Mensagem enviada</Typography>
            <Typography color="text.secondary">
              {request.student_message || 'Nenhuma mensagem informada.'}
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle2">Resposta do admin</Typography>
            <Typography color="text.secondary">
              {request.admin_message || 'Ainda não houve retorno do admin.'}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <ChatRounded fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              Solicitação criada em {formatCreatedAt(request.created_at)}
            </Typography>
          </Stack>

          {request.status === 'pending' ? (
            <Button
              variant="outlined"
              color="warning"
              startIcon={<RefreshRounded />}
              onClick={() => onCancel(request)}
              loading={cancelling}
              sx={{ alignSelf: 'flex-start' }}
            >
              Cancelar solicitação
            </Button>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}

export default RequestCard
