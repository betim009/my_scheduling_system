import {
  CalendarTodayRounded,
  ChevronLeftRounded,
  ChevronRightRounded,
  TodayRounded,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Chip,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
  alpha,
} from '@mui/material'
import { formatMonthLabel } from '../../utils/calendar'

const monthOptions = Array.from({ length: 12 }, (_, monthIndex) => ({
  value: monthIndex,
  label: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(
    new Date(2026, monthIndex, 1)
  ),
}))

function CalendarHeader({
  currentMonthDate,
  onPreviousMonth,
  onNextMonth,
  onCurrentMonth,
  onMonthChange,
  onYearChange,
  teacherId,
  teacherName,
  currentUserRole,
}) {
  const yearOptions = Array.from({ length: 7 }, (_, index) => currentMonthDate.getFullYear() - 3 + index)

  return (
    <Paper
      sx={{
        p: { xs: 2, md: 2.5 },
        borderRadius: 1,
        border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
      }}
    >
      <Stack
        direction={{ xs: 'column', xl: 'row' }}
        spacing={2}
        alignItems={{ xs: 'flex-start', xl: 'center' }}
        justifyContent="space-between"
      >
        <Stack spacing={0.75}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <CalendarTodayRounded color="primary" />
            <Typography variant="h4" sx={{ textTransform: 'capitalize' }}>
              {formatMonthLabel(currentMonthDate)}
            </Typography>
          </Stack>
          <Typography color="text.secondary">
            Navegue pelos períodos, altere mês e ano rapidamente e acompanhe a agenda de forma mais clara.
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={currentUserRole === 'admin' ? 'Modo admin' : 'Modo student'}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
            <Chip
              label={
                teacherName
                  ? `${teacherName} · user_id ${teacherId ?? 'não configurado'}`
                  : `Professor user_id: ${teacherId ?? 'não configurado'}`
              }
              color="secondary"
              sx={{ fontWeight: 700 }}
            />
          </Stack>
        </Stack>

        <Stack spacing={1.25} alignItems={{ xs: 'stretch', xl: 'flex-end' }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Button variant="outlined" startIcon={<TodayRounded />} onClick={onCurrentMonth}>
              Hoje
            </Button>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <IconButton
                color="primary"
                onClick={onPreviousMonth}
                size="small"
                aria-label="Mês anterior"
              >
                <ChevronLeftRounded />
              </IconButton>

              <Typography
                variant="subtitle1"
                fontWeight={800}
                sx={{ minWidth: 132, textAlign: 'center', textTransform: 'capitalize' }}
              >
                {formatMonthLabel(currentMonthDate)}
              </Typography>

              <IconButton
                color="primary"
                onClick={onNextMonth}
                size="small"
                aria-label="Próximo mês"
              >
                <ChevronRightRounded />
              </IconButton>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Select
              size="small"
              value={currentMonthDate.getMonth()}
              onChange={(event) => onMonthChange(Number(event.target.value))}
              sx={{ minWidth: 160, textTransform: 'capitalize' }}
            >
              {monthOptions.map((option) => (
                <MenuItem key={option.value} value={option.value} sx={{ textTransform: 'capitalize' }}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            <Select
              size="small"
              value={currentMonthDate.getFullYear()}
              onChange={(event) => onYearChange(Number(event.target.value))}
              sx={{ minWidth: 110 }}
            >
              {yearOptions.map((year) => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </Stack>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default CalendarHeader
