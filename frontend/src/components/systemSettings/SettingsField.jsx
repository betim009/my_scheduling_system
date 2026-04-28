import {
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material'

function SettingsField({
  field,
  value,
  disabled = false,
  onChange,
}) {
  if (field.kind === 'switch') {
    return (
      <Stack spacing={1}>
        <FormControlLabel
          control={
            <Switch
              checked={Boolean(value)}
              onChange={(event) => onChange(field.key, event.target.checked)}
              disabled={disabled}
            />
          }
          label={field.label}
        />
        {field.helperText ? (
          <Typography variant="body2" color="text.secondary">
            {field.helperText}
          </Typography>
        ) : null}
      </Stack>
    )
  }

  return (
    <TextField
      label={field.label}
      value={value ?? ''}
      onChange={(event) => onChange(field.key, event.target.value)}
      disabled={disabled}
      type={field.inputType || 'text'}
      multiline={field.kind === 'textarea'}
      minRows={field.kind === 'textarea' ? 4 : undefined}
      placeholder={field.placeholder}
      helperText={field.helperText}
      fullWidth
      InputLabelProps={field.inputType === 'time' ? { shrink: true } : undefined}
    />
  )
}

export default SettingsField
