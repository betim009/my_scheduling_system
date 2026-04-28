import { Chip } from '@mui/material'

function StatusChip({ status, map }) {
  const config = map?.[status] || {
    label: status,
    color: 'default',
  }

  return (
    <Chip
      label={config.label}
      color={config.color}
      size="small"
      variant="filled"
      sx={{ fontWeight: 700, borderRadius: 1 }}
    />
  )
}

export default StatusChip
