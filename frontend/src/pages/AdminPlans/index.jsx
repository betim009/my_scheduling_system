import { Alert, Button, Stack } from '@mui/material'
import { LocalOfferRounded } from '@mui/icons-material'
import { useEffect, useState } from 'react'
import AppSnackbar from '../../components/common/AppSnackbar'
import EmptyState from '../../components/common/EmptyState'
import LoadingState from '../../components/common/LoadingState'
import PageHeader from '../../components/common/PageHeader'
import PlanFormDialog from '../../components/adminPlans/PlanFormDialog'
import PlansTable from '../../components/adminPlans/PlansTable'
import {
  createPlan,
  deletePlan,
  fetchAdminPlans,
  updatePlan,
} from '../../services/adminPlansService'

const initialFormData = {
  name: '',
  total_classes: '',
  classes_per_week: '',
  price: '',
  price_per_class: '',
}

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function AdminPlansPage() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState('create')
  const [formData, setFormData] = useState(initialFormData)
  const [editingPlanId, setEditingPlanId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [snackbarState, setSnackbarState] = useState({ open: false, severity: 'success', message: '' })

  async function loadPlans() {
    setLoading(true)
    setErrorMessage('')
    try {
      const data = await fetchAdminPlans()
      setPlans(data)
    } catch (error) {
      setErrorMessage(getApiMessage(error, 'Não foi possível carregar os planos.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPlans()
  }, [])

  function showSnackbar(severity, message) {
    setSnackbarState({ open: true, severity, message })
  }

  function handleOpenCreate() {
    setDialogMode('create')
    setEditingPlanId(null)
    setFormData(initialFormData)
    setDialogOpen(true)
  }

  function handleOpenEdit(plan) {
    setDialogMode('edit')
    setEditingPlanId(plan.id)
    setFormData({
      name: plan.name,
      total_classes: plan.total_classes,
      classes_per_week: plan.classes_per_week,
      price: plan.price,
      price_per_class: plan.price_per_class,
    })
    setDialogOpen(true)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      if (dialogMode === 'create') {
        await createPlan(formData)
        showSnackbar('success', 'Plano criado com sucesso.')
      } else {
        await updatePlan(editingPlanId, formData)
        showSnackbar('success', 'Plano atualizado com sucesso.')
      }
      setDialogOpen(false)
      await loadPlans()
    } catch (error) {
      showSnackbar('error', getApiMessage(error, 'Não foi possível salvar o plano.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(plan) {
    setDeletingId(plan.id)
    try {
      await deletePlan(plan.id)
      setPlans((current) => current.map((item) => (item.id === plan.id ? { ...item, is_active: false } : item)))
      showSnackbar('success', 'Plano removido com sucesso.')
    } catch (error) {
      showSnackbar('error', getApiMessage(error, 'Não foi possível remover o plano.'))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Planos"
        description={
          <>
            Os endpoints <code>GET /plans</code>, <code>POST /plans</code>, <code>PUT /plans/:id</code> e <code>DELETE /plans/:id</code> são consumidos nesta tela.
          </>
        }
        actionLabel="Novo plano"
        actionVariant="contained"
        onAction={handleOpenCreate}
      />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {loading ? <LoadingState message="Carregando planos..." /> : null}
      {!loading && !errorMessage && plans.length === 0 ? (
        <EmptyState
          icon={<LocalOfferRounded />}
          title="Nenhum plano encontrado."
          description="Crie o primeiro plano para começar a vincular aulas aos alunos."
        />
      ) : null}
      {!loading && !errorMessage && plans.length > 0 ? (
        <PlansTable plans={plans} loadingId={deletingId} onEdit={handleOpenEdit} onDelete={handleDelete} />
      ) : null}

      <PlanFormDialog
        open={dialogOpen}
        mode={dialogMode}
        formData={formData}
        loading={submitting}
        onChange={handleChange}
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

export default AdminPlansPage
