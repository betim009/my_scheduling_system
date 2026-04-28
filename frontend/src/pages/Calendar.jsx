import { CalendarMonthRounded, AutoAwesomeRounded } from '@mui/icons-material'
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material'

function Calendar() {
  return (
    <Card sx={{ borderRadius: 1 }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <CalendarMonthRounded color="primary" />
            <Typography variant="h5">Calendário</Typography>
          </Stack>

          <Chip
            icon={<AutoAwesomeRounded />}
            label="Placeholder pronto para integrar calendar_slots"
            color="secondary"
            sx={{ alignSelf: 'flex-start', fontWeight: 700 }}
          />

          <Typography color="text.secondary">
            Use esta página como base para listar slots disponíveis, agenda mensal e
            interações do usuário com o calendário.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default Calendar
