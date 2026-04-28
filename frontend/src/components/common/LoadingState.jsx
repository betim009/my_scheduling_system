import { CircularProgress, Stack, Typography } from '@mui/material'

function LoadingState({ message = 'Carregando dados...' }) {
  return (
    <Stack
      spacing={2}
      sx={{ minHeight: 240 }}
      alignItems="center"
      justifyContent="center"
    >
      <CircularProgress />
      <Typography color="text.secondary">{message}</Typography>
    </Stack>
  )
}

export default LoadingState
