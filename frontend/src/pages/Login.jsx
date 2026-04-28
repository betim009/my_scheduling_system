import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

function validateForm(formData) {
  const nextErrors = {}

  if (!formData.email.trim()) {
    nextErrors.email = 'Informe seu email.'
  }

  if (!formData.password) {
    nextErrors.password = 'Informe sua senha.'
  }

  return nextErrors
}

function getSafeRedirectTo(location) {
  const queryRedirect = new URLSearchParams(location.search).get('redirect')
  const stateRedirect = location.state?.from?.pathname
  const redirectTo = queryRedirect || stateRedirect || '/dashboard'

  return redirectTo.startsWith('/') && !redirectTo.startsWith('//') ? redirectTo : '/dashboard'
}

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login } = useAuth()
  const redirectTo = getSafeRedirectTo(location)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateForm(formData)
    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setSubmitting(true)
    setErrorMessage('')

    try {
      await login(formData)

      navigate(redirectTo, { replace: true })
    } catch (error) {
      setErrorMessage(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
    setFieldErrors((current) => ({
      ...current,
      [name]: '',
    }))
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: 4,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 1100, overflow: 'hidden', borderRadius: 1 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { md: '1.05fr 0.95fr' } }}>
          <Box
            sx={{
              p: { xs: 3, md: 5 },
              background:
                'linear-gradient(180deg, rgba(109,40,217,1) 0%, rgba(76,29,149,1) 100%)',
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { md: 640 },
            }}
          >
            <Box>
              <Typography variant="overline" sx={{ letterSpacing: '0.18em' }}>
                Sistema de Agendamento
              </Typography>
              <Typography variant="h3" sx={{ mt: 2 }}>
                Entre para gerenciar aulas, agenda e planos em um só painel.
              </Typography>
              <Typography sx={{ mt: 3, maxWidth: 460, color: 'rgba(255,255,255,0.8)' }}>
                O frontend já sai integrado com JWT, rotas privadas e layout administrativo
                baseado em Material UI.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1.25} sx={{ mt: 4, flexWrap: 'wrap' }}>
              <Button
                component={RouterLink}
                to="/calendar"
                variant="outlined"
                sx={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.28)' }}
              >
                Calendário
              </Button>
            </Stack>
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack spacing={3} component="form" onSubmit={handleSubmit}>
              <Box>
                <Typography variant="h4">Login</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  Use seu email e senha para acessar o sistema.
                </Typography>
              </Box>

              {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                error={Boolean(fieldErrors.email)}
                helperText={fieldErrors.email || 'Use o mesmo email cadastrado no sistema.'}
                required
                fullWidth
              />

              <TextField
                label="Senha"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={Boolean(fieldErrors.password)}
                helperText={fieldErrors.password || 'Sua senha é protegida e não será exibida.'}
                required
                fullWidth
              />

              <Button type="submit" variant="contained" size="large" disabled={submitting}>
                {submitting ? <CircularProgress size={22} color="inherit" /> : 'Entrar'}
              </Button>

              <Typography color="text.secondary">
                Ainda não tem conta?{' '}
                <Link component={RouterLink} to="/register" underline="hover">
                  Criar cadastro
                </Link>
              </Typography>
            </Stack>
          </CardContent>
        </Box>
      </Card>
    </Box>
  )
}

export default Login
