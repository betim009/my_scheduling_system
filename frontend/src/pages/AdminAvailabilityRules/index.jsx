import { Alert, Button, Stack } from '@mui/material'
import { RuleRounded } from '@mui/icons-material'
import { useCallback, useEffect, useState } from 'react'
import AppSnackbar from '../../components/common/AppSnackbar'
import EmptyState from '../../components/common/EmptyState'
import LoadingState from '../../components/common/LoadingState'
import PageHeader from '../../components/common/PageHeader'
import RuleFormDialog from '../../components/adminAvailabilityRules/RuleFormDialog'
import RulesTable from '../../components/adminAvailabilityRules/RulesTable'
import {
  createAvailabilityRule,
  deleteAvailabilityRule,
  fetchAvailabilityRules,
  updateAvailabilityRule,
} from '../../services/availabilityRulesService'

const initialFormData = {
  weekday: 1,
  start_time: '',
  end_time: '',
  slot_duration_minutes: 60,
  is_active: true,
}

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function AdminAvailabilityRulesPage() {
  const [rules, setRules] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState('create')
  const [formData, setFormData] = useState(initialFormData)
  const [editingRuleId, setEditingRuleId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    severity: 'success',
    message: '',
  })

  const loadRules = useCallback(async () => {
    setLoading(true)
    setErrorMessage('')

    try {
      const data = await fetchAvailabilityRules()
      setRules(data)
    } catch (error) {
      setErrorMessage(getApiMessage(error, 'Não foi possível carregar as regras da agenda.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadRules()
  }, [loadRules])

  function showSnackbar(severity, message) {
    setSnackbarState({
      open: true,
      severity,
      message,
    })
  }

  function handleOpenCreate() {
    setDialogMode('create')
    setEditingRuleId(null)
    setFormData(initialFormData)
    setDialogOpen(true)
  }

  function handleOpenEdit(rule) {
    setDialogMode('edit')
    setEditingRuleId(rule.id)
    setFormData({
      weekday: rule.weekday,
      start_time: rule.start_time,
      end_time: rule.end_time,
      slot_duration_minutes: rule.slot_duration_minutes,
      is_active: rule.is_active,
    })
    setDialogOpen(true)
  }

  function handleFormChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSubmit() {
    setSubmitting(true)

    try {
      if (dialogMode === 'create') {
        await createAvailabilityRule(formData)
        showSnackbar('success', 'Regra criada com sucesso.')
      } else {
        await updateAvailabilityRule(editingRuleId, formData)
        showSnackbar('success', 'Regra atualizada com sucesso.')
      }

      setDialogOpen(false)
      await loadRules()
    } catch (error) {
      showSnackbar('error', getApiMessage(error, 'Não foi possível salvar a regra.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(rule) {
    setDeletingId(rule.id)

    try {
      await deleteAvailabilityRule(rule.id)
      setRules((current) => current.filter((item) => item.id !== rule.id))
      showSnackbar('success', 'Regra removida com sucesso.')
    } catch (error) {
      showSnackbar('error', getApiMessage(error, 'Não foi possível remover a regra.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Regras da agenda"
        description={
          <>
            Os endpoints de <code>/availability-rules</code> são consumidos nesta tela.
          </>
        }
        actionLabel="Nova regra"
        actionVariant="contained"
        onAction={handleOpenCreate}
      />

      <Button variant="outlined" onClick={() => loadRules()} sx={{ alignSelf: 'flex-start' }}>
        Atualizar
      </Button>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {loading ? <LoadingState message="Carregando regras da agenda..." /> : null}

      {!loading && !errorMessage && rules.length === 0 ? (
        <EmptyState
          icon={<RuleRounded />}
          title="Nenhuma regra cadastrada."
          description="Cadastre a disponibilidade recorrente para começar a gerar a agenda."
        />
      ) : null}

      {!loading && !errorMessage && rules.length > 0 ? (
        <RulesTable
          rules={rules}
          loadingId={deletingId}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      ) : null}

      <RuleFormDialog
        open={dialogOpen}
        mode={dialogMode}
        formData={formData}
        loading={submitting}
        onChange={handleFormChange}
        onClose={() => setDialogOpen(false)}
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

export default AdminAvailabilityRulesPage
