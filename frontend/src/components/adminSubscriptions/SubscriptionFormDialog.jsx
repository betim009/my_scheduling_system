import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material'

const statusOptions = [
  { value: 'active', label: 'Ativa' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'expired', label: 'Expirada' },
]

function SubscriptionFormDialog({
  open,
  mode,
  formData,
  users,
  plans,
  loading,
  onChange,
  onClose,
  onSubmit,
}) {
  const isCreate = mode === 'create'

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isCreate ? 'Nova assinatura' : 'Editar assinatura'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField
            select
            label="Aluno"
            name="student_id"
            value={formData.student_id}
            onChange={onChange}
            disabled={!isCreate}
            required
            fullWidth
          >
            {users.map((user) => (
              <MenuItem key={user.id} value={user.id}>
                {user.name} ({user.email})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Plano"
            name="plan_id"
            value={formData.plan_id}
            onChange={onChange}
            disabled={!isCreate}
            required
            fullWidth
          >
            {plans.map((plan) => (
              <MenuItem key={plan.id} value={plan.id}>
                {plan.name}
              </MenuItem>
            ))}
          </TextField>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Data inicial"
              name="start_date"
              type="date"
              value={formData.start_date}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
            <TextField
              label="Data final"
              name="end_date"
              type="date"
              value={formData.end_date}
              onChange={onChange}
              InputLabelProps={{ shrink: true }}
              required
              fullWidth
            />
          </Stack>

          <TextField
            select
            label="Status"
            name="status"
            value={formData.status}
            onChange={onChange}
            required
            fullWidth
          >
            {statusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={onSubmit} variant="contained" loading={loading}>
          {isCreate ? 'Criar assinatura' : 'Salvar alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SubscriptionFormDialog
