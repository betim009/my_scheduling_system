import { CalendarMonthRounded, LoginRounded, PersonAddRounded } from '@mui/icons-material'
import {
  AppBar,
  Box,
  Button,
  Container,
  Stack,
  Toolbar,
  Typography,
  alpha,
} from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

function PublicPageLayout({ title = 'Calendário', subtitle, children }) {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          backdropFilter: 'blur(16px)',
          borderBottom: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
        }}
      >
        <Toolbar sx={{ minHeight: 80 }}>
          <Container maxWidth="xl" sx={{ px: { xs: 2, md: 3 } }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <CalendarMonthRounded color="primary" />
                <Stack spacing={0.15}>
                  <Typography variant="subtitle1" fontWeight={800}>
                    {title}
                  </Typography>
                  {subtitle ? (
                    <Typography variant="caption" color="text.secondary">
                      {subtitle}
                    </Typography>
                  ) : null}
                </Stack>
              </Stack>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Button component={RouterLink} to="/login" variant="outlined" startIcon={<LoginRounded />}>
                  Entrar
                </Button>
                <Button component={RouterLink} to="/register" variant="contained" startIcon={<PersonAddRounded />}>
                  Criar conta
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, md: 3 } }}>
        {children}
      </Container>
    </Box>
  )
}

export default PublicPageLayout
