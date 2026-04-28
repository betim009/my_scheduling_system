import { Button, Chip, Paper, Stack, TextField, Typography } from '@mui/material'

function formatHoursList(value) {
  if (!Array.isArray(value) || value.length === 0) {
    return '-'
  }

  return value.join(', ')
}

function GenerationForm({ formData, defaultSettings, loading, summary, onChange, onSubmit }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 1 }}>
      <Stack spacing={2.5}>
        <Typography variant="h6">Gerar slots do calendário</Typography>

        <Stack spacing={1}>
          <Typography variant="subtitle2">Padrões atuais do sistema</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              color="secondary"
              label={`Duração padrão: ${defaultSettings.default_slot_duration_minutes || '-'} min`}
            />
            <Chip
              color="secondary"
              label={`Semana: ${defaultSettings.default_weekday_start_time || '-'} às ${defaultSettings.default_weekday_end_time || '-'}`}
            />
          </Stack>
          <Typography color="text.secondary">
            Horários excluídos: {formatHoursList(defaultSettings.default_excluded_hours)}
          </Typography>
          <Typography color="text.secondary">
            Sábado: {formatHoursList(defaultSettings.default_saturday_hours)}
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Data inicial"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={onChange}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />

          <TextField
            label="Data final"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={onChange}
            InputLabelProps={{ shrink: true }}
            required
            fullWidth
          />
        </Stack>

        <Button variant="contained" onClick={onSubmit} loading={loading} sx={{ alignSelf: 'flex-start' }}>
          Gerar agenda
        </Button>

        {summary ? (
          <Stack spacing={0.75}>
            <Typography variant="subtitle2">Resumo da última geração</Typography>
            <Typography color="text.secondary">
              Período: {summary.start_date} até {summary.end_date}
            </Typography>
            <Typography color="text.secondary">
              Dias processados: {summary.total_days_processed}
            </Typography>
            <Typography color="text.secondary">
              Slots gerados: {summary.generated_slots_count}
            </Typography>
            <Typography color="text.secondary">
              Slots inseridos: {summary.inserted_slots_count}
            </Typography>
            <Typography color="text.secondary">
              Slots preservados: {summary.preserved_slots_count}
            </Typography>
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  )
}

export default GenerationForm
