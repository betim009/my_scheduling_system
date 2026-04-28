import { Paper, Stack, Typography } from '@mui/material'

function SubscriptionsSummaryPanel({ metrics }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 1, height: '100%' }}>
      <Stack spacing={2}>
        <Typography variant="h6">Resumo de subscriptions</Typography>

        <Stack spacing={1.25}>
          <SummaryRow
            label="Subscriptions ativas"
            value={metrics.total_active_subscriptions}
          />
          <SummaryRow
            label="Aulas restantes somadas"
            value={metrics.total_remaining_classes}
          />
          <SummaryRow label="Planos cadastrados" value={metrics.total_plans} />
        </Stack>
      </Stack>
    </Paper>
  )
}

function SummaryRow({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography color="text.secondary">{label}</Typography>
      <Typography fontWeight={700}>{value}</Typography>
    </Stack>
  )
}

export default SubscriptionsSummaryPanel
