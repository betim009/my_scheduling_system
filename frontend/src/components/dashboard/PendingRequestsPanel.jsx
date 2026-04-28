import { AccessTimeRounded, AssignmentRounded } from '@mui/icons-material'
import { Alert, Paper, Stack, Typography } from '@mui/material'
import { normalizeTimeLabel } from '../../utils/calendar'

function PendingRequestsPanel({ requests }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 1, height: '100%' }}>
      <Stack spacing={2}>
        <Typography variant="h6">Solicitações pendentes recentes</Typography>

        {requests.length === 0 ? (
          <Alert severity="info">Nenhuma solicitação pendente no momento.</Alert>
        ) : (
          requests.map((request) => (
            <Stack
              key={request.id}
              spacing={0.75}
              sx={{
                p: 2,
                borderRadius: 1,
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <AssignmentRounded color="primary" fontSize="small" />
                <Typography fontWeight={700}>
                  {request.student_name || `Aluno #${request.student_id}`}
                </Typography>
              </Stack>

              <Typography color="text.secondary">{request.requested_date}</Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <AccessTimeRounded color="action" fontSize="small" />
                <Typography color="text.secondary">
                  {normalizeTimeLabel(request.start_time)} - {normalizeTimeLabel(request.end_time)}
                </Typography>
              </Stack>
            </Stack>
          ))
        )}
      </Stack>
    </Paper>
  )
}

export default PendingRequestsPanel
