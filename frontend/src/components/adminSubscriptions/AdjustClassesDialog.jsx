import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material'

function AdjustClassesDialog({
  open,
  subscription,
  value,
  loading,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
      <DialogTitle>Ajustar aulas</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Typography color="text.secondary">
            Ajuste manual do saldo para {subscription?.student_name || 'o aluno selecionado'}.
          </Typography>
          <TextField
            label="Novo saldo de aulas"
            type="number"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            required
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button onClick={onSubmit} variant="contained" loading={loading}>
          Salvar saldo
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AdjustClassesDialog
