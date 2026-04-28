import { Card, CardContent, Stack, Typography, alpha } from '@mui/material'

function MetricCard({ title, value, highlight = false }) {
  return (
    <Card
      sx={{
        borderRadius: 1,
        bgcolor: highlight ? (theme) => alpha(theme.palette.primary.main, 0.08) : 'background.paper',
        borderColor: highlight ? (theme) => alpha(theme.palette.primary.main, 0.18) : undefined,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack spacing={1}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default MetricCard
