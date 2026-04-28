import {
  AccessTimeRounded,
  ArrowForwardRounded,
  BlockRounded,
  CalendarMonthRounded,
  CheckCircleRounded,
  EventBusyRounded,
  HourglassTopRounded,
  LockRounded,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import EmptyState from '../common/EmptyState'
import LoadingState from '../common/LoadingState'
import { formatLongDate, normalizeTimeLabel } from '../../utils/calendar'
import SlotStatusChip from '../status/SlotStatusChip'

const statusConfig = {
  available: {
    color: 'success.main',
    label: 'Disponível',
    icon: <CheckCircleRounded color="success" />,
    helperStudent: 'Pode ser solicitado agora.',
    helperPublic: 'Entre na sua conta para solicitar este horário.',
    helperAdmin: 'Slot aberto para novos pedidos.',
  },
  pending: {
    color: 'warning.main',
    label: 'Aguardando confirmação',
    icon: <HourglassTopRounded color="warning" />,
    helperStudent: 'Seu pedido está aguardando retorno.',
    helperPublic: 'Horário aguardando confirmação.',
    helperAdmin: 'Requer acompanhamento operacional.',
  },
  booked: {
    color: 'error.main',
    label: 'Ocupado',
    icon: <LockRounded color="error" />,
    helperStudent: 'Horário já reservado.',
    helperPublic: 'Horário já reservado.',
    helperAdmin: 'Compromisso confirmado na agenda.',
  },
  blocked: {
    color: 'text.secondary',
    label: 'Indisponível',
    icon: <BlockRounded color="disabled" />,
    helperStudent: 'Esse horário não pode receber pedidos.',
    helperPublic: 'Esse horário não pode receber pedidos.',
    helperAdmin: 'Bloqueio manual ou indisponibilidade.',
  },
}

function getSlotHelperCopy({ currentStatus, currentUserRole, isAuthenticated }) {
  if (currentUserRole === 'admin') {
    return currentStatus.helperAdmin
  }

  if (isAuthenticated) {
    return currentStatus.helperStudent
  }

  return currentStatus.helperPublic
}

function DaySlots({
  selectedDateKey,
  slots,
  totalSlots,
  loading,
  errorMessage,
  currentUserRole,
  isAuthenticated,
  statusFilter,
  onRequestSlot,
}) {
  const hasFilter = statusFilter !== 'all'

  return (
    <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 1, minHeight: 320 }}>
      <Stack spacing={2}>
        <BoxHeader
          selectedDateKey={selectedDateKey}
          currentUserRole={currentUserRole}
          visibleCount={slots.length}
          totalCount={totalSlots}
          hasFilter={hasFilter}
        />

        {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

        {loading ? (
          <LoadingState message="Carregando horários do dia..." />
        ) : null}

        {!loading && selectedDateKey && slots.length === 0 ? (
          <EmptyState
            icon={hasFilter ? <EventBusyRounded /> : <CalendarMonthRounded />}
            title={
              hasFilter
                ? 'Nenhum slot corresponde ao filtro aplicado.'
                : 'Nenhum horário disponível para o dia selecionado.'
            }
            description={
              hasFilter
                ? 'Troque o filtro para visualizar outros status deste dia.'
                : 'Selecione outra data ou avance para o próximo período.'
            }
          />
        ) : null}

        {!loading && !selectedDateKey ? (
          <EmptyState
            icon={<CalendarMonthRounded />}
            title="Selecione um dia no calendário."
            description="O painel exibirá horários, status e ações disponíveis para a data escolhida."
          />
        ) : null}

        {!loading && selectedDateKey && slots.length > 0 ? (
          <Stack spacing={1.25}>
            {slots.map((slot) => {
              const currentStatus = statusConfig[slot.status] || statusConfig.blocked
              const helperCopy = getSlotHelperCopy({
                currentStatus,
                currentUserRole,
                isAuthenticated,
              })

              return (
                <Box
                  key={slot.id || `${slot.slot_date}-${slot.start_time}`}
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Stack spacing={1.5}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.5}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Stack
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                          }}
                        >
                          <AccessTimeRounded color="primary" />
                        </Stack>
                        <Stack spacing={0.25}>
                          <Typography variant="subtitle1" fontWeight={800}>
                            {normalizeTimeLabel(slot.start_time)} - {normalizeTimeLabel(slot.end_time)}
                          </Typography>
                          <Typography color="text.secondary">{helperCopy}</Typography>
                        </Stack>
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        {currentStatus.icon}
                        <SlotStatusChip status={slot.status} />
                      </Stack>
                    </Stack>

                    <Divider />

                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1.25}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                    >
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={`Início ${normalizeTimeLabel(slot.start_time)}`}
                          size="small"
                          variant="outlined"
                        />
                        <Chip
                          label={`Fim ${normalizeTimeLabel(slot.end_time)}`}
                          size="small"
                          variant="outlined"
                        />
                        <Typography variant="body2" color={currentStatus.color} sx={{ fontWeight: 700 }}>
                          {currentStatus.label}
                        </Typography>
                      </Stack>

                      {slot.status === 'available' && (currentUserRole === 'student' || !isAuthenticated) ? (
                        <Button
                          variant="contained"
                          size="small"
                          endIcon={<ArrowForwardRounded />}
                          onClick={() => onRequestSlot(slot)}
                        >
                          {isAuthenticated ? 'Solicitar horário' : 'Entrar para solicitar'}
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          {currentUserRole === 'admin'
                            ? 'Leitura operacional'
                            : 'Sem ação disponível'}
                        </Typography>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              )
            })}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  )
}

function BoxHeader({ selectedDateKey, currentUserRole, visibleCount, totalCount, hasFilter }) {
  return (
    <Stack spacing={0.5}>
      <Typography variant="h5">Horários do dia</Typography>
      <Typography color="text.secondary">
        {selectedDateKey ? formatLongDate(selectedDateKey) : 'Nenhuma data selecionada'}
      </Typography>
      {selectedDateKey ? (
        <Typography variant="body2" color="text.secondary">
          {hasFilter
            ? `Exibindo ${visibleCount} de ${totalCount} slot${totalCount > 1 ? 's' : ''} para o filtro atual.`
            : `${totalCount} slot${totalCount > 1 ? 's' : ''} encontrado${totalCount > 1 ? 's' : ''}. ${
                currentUserRole === 'admin'
                  ? 'Acompanhe rapidamente o estado operacional do dia.'
                  : 'Escolha o melhor horário disponível para solicitar.'
              }`}
        </Typography>
      ) : null}
    </Stack>
  )
}

export default DaySlots
