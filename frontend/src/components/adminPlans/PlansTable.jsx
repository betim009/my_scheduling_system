import { Button, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

function PlansTable({ plans, loadingId, onEdit, onDelete }) {
  return (
    <TableContainer component={Paper} sx={{ borderRadius: 1 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Aulas</TableCell>
            <TableCell>Aulas/semana</TableCell>
            <TableCell>Preço</TableCell>
            <TableCell>Preço/aula</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {plans.map((plan) => (
            <TableRow key={plan.id} hover>
              <TableCell>{plan.name}</TableCell>
              <TableCell>{plan.total_classes}</TableCell>
              <TableCell>{plan.classes_per_week}</TableCell>
              <TableCell>{formatCurrency(plan.price)}</TableCell>
              <TableCell>{formatCurrency(plan.price_per_class)}</TableCell>
              <TableCell>
                <Chip
                  label={plan.is_active ? 'Ativo' : 'Inativo'}
                  color={plan.is_active ? 'success' : 'default'}
                  sx={{ fontWeight: 700 }}
                />
              </TableCell>
              <TableCell align="right">
                <Button size="small" onClick={() => onEdit(plan)}>
                  Editar
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => onDelete(plan)}
                  loading={loadingId === plan.id}
                >
                  Excluir
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default PlansTable
