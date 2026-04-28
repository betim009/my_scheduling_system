import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Link,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, Navigate, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

function validateForm(formData) {
  const nextErrors = {}

  if (!formData.name.trim()) {
    nextErrors.name = 'Informe o nome.'
  }

  if (!formData.username.trim()) {
    nextErrors.username = 'Informe um username.'
  }

  if (!formData.email.trim()) {
    nextErrors.email = 'Informe o email.'
  }

  if (!formData.password) {
    nextErrors.password = 'Informe a senha.'
  } else if (formData.password.length < 6) {
    nextErrors.password = 'Use pelo menos 6 caracteres.'
  }

  if (!['student'].includes(formData.role)) {
    nextErrors.role = 'Selecione um perfil válido.'
  }

  return nextErrors
}

function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'student',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
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
      await register(formData)
      const redirectTo = location.state?.from?.pathname || '/dashboard'
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
      <Card sx={{ width: '100%', maxWidth: 840, borderRadius: 1 }}>
        <CardContent sx={{ p: { xs: 3, md: 5 } }}>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Box>
              <Typography variant="h4">Criar conta</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Cadastro inicial integrado ao backend em <code>/auth/register</code>.
              </Typography>
            </Box>

            {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Nome"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.name)}
                  helperText={fieldErrors.name || 'Nome exibido no sistema.'}
                  required
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.username)}
                  helperText={fieldErrors.username || 'Identificador único do usuário.'}
                  required
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.email)}
                  helperText={fieldErrors.email || 'Será usado para login e comunicação.'}
                  required
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Telefone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  helperText="Opcional"
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Senha"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.password)}
                  helperText={fieldErrors.password || 'Use pelo menos 6 caracteres.'}
                  required
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  label="Perfil"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  error={Boolean(fieldErrors.role)}
                  helperText={fieldErrors.role || 'Escolha o perfil inicial da conta.'}
                  required
                  fullWidth
                >
                  <MenuItem value="student">Student</MenuItem>
                </TextField>
              </Grid>
            </Grid>

            <Button type="submit" variant="contained" size="large" disabled={submitting}>
              {submitting ? <CircularProgress size={22} color="inherit" /> : 'Cadastrar'}
            </Button>

            <Typography color="text.secondary">
              Já possui acesso?{' '}
              <Link component={RouterLink} to="/login" underline="hover">
                Voltar para login
              </Link>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Register
