import {
  ArrowForwardRounded,
  CalendarMonthRounded,
  LocalOfferRounded,
  SchoolRounded,
} from '@mui/icons-material'
import {
  alpha,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import AdminDashboardPage from './AdminDashboard/index.jsx'
import useAuth from '../hooks/useAuth'

function Dashboard() {
  const { user } = useAuth()

  if (user?.role === 'admin') {
    return <AdminDashboardPage />
  }

  return (
    <Stack spacing={3}>
      <Card
        sx={{
          borderRadius: 1,
          background:
            'linear-gradient(135deg, rgba(109,40,217,1) 0%, rgba(17,17,17,1) 100%)',
          color: '#ffffff',
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Stack spacing={2}>
            <Chip
              label={user?.role === 'admin' ? 'Admin logado' : 'Student logado'}
              sx={{
                alignSelf: 'flex-start',
                bgcolor: '#facc15',
                color: '#111111',
                fontWeight: 700,
              }}
            />
            <Typography variant="h4">Olá, {user?.name || 'usuário'}.</Typography>
            <Typography sx={{ maxWidth: 700, color: 'rgba(255,255,255,0.82)' }}>
              Esta base já está pronta para crescer com agenda, solicitações, planos e
              acompanhamento das operações do sistema.
            </Typography>
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {[
          {
            title: 'Calendário',
            description: 'Espaço preparado para consumir os slots e a agenda do backend.',
            icon: <CalendarMonthRounded color="primary" />,
            to: '/calendar',
          },
          {
            title: 'Solicitações',
            description: 'Área reservada para acompanhar pedidos e status de aprovação.',
            icon: <SchoolRounded color="primary" />,
            to: '/requests',
          },
          {
            title: 'Planos',
            description: 'Página base para exibir pacotes e futuras assinaturas do aluno.',
            icon: <LocalOfferRounded color="primary" />,
            to: '/plans',
          },
        ].map(({ title, description, icon, to }) => (
          <Grid key={title} size={{ xs: 12, md: 4 }}>
            <Card sx={{ borderRadius: 1, height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    }}
                  >
                    {icon}
                    <ArrowForwardRounded color="primary" />
                  </Stack>

                  <Typography variant="h6">{title}</Typography>
                  <Typography color="text.secondary">{description}</Typography>

                  <Button component={RouterLink} to={to} variant="outlined">
                    Abrir
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Stack>
  )
}

export default Dashboard
