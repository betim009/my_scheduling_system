import {
  CalendarViewMonthRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  FilterAltRounded,
  TodayRounded,
  ViewWeekRounded,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  alpha,
} from '@mui/material'
import { formatMonthLabel } from '../../utils/calendar'
import SlotStatusChip from '../status/SlotStatusChip'

const monthOptions = Array.from({ length: 12 }, (_, monthIndex) => ({
  value: monthIndex,
  label: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
    new Date(2026, monthIndex, 1)
  ),
}))

const filterOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'available', label: 'Disponíveis' },
  { value: 'pending', label: 'Pendentes' },
  { value: 'booked', label: 'Reservados' },
  { value: 'blocked', label: 'Bloqueados' },
]

function CalendarControls({
  currentMonthDate,
  onPreviousMonth,
  onNextMonth,
  onCurrentMonth,
  onMonthChange,
  onYearChange,
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  monthSummary,
}) {
  const yearOptions = Array.from(
    { length: 7 },
    (_, index) => currentMonthDate.getFullYear() - 3 + index
  )

  return (
    <Paper
      sx={{
        p: { xs: 1.5, md: 2 },
        borderRadius: 1,
        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.025),
      }}
    >
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={{ xs: 2, md: 2.5 }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', md: 'center' }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Button
            variant="outlined"
            startIcon={<TodayRounded />}
            onClick={onCurrentMonth}
            sx={{ flexShrink: 0 }}
          >
            Hoje
          </Button>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              width: { xs: '100%', sm: 'auto' },
              px: 0.5,
              py: 0.5,
              borderRadius: 1,
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
              bgcolor: 'background.paper',
            }}
          >
            <IconButton
              color="primary"
              onClick={onPreviousMonth}
              size="small"
              aria-label="Mês anterior"
              sx={{
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <ChevronLeftRounded />
            </IconButton>

            <Typography
              variant="subtitle1"
              fontWeight={800}
              sx={{
                flex: 1,
                minWidth: { xs: 0, sm: 140 },
                textAlign: 'center',
                textTransform: 'capitalize',
                whiteSpace: 'nowrap',
              }}
            >
              {formatMonthLabel(currentMonthDate)}
            </Typography>

            <IconButton
              color="primary"
              onClick={onNextMonth}
              size="small"
              aria-label="Próximo mês"
              sx={{
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <ChevronRightRounded />
            </IconButton>
          </Box>

          <Stack direction="row" spacing={1} sx={{ minWidth: 0 }}>
            <Select
              size="small"
              value={currentMonthDate.getMonth()}
              onChange={(event) => onMonthChange(Number(event.target.value))}
              sx={{
                minWidth: { xs: 0, sm: 148 },
                flex: { xs: 1, sm: 'initial' },
                textTransform: 'capitalize',
                bgcolor: 'background.paper',
              }}
            >
              {monthOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <Select
              size="small"
              value={currentMonthDate.getFullYear()}
              onChange={(event) => onYearChange(Number(event.target.value))}
              sx={{
                minWidth: 96,
                bgcolor: 'background.paper',
              }}
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Stack>

        <Divider
          orientation="vertical"
          flexItem
          sx={{ display: { xs: 'none', md: 'block' } }}
        />

        <Stack
          spacing={1.25}
          alignItems={{ xs: 'stretch', md: 'flex-end' }}
          sx={{ width: { xs: '100%', md: 'auto' }, minWidth: { md: 390 } }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <FilterAltRounded color="primary" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={800}>
                Filtros
              </Typography>
            </Stack>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, nextValue) => {
                if (nextValue) {
                  onViewModeChange(nextValue)
                }
              }}
              size="small"
              sx={{
                bgcolor: 'background.paper',
                '& .MuiToggleButton-root': {
                  px: 1.5,
                },
              }}
            >
              <ToggleButton value="month">
                <CalendarViewMonthRounded fontSize="small" sx={{ mr: 0.75 }} />
                Mês
              </ToggleButton>
              <ToggleButton value="week">
                <ViewWeekRounded fontSize="small" sx={{ mr: 0.75 }} />
                Semana
              </ToggleButton>
            </ToggleButtonGroup>
          </Stack>

          <ToggleButtonGroup
            value={statusFilter}
            exclusive
            onChange={(_, nextValue) => {
              if (nextValue) {
                onStatusFilterChange(nextValue)
              }
            }}
            size="small"
            sx={{
              flexWrap: 'wrap',
              justifyContent: { xs: 'flex-start', md: 'flex-end' },
              bgcolor: 'background.paper',
              '& .MuiToggleButton-root': {
                px: 1.35,
              },
            }}
          >
            {filterOptions.map((option) => (
              <ToggleButton key={option.value} value={option.value}>
                {option.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
            sx={{
              pt: 0.5,
              color: 'text.secondary',
            }}
          >
            <StatusMetric label="Total" value={monthSummary.total} />
            <StatusMetric
              label="Disponíveis"
              value={monthSummary.available}
              status="available"
            />
            <StatusMetric label="Pendentes" value={monthSummary.pending} status="pending" />
            <StatusMetric label="Reservados" value={monthSummary.booked} status="booked" />
            <StatusMetric label="Bloqueados" value={monthSummary.blocked} status="blocked" />
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}

function StatusMetric({ label, value, status }) {
  if (!value && status) {
    return null
  }

  return (
    <Stack
      direction="row"
      spacing={0.75}
      alignItems="center"
      sx={{
        px: 1,
        py: 0.5,
        borderRadius: 1,
        bgcolor: (theme) => alpha(theme.palette.common.white, 0.72),
        border: (theme) => `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
      }}
    >
      {status ? <SlotStatusChip status={status} /> : null}
      <Typography variant="body2" color="text.secondary">
        {label}: <strong>{value}</strong>
      </Typography>
    </Stack>
  )
}

export default CalendarControls
