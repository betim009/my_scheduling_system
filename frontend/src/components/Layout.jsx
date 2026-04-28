import { MenuRounded } from '@mui/icons-material'
import {
  alpha,
  AppBar,
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { drawerWidth } from '../utils/layout'
import Sidebar from './Sidebar'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/calendar': 'Calendário',
  '/profile': 'Minha conta',
  '/admin/booking-requests': 'Gerenciar solicitações',
  '/admin/bookings': 'Gerenciar agendamentos',
  '/admin/availability-rules': 'Regras da agenda',
  '/admin/availability-exceptions': 'Exceções da agenda',
  '/admin/calendar-generation': 'Gerar agenda',
  '/admin/plan-requests': 'Solicitações de planos',
  '/admin/plans': 'Planos',
  '/admin/system-settings': 'Configurações do sistema',
  '/admin/subscriptions': 'Assinaturas',
  '/my-booking-requests': 'Minhas solicitações',
  '/my-bookings': 'Meus agendamentos',
  '/my-subscriptions': 'Minhas aulas',
  '/plans': 'Planos',
}

function Layout({ children = null }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  const currentTitle = useMemo(
    () => pageTitles[location.pathname] || 'Sistema de Agendamento',
    [location.pathname]
  )

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <AppBar
          position="sticky"
          elevation={0}
          color="transparent"
          sx={{
            backdropFilter: 'blur(16px)',
            borderBottom: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
          }}
        >
          <Toolbar sx={{ minHeight: 80, px: { xs: 2, md: 4 } }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1, display: { md: 'none' } }}
            >
              <MenuRounded />
            </IconButton>

            <Stack spacing={0.35} sx={{ flexGrow: 1 }}>
              <Typography variant="overline" color="text.secondary">
                {user?.role === 'admin' ? 'Painel administrativo' : 'Área do aluno'}
              </Typography>
              <Typography variant="h5">{currentTitle}</Typography>
            </Stack>

            <Box
              sx={{
                px: 1,
                py: 0.75,
                borderRadius: 1,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center" justifyContent="center">
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                  }}
                >
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </Avatar>
                <Chip
                  label={user?.role === 'admin' ? 'Admin' : 'Student'}
                  size="small"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 700,
                  }}
                />
              </Stack>
            </Box>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: { xs: 2, md: 4 } }}>
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
