import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import SettingsField from './SettingsField'

function SettingsSection({
  title,
  description,
  fields,
  values,
  saving = false,
  onChange,
  onSave,
}) {
  return (
    <Card>
      <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h5">{title}</Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75 }}>
              {description}
            </Typography>
          </Box>

          <Divider />

          <Grid container spacing={2}>
            {fields.map((field) => (
              <Grid key={field.key} size={{ xs: 12, md: field.grid || 6 }}>
                <SettingsField
                  field={field}
                  value={values[field.key]}
                  disabled={saving}
                  onChange={onChange}
                />
              </Grid>
            ))}
          </Grid>

          <Stack direction="row" justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={onSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={18} color="inherit" /> : null}
            >
              Salvar alterações
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default SettingsSection
