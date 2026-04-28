import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material'

function PlanFormDialog({ open, mode, formData, loading, onChange, onClose, onSubmit }) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === 'create' ? 'Novo plano' : 'Editar plano'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <TextField label="Nome" name="name" value={formData.name} onChange={onChange} required fullWidth />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Aulas totais" name="total_classes" type="number" value={formData.total_classes} onChange={onChange} required fullWidth />
            <TextField label="Aulas por semana" name="classes_per_week" type="number" value={formData.classes_per_week} onChange={onChange} required fullWidth />
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Preço" name="price" type="number" value={formData.price} onChange={onChange} required fullWidth />
            <TextField label="Preço por aula" name="price_per_class" type="number" value={formData.price_per_class} onChange={onChange} required fullWidth />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={onSubmit} variant="contained" loading={loading}>
          {mode === 'create' ? 'Criar plano' : 'Salvar alterações'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PlanFormDialog
