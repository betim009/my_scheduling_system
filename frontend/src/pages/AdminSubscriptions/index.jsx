import { Alert, Stack } from '@mui/material'
import { LoyaltyRounded } from '@mui/icons-material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AdjustClassesDialog from '../../components/adminSubscriptions/AdjustClassesDialog'
import AppSnackbar from '../../components/common/AppSnackbar'
import EmptyState from '../../components/common/EmptyState'
import LoadingState from '../../components/common/LoadingState'
import PageHeader from '../../components/common/PageHeader'
import SubscriptionFormDialog from '../../components/adminSubscriptions/SubscriptionFormDialog'
import SubscriptionsFilters from '../../components/adminSubscriptions/SubscriptionsFilters'
import SubscriptionsTable from '../../components/adminSubscriptions/SubscriptionsTable'
import {
  adjustSubscriptionRemainingClasses,
  createSubscription,
  fetchAdminSubscriptions,
  updateSubscription,
} from '../../services/adminSubscriptionsService'
import { fetchAdminPlans } from '../../services/adminPlansService'
import { fetchUsers } from '../../services/usersService'

const initialFormData = {
  student_id: '',
  plan_id: '',
  start_date: '',
  end_date: '',
  status: 'active',
}

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

const initialFilters = {
  student_id: '',
  plan_id: '',
  status: '',
}

function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([])
  const [students, setStudents] = useState([])
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [filters, setFilters] = useState(initialFilters)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState('create')
  const [formData, setFormData] = useState(initialFormData)
  const [editingSubscriptionId, setEditingSubscriptionId] = useState(null)
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false)
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [remainingClassesValue, setRemainingClassesValue] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [rowLoadingId, setRowLoadingId] = useState(null)
  const [snackbarState, setSnackbarState] = useState({ open: false, severity: 'success', message: '' })

  async function loadDependencies() {
    const [studentsData, plansData] = await Promise.all([
      fetchUsers({ role: 'student' }),
      fetchAdminPlans(),
    ])

    setStudents(studentsData)
    setPlans(plansData)
  }

  const loadSubscriptions = useCallback(async (nextFilters = initialFilters) => {
    setLoading(true)
    setErrorMessage('')
    try {
      const apiFilters = Object.fromEntries(
        Object.entries(nextFilters)
          .filter(([, value]) => value !== undefined && value !== null && value !== '')
          .map(([key, value]) => [key, key.endsWith('_id') ? Number(value) : value])
      )
      const data = await fetchAdminSubscriptions(apiFilters)
      setSubscriptions(data)
    } catch (error) {
      setErrorMessage(getApiMessage(error, 'Não foi possível carregar as assinaturas.'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    async function bootstrap() {
      try {
        await Promise.all([loadDependencies(), loadSubscriptions(initialFilters)])
      } catch (error) {
        setErrorMessage(getApiMessage(error, 'Não foi possível carregar os dados comerciais.'))
        setLoading(false)
      }
    }

    bootstrap()
  }, [loadSubscriptions])

  function showSnackbar(severity, message) {
    setSnackbarState({ open: true, severity, message })
  }

  function handleOpenCreate() {
    setDialogMode('create')
    setEditingSubscriptionId(null)
    setFormData(initialFormData)
    setDialogOpen(true)
  }

  function handleOpenEdit(subscription) {
    setDialogMode('edit')
    setEditingSubscriptionId(subscription.id)
    setFormData({
      student_id: subscription.student_id,
      plan_id: subscription.plan_id,
      start_date: subscription.start_date,
      end_date: subscription.end_date,
      status: subscription.status,
    })
    setDialogOpen(true)
  }

  function handleOpenAdjust(subscription) {
    setSelectedSubscription(subscription)
    setRemainingClassesValue(String(subscription.remaining_classes))
    setAdjustDialogOpen(true)
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  async function handleResetFilters() {
    setFilters(initialFilters)
    await loadSubscriptions(initialFilters)
  }

  async function handleSubmit() {
    setSubmitting(true)
    try {
      if (dialogMode === 'create') {
        await createSubscription(formData)
        showSnackbar('success', 'Assinatura criada com sucesso.')
      } else {
        await updateSubscription(editingSubscriptionId, formData)
        showSnackbar('success', 'Assinatura atualizada com sucesso.')
      }
      setDialogOpen(false)
      await loadSubscriptions(filters)
    } catch (error) {
      showSnackbar('error', getApiMessage(error, 'Não foi possível salvar a assinatura.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAdjustClasses() {
    if (!selectedSubscription) {
      return
    }

    setRowLoadingId(selectedSubscription.id)
    try {
      await adjustSubscriptionRemainingClasses(selectedSubscription.id, {
        remaining_classes: Number(remainingClassesValue),
      })
      setAdjustDialogOpen(false)
      showSnackbar('success', 'Saldo ajustado com sucesso.')
      await loadSubscriptions(filters)
    } catch (error) {
      showSnackbar('error', getApiMessage(error, 'Não foi possível ajustar o saldo.'))
    } finally {
      setRowLoadingId(null)
    }
  }

  const activePlans = useMemo(
    () => plans.filter((plan) => plan.is_active),
    [plans]
  )

  return (
    <Stack spacing={3}>
      <PageHeader
        title="Assinaturas"
        description={
          <>
            Os endpoints <code>GET /subscriptions</code>, <code>POST /subscriptions</code>, <code>PUT /subscriptions/:id</code>, <code>PATCH /subscriptions/:id/status</code>, <code>PATCH /subscriptions/:id/remaining-classes</code> e <code>GET /users?role=student</code> são consumidos nesta tela.
          </>
        }
        actionLabel="Nova assinatura"
        actionVariant="contained"
        onAction={handleOpenCreate}
      />

      <SubscriptionsFilters
        filters={filters}
        students={students}
        plans={plans}
        loading={loading}
        onChange={handleFilterChange}
        onApply={() => loadSubscriptions(filters)}
        onReset={handleResetFilters}
      />

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
      {loading ? <LoadingState message="Carregando assinaturas e dependências..." /> : null}
      {!loading && !errorMessage && subscriptions.length === 0 ? (
        <EmptyState
          icon={<LoyaltyRounded />}
          title="Nenhuma assinatura encontrada."
          description="Vincule um plano a um aluno para liberar saldo real de aulas."
        />
      ) : null}
      {!loading && !errorMessage && subscriptions.length > 0 ? (
        <SubscriptionsTable
          subscriptions={subscriptions}
          loadingId={rowLoadingId}
          onEdit={handleOpenEdit}
          onAdjustClasses={handleOpenAdjust}
        />
      ) : null}

      <SubscriptionFormDialog
        open={dialogOpen}
        mode={dialogMode}
        formData={formData}
        users={students}
        plans={activePlans}
        loading={submitting}
        onChange={handleChange}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
      />

      <AdjustClassesDialog
        open={adjustDialogOpen}
        subscription={selectedSubscription}
        value={remainingClassesValue}
        loading={rowLoadingId === selectedSubscription?.id}
        onChange={setRemainingClassesValue}
        onClose={() => setAdjustDialogOpen(false)}
        onSubmit={handleAdjustClasses}
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

export default AdminSubscriptionsPage
