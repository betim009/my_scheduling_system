import {
  AssignmentRounded,
  AutoModeRounded,
  EventAvailableRounded,
  LayersRounded,
  LoyaltyRounded,
  CalendarMonthRounded,
  DashboardRounded,
  EventBusyRounded,
  EventNoteRounded,
  LocalOfferRounded,
  LogoutRounded,
  ManageAccountsRounded,
  RuleRounded,
  SettingsRounded,
} from '@mui/icons-material'
import {
  alpha,
  Box,
  Button,
  Divider,
  Drawer,
  Stack,
  Typography,
} from '@mui/material'
import { useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import { drawerWidth } from '../utils/layout'
import SidebarItem from './SidebarItem'

const navigationGroups = [
  {
    title: 'Geral',
    items: [
  { label: 'Dashboard', path: '/dashboard', icon: <DashboardRounded /> },
  { label: 'Calendário', path: '/calendar', icon: <CalendarMonthRounded /> },
  { label: 'Minha conta', path: '/profile', icon: <ManageAccountsRounded /> },
    ],
  },
  {
    title: 'Administração',
    roles: ['admin'],
    items: [
  {
    label: 'Gerenciar solicitações',
    path: '/admin/booking-requests',
    icon: <AssignmentRounded />,
  },
  {
    label: 'Gerenciar agendamentos',
    path: '/admin/bookings',
    icon: <EventNoteRounded />,
  },
  {
    label: 'Regras da agenda',
    path: '/admin/availability-rules',
    icon: <RuleRounded />,
  },
  {
    label: 'Exceções da agenda',
    path: '/admin/availability-exceptions',
    icon: <EventBusyRounded />,
  },
  {
    label: 'Gerar agenda',
    path: '/admin/calendar-generation',
    icon: <AutoModeRounded />,
  },
  {
    label: 'Solicitações de planos',
    path: '/admin/plan-requests',
    icon: <LocalOfferRounded />,
  },
  {
    label: 'Planos',
    path: '/admin/plans',
    icon: <LocalOfferRounded />,
  },
  {
    label: 'Assinaturas',
    path: '/admin/subscriptions',
    icon: <LoyaltyRounded />,
  },
  {
    label: 'Configurações',
    path: '/admin/system-settings',
    icon: <SettingsRounded />,
  },
    ],
  },
  {
    title: 'Aluno',
    roles: ['student'],
    items: [
  {
    label: 'Minhas solicitações',
    path: '/my-booking-requests',
    icon: <AssignmentRounded />,
  },
  {
    label: 'Meus agendamentos',
    path: '/my-bookings',
    icon: <EventAvailableRounded />,
  },
  {
    label: 'Minhas aulas',
    path: '/my-subscriptions',
    icon: <LayersRounded />,
  },
  { label: 'Planos', path: '/plans', icon: <LocalOfferRounded /> },
    ],
  },
]

function SidebarContent({ onNavigate }) {
  const location = useLocation()
  const { logout, user } = useAuth()

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
      }}
    >
      <Stack spacing={2} sx={{ p: 1 }}>
        <Box>
          <Typography
            variant="overline"
            sx={{ color: alpha('#ffffff', 0.72), letterSpacing: '0.16em' }}
          >
            Sistema de Agendamento
          </Typography>
          <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
            Painel de aulas
          </Typography>
        </Box>
      </Stack>

      <Divider sx={{ my: 2.5, borderColor: alpha('#ffffff', 0.14) }} />

      <Box sx={{ flexGrow: 1, overflowY: 'auto', pr: 0.5 }}>
        {navigationGroups
          .filter((group) => !group.roles || group.roles.includes(user?.role))
          .map((group, index) => (
            <Box
              key={group.title}
              sx={{
                mt: index === 0 ? 0 : 2.5,
              }}
            >
              <Typography
                sx={{
                  px: 1.5,
                  mb: 1.25,
                  color: alpha('#ffffff', 0.64),
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  lineHeight: 1.4,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {group.title}
              </Typography>

              <Box>
                {group.items.map(({ label, path, icon }) => (
                  <SidebarItem
                    key={path}
                    label={label}
                    path={path}
                    icon={icon}
                    active={location.pathname === path}
                    onClick={onNavigate}
                  />
                ))}
              </Box>
            </Box>
          ))}
      </Box>

      <Button
        variant="contained"
        color="secondary"
        startIcon={<LogoutRounded />}
        onClick={logout}
        sx={{ mt: 2.5 }}
      >
        Sair
      </Button>
    </Box>
  )
}

function Sidebar({ mobileOpen, onClose }) {
  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <SidebarContent onNavigate={onClose} />
      </Drawer>

      <Drawer
        variant="permanent"
        open
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: 'none',
          },
        }}
      >
        <SidebarContent />
      </Drawer>
    </Box>
  )
}

export default Sidebar
