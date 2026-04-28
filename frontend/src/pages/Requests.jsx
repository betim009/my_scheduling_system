import { AssignmentRounded } from '@mui/icons-material'
import { Card, CardContent, Stack, Typography } from '@mui/material'

function Requests() {
  return (
    <Card sx={{ borderRadius: 1 }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AssignmentRounded color="primary" />
            <Typography variant="h5">Minhas solicitações</Typography>
          </Stack>

          <Typography color="text.secondary">
            Página placeholder para listar booking requests, status de aprovação e ações
            futuras do aluno ou do admin.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default Requests
