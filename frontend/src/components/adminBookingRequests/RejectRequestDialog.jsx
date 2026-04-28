import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

function RejectRequestDialog({
  open,
  request,
  loading,
  message,
  onChangeMessage,
  onClose,
  onConfirm,
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Rejeitar solicitação</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Typography color="text.secondary">
            Você está rejeitando a solicitação de{' '}
            <strong>{request?.student_name || `Aluno #${request?.student_id || '-'}`}</strong>.
          </Typography>

          <TextField
            label="Mensagem para o aluno"
            value={message}
            onChange={(event) => onChangeMessage(event.target.value)}
            multiline
            minRows={3}
            placeholder="Opcional"
            fullWidth
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Voltar
        </Button>
        <Button variant="contained" color="error" onClick={onConfirm} loading={loading}>
          Confirmar rejeição
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RejectRequestDialog
