import {
  Alert,
  Stack,
} from '@mui/material'
import { SettingsRounded } from '@mui/icons-material'
import { useEffect, useMemo, useState } from 'react'
import AppSnackbar from '../../components/common/AppSnackbar'
import EmptyState from '../../components/common/EmptyState'
import LoadingState from '../../components/common/LoadingState'
import PageHeader from '../../components/common/PageHeader'
import SettingsSection from '../../components/systemSettings/SettingsSection'
import {
  fetchSystemSettings,
  updateSystemSettingsBatch,
} from '../../services/systemSettingsService'

const settingsSections = [
  {
    key: 'main_teacher',
    title: 'Professor principal',
    description: 'Centralize os dados de contato principais exibidos e reutilizados pelo sistema.',
    fields: [
      {
        key: 'main_teacher_name',
        label: 'Nome',
        kind: 'text',
      },
      {
        key: 'main_teacher_phone',
        label: 'Telefone',
        kind: 'text',
      },
      {
        key: 'main_teacher_email',
        label: 'Email',
        kind: 'text',
      },
    ],
  },
  {
    key: 'default_schedule',
    title: 'Agenda padrão',
    description: 'Defina o comportamento padrão usado como base para a agenda.',
    fields: [
      {
        key: 'default_slot_duration_minutes',
        label: 'Duração padrão do slot (min)',
        kind: 'text',
        inputType: 'number',
      },
      {
        key: 'default_max_bookings_per_day',
        label: 'Máximo de agendamentos por dia',
        kind: 'text',
        inputType: 'number',
      },
      {
        key: 'allow_same_day_booking',
        label: 'Permitir agendamento no mesmo dia',
        kind: 'switch',
        grid: 12,
        helperText: 'Ative para aceitar solicitações para o próprio dia.',
      },
    ],
  },
  {
    key: 'default_hours',
    title: 'Horários padrão',
    description: 'Mantenha aqui os horários padrão e listas simples de horários especiais.',
    fields: [
      {
        key: 'default_weekday_start_time',
        label: 'Horário inicial padrão de segunda a sexta',
        kind: 'text',
        inputType: 'time',
      },
      {
        key: 'default_weekday_end_time',
        label: 'Horário final padrão de segunda a sexta',
        kind: 'text',
        inputType: 'time',
      },
      {
        key: 'default_excluded_hours',
        label: 'Horários excluídos',
        kind: 'text',
        grid: 12,
        placeholder: '12:00, 13:00',
        helperText: 'Informe horários separados por vírgula.',
      },
      {
        key: 'default_saturday_hours',
        label: 'Horários padrão de sábado',
        kind: 'text',
        grid: 12,
        placeholder: '09:00, 10:00, 11:00',
        helperText: 'Informe horários separados por vírgula.',
      },
    ],
  },
  {
    key: 'notification_templates',
    title: 'Mensagens automáticas',
    description: 'Templates simples para notificações futuras do fluxo comercial e de agendamento.',
    fields: [
      {
        key: 'booking_request_notification_template',
        label: 'Template de solicitação de agendamento',
        kind: 'textarea',
        grid: 12,
        helperText: 'Você pode usar variáveis como {{student_name}}, {{date}} e {{time}}.',
      },
      {
        key: 'plan_request_notification_template',
        label: 'Template de solicitação de plano',
        kind: 'textarea',
        grid: 12,
        helperText: 'Você pode usar variáveis como {{student_name}} e {{plan_name}}.',
      },
    ],
  },
  {
    key: 'subscriptions',
    title: 'Assinaturas e comercial',
    description: 'Ajuste defaults de duração e ativação das assinaturas.',
    fields: [
      {
        key: 'default_subscription_duration_days',
        label: 'Duração padrão da assinatura (dias)',
        kind: 'text',
        inputType: 'number',
      },
      {
        key: 'auto_activate_subscription_after_approval',
        label: 'Ativar assinatura automaticamente após aprovação',
        kind: 'switch',
        grid: 12,
        helperText: 'Quando ativo, o fluxo comercial já pode ligar a assinatura após aprovação.',
      },
    ],
  },
]

const settingKinds = Object.fromEntries(
  settingsSections.flatMap((section) =>
    section.fields.map((field) => [field.key, field.kind])
  )
)

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function formatValueForInput(value, kind) {
  if (kind === 'switch') {
    return Boolean(value)
  }

  if (Array.isArray(value)) {
    return value.join(', ')
  }

  if (value === undefined || value === null) {
    return ''
  }

  return String(value)
}

function parseInputValue(value, kind) {
  if (kind === 'switch') {
    return Boolean(value)
  }

  if (kind === 'text' || kind === 'textarea') {
    return value
  }

  return value
}

function buildSettingsState(settings) {
  return settings.reduce((accumulator, setting) => {
    accumulator[setting.setting_key] = formatValueForInput(
      setting.value,
      settingKinds[setting.setting_key]
    )
    return accumulator
  }, {})
}

function prepareSectionPayload(section, values) {
  return section.fields.reduce((accumulator, field) => {
    const currentValue = values[field.key]

    if (
      field.key === 'default_excluded_hours'
      || field.key === 'default_saturday_hours'
    ) {
      accumulator[field.key] = String(currentValue || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
      return accumulator
    }

    if (
      field.key === 'default_slot_duration_minutes'
      || field.key === 'default_max_bookings_per_day'
      || field.key === 'default_subscription_duration_days'
    ) {
      accumulator[field.key] = currentValue === '' ? '' : Number(currentValue)
      return accumulator
    }

    accumulator[field.key] = parseInputValue(currentValue, field.kind)
    return accumulator
  }, {})
}

function AdminSystemSettingsPage() {
  const [settingsValues, setSettingsValues] = useState({})
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [savingSection, setSavingSection] = useState('')
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    severity: 'success',
    message: '',
  })

  async function loadSettings() {
    setLoading(true)
    setErrorMessage('')

    try {
      const settings = await fetchSystemSettings()
      setSettingsValues(buildSettingsState(settings))
    } catch (error) {
      setErrorMessage(getApiMessage(error, 'Não foi possível carregar as configurações do sistema.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  function showSnackbar(severity, message) {
    setSnackbarState({ open: true, severity, message })
  }

  function handleFieldChange(key, value) {
    setSettingsValues((current) => ({
      ...current,
      [key]: value,
    }))
  }

  async function handleSaveSection(section) {
    setSavingSection(section.key)

    try {
      const payload = prepareSectionPayload(section, settingsValues)
      const updatedSettings = await updateSystemSettingsBatch(payload)

      setSettingsValues((current) => ({
        ...current,
        ...buildSettingsState(updatedSettings),
      }))

      showSnackbar('success', `${section.title} salva com sucesso.`)
    } catch (error) {
      showSnackbar('error', getApiMessage(error, `Não foi possível salvar ${section.title.toLowerCase()}.`))
    } finally {
      setSavingSection('')
    }
  }

  const hasSettings = useMemo(
    () => Object.keys(settingsValues).length > 0,
    [settingsValues]
  )

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Configurações do sistema"
        description="Gerencie parâmetros globais do sistema sem editar código ou chamar a API manualmente."
      />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {loading ? <LoadingState message="Carregando configurações do sistema..." /> : null}

      {!loading && !errorMessage && !hasSettings ? (
        <EmptyState
          icon={<SettingsRounded />}
          title="Nenhuma configuração encontrada."
          description="Rode o seed inicial para popular a tabela system_settings."
        />
      ) : null}

      {!loading && !errorMessage && hasSettings
        ? settingsSections.map((section) => (
          <SettingsSection
            key={section.key}
            title={section.title}
            description={section.description}
            fields={section.fields}
            values={settingsValues}
            saving={savingSection === section.key}
            onChange={handleFieldChange}
            onSave={() => handleSaveSection(section)}
          />
        ))
        : null}

      <AppSnackbar
        open={snackbarState.open}
        severity={snackbarState.severity}
        message={snackbarState.message}
        onClose={() => setSnackbarState((current) => ({ ...current, open: false }))}
      />
    </Stack>
  )
}

export default AdminSystemSettingsPage
