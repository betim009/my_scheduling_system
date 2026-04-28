import { Alert, Button, Stack, TextField } from '@mui/material'
import { EventBusyRounded } from '@mui/icons-material'
import { useCallback, useEffect, useState } from 'react'
import ExceptionFormDialog from '../../components/adminAvailabilityExceptions/ExceptionFormDialog'
import ExceptionsTable from '../../components/adminAvailabilityExceptions/ExceptionsTable'
import AppSnackbar from '../../components/common/AppSnackbar'
import EmptyState from '../../components/common/EmptyState'
import LoadingState from '../../components/common/LoadingState'
import PageHeader from '../../components/common/PageHeader'
import {
  createAvailabilityException,
  deleteAvailabilityException,
  fetchAvailabilityExceptions,
  updateAvailabilityException,
} from '../../services/availabilityExceptionsService'

const initialFormData = {
  user_id: '',
  exception_date: '',
  type: 'block_full_day',
  start_time: '',
  end_time: '',
  reason: '',
}

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function AdminAvailabilityExceptionsPage() {
  const [exceptions, setExceptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [filterUserId, setFilterUserId] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState('create')
  const [formData, setFormData] = useState(initialFormData)
  const [editingExceptionId, setEditingExceptionId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    severity: 'success',
    message: '',
  })

  const loadExceptions = useCallback(async (userId = filterUserId) => {
    setLoading(true)
    setErrorMessage('')

    try {
      const data = await fetchAvailabilityExceptions(
        userId ? { user_id: Number(userId) } : {}
      )
      setExceptions(data)
    } catch (error) {
      setErrorMessage(getApiMessage(error, 'Não foi possível carregar as exceções da agenda.'))
    } finally {
      setLoading(false)
    }
  }, [filterUserId])

  useEffect(() => {
    loadExceptions()
  }, [loadExceptions])

  function showSnackbar(severity, message) {
    setSnackbarState({
      open: true,
      severity,
      message,
    })
  }

  function handleOpenCreate() {
    setDialogMode('create')
    setEditingExceptionId(null)
    setFormData(initialFormData)
    setDialogOpen(true)
  }

  function handleOpenEdit(exception) {
    setDialogMode('edit')
    setEditingExceptionId(exception.id)
    setFormData({
      user_id: exception.user_id,
      exception_date: exception.exception_date,
      type: exception.type,
      start_time: exception.start_time,
      end_time: exception.end_time,
      reason: exception.reason || '',
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
      const payload =
        formData.type === 'block_full_day'
          ? {
              ...formData,
              start_time: null,
              end_time: null,
            }
          : formData

      if (dialogMode === 'create') {
        await createAvailabilityException(payload)
        showSnackbar('success', 'Exceção criada com sucesso.')
      } else {
        await updateAvailabilityException(editingExceptionId, payload)
        showSnackbar('success', 'Exceção atualizada com sucesso.')
      }

      setDialogOpen(false)
      await loadExceptions()
    } catch (error) {
      showSnackbar('error', getApiMessage(error, 'Não foi possível salvar a exceção.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(exception) {
    setDeletingId(exception.id)

    try {
      await deleteAvailabilityException(exception.id)
      setExceptions((current) => current.filter((item) => item.id !== exception.id))
      showSnackbar('success', 'Exceção removida com sucesso.')
    } catch (error) {
      showSnackbar('error', getApiMessage(error, 'Não foi possível remover a exceção.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Exceções da agenda"
        description={
          <>
            Os endpoints de <code>/availability-exceptions</code> são consumidos nesta tela.
          </>
        }
        actionLabel="Nova exceção"
        actionVariant="contained"
        onAction={handleOpenCreate}
      />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Filtrar por user_id"
          type="number"
          value={filterUserId}
          onChange={(event) => setFilterUserId(event.target.value)}
        />
        <Button variant="outlined" onClick={() => loadExceptions()}>
          Atualizar
        </Button>
      </Stack>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {loading ? <LoadingState message="Carregando exceções da agenda..." /> : null}

      {!loading && !errorMessage && exceptions.length === 0 ? (
        <EmptyState
          icon={<EventBusyRounded />}
          title="Nenhuma exceção cadastrada."
          description="Use exceções para bloquear dias, adicionar horários extras ou personalizar datas específicas."
        />
      ) : null}

      {!loading && !errorMessage && exceptions.length > 0 ? (
        <ExceptionsTable
          exceptions={exceptions}
          loadingId={deletingId}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      ) : null}

      <ExceptionFormDialog
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

export default AdminAvailabilityExceptionsPage
