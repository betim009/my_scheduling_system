import {
  Alert,
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
} from '@mui/material'
import { useState } from 'react'
import AppSnackbar from '../../components/common/AppSnackbar'
import PageHeader from '../../components/common/PageHeader'
import useAuth from '../../hooks/useAuth'
import { updateMyProfile } from '../../services/profileService'

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function ProfilePage() {
  const { user, getCurrentUser } = useAuth()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    severity: 'success',
    message: '',
  })

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit() {
    setLoading(true)
    setErrorMessage('')

    try {
      await updateMyProfile(formData)
      await getCurrentUser()
      setFormData((current) => ({ ...current, password: '' }))
      setSnackbarState({
        open: true,
        severity: 'success',
        message: 'Perfil atualizado com sucesso.',
      })
    } catch (error) {
      setErrorMessage(getApiMessage(error, 'Não foi possível atualizar seu perfil.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Minha conta"
        description="Atualize seus dados de acesso. Para manter a senha atual, deixe o campo de senha em branco."
      />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Paper sx={{ p: 3, borderRadius: 1 }}>
        <Stack spacing={2.5}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Nome"
                name="name"
                value={formData.name}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
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
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Telefone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                label="Nova senha"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                helperText="Opcional"
                fullWidth
              />
            </Grid>
          </Grid>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            sx={{ alignSelf: 'flex-start' }}
          >
            Salvar alterações
          </Button>
        </Stack>
      </Paper>

      <AppSnackbar
        open={snackbarState.open}
        severity={snackbarState.severity}
        message={snackbarState.message}
        onClose={() => setSnackbarState((current) => ({ ...current, open: false }))}
      />
    </Stack>
  )
}

export default ProfilePage
