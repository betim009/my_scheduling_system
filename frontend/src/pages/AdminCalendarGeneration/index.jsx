import { Alert, Stack } from '@mui/material'
import { useEffect, useState } from 'react'
import GenerationForm from '../../components/adminCalendarGeneration/GenerationForm'
import AppSnackbar from '../../components/common/AppSnackbar'
import PageHeader from '../../components/common/PageHeader'
import { generateCalendarSlots } from '../../services/calendarGenerationService'
import { fetchPublicSystemSettings } from '../../services/publicSystemSettingsService'

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function AdminCalendarGenerationPage() {
  const [formData, setFormData] = useState({
    start_date: '',
    end_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(null)
  const [inlineError, setInlineError] = useState('')
  const [defaultSettings, setDefaultSettings] = useState({})
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    severity: 'success',
    message: '',
  })

  function showSnackbar(severity, message) {
    setSnackbarState({
      open: true,
      severity,
      message,
    })
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  useEffect(() => {
    let ignore = false

    async function loadDefaults() {
      try {
        const settings = await fetchPublicSystemSettings()

        if (!ignore) {
          setDefaultSettings(settings)
        }
      } catch {
        if (!ignore) {
          setDefaultSettings({})
        }
      }
    }

    loadDefaults()

    return () => {
      ignore = true
    }
  }, [])

  async function handleSubmit() {
    setLoading(true)
    setInlineError('')

    try {
      const response = await generateCalendarSlots(formData)
      setSummary(response)
      showSnackbar('success', 'Agenda gerada com sucesso para o período informado.')
    } catch (error) {
      const message = getApiMessage(error, 'Não foi possível gerar a agenda.')
      setInlineError(message)
      showSnackbar('error', message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Gerar agenda"
        description={
          <>
            O endpoint <code>POST /calendar-slots/generate</code> é consumido nesta tela. Sem
            regras ativas, o backend usa os horários padrão das configurações do sistema como
            fallback.
          </>
        }
      />

      {inlineError ? <Alert severity="error">{inlineError}</Alert> : null}

      <GenerationForm
        formData={formData}
        defaultSettings={defaultSettings}
        loading={loading}
        summary={summary}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      <AppSnackbar
        open={snackbarState.open}
        severity={snackbarState.severity}
        message={snackbarState.message}
        onClose={() => setSnackbarState((current) => ({ ...current, open: false }))}
      />
    </Stack>
  )
}

export default AdminCalendarGenerationPage
