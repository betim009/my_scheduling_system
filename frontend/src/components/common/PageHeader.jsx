import { Button, Stack, Typography } from '@mui/material'

function PageHeader({
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled = false,
  actionVariant = 'outlined',
}) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', md: 'center' }}
    >
      <Stack spacing={0.75}>
        <Typography variant="h4">{title}</Typography>
        {description ? <Typography color="text.secondary">{description}</Typography> : null}
      </Stack>

      {actionLabel ? (
        <Button
          variant={actionVariant}
          onClick={onAction}
          disabled={actionDisabled}
        >
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  )
}

export default PageHeader
