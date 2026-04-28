import { Box, Stack, Typography } from '@mui/material'

function EmptyState({ icon, title, description }) {
  return (
    <Box
      sx={{
        borderRadius: 1,
        p: { xs: 2.5, md: 3 },
        border: (theme) => `1px dashed ${theme.palette.divider}`,
        backgroundColor: 'background.paper',
      }}
    >
      <Stack spacing={1.5} alignItems="center" textAlign="center">
        {icon ? (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: (theme) => theme.palette.action.hover,
              color: 'primary.main',
            }}
          >
            {icon}
          </Box>
        ) : null}
        <Typography variant="h6">{title}</Typography>
        {description ? <Typography color="text.secondary">{description}</Typography> : null}
      </Stack>
    </Box>
  )
}

export default EmptyState
