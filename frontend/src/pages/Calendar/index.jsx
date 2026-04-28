import { CalendarMonthRounded, ViewWeekRounded } from '@mui/icons-material'
import { Alert, Box, Button, Grid, Stack } from '@mui/material'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppSnackbar from '../../components/common/AppSnackbar'
import EmptyState from '../../components/common/EmptyState'
import useAuth from '../../hooks/useAuth'
import CalendarControls from '../../components/calendar/CalendarControls'
import CalendarGrid from '../../components/calendar/CalendarGrid'
import DaySlots from '../../components/calendar/DaySlots'
import RequestBookingDialog from '../../components/calendar/RequestBookingDialog'
import WeeklyCalendarView from '../../components/calendar/WeeklyCalendarView'
import { createBookingRequest } from '../../services/bookingRequestService'
import {
  fetchCalendarDay,
  fetchCalendarMonth,
  fetchPublicCalendarDay,
  fetchPublicCalendarMonth,
} from '../../services/calendarService'
import { fetchPublicSystemSettings } from '../../services/publicSystemSettingsService'
import {
  addMonths,
  filterSlotsByStatus,
  formatDateKey,
  getMonthKey,
  getMonthStart,
  getStatusSummary,
  groupSlotsByDate,
} from '../../utils/calendar'

function getConfiguredTeacherId(currentUser) {
  const configuredTeacherId = Number(import.meta.env.VITE_CALENDAR_USER_ID)

  if (Number.isInteger(configuredTeacherId) && configuredTeacherId > 0) {
    return configuredTeacherId
  }

  if (currentUser?.role === 'admin') {
    return currentUser.id
  }

  return null
}

function getApiMessage(error, fallbackMessage) {
  return error?.response?.data?.message || fallbackMessage
}

function CalendarPage() {
  const navigate = useNavigate()
  const redirectTimeoutRef = useRef(null)
  const { user, isAuthenticated } = useAuth()
  const teacherId = useMemo(() => getConfiguredTeacherId(user), [user])
  const [currentMonthDate, setCurrentMonthDate] = useState(() => getMonthStart(new Date()))
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [monthCache, setMonthCache] = useState({})
  const [dayCache, setDayCache] = useState({})
  const [monthLoading, setMonthLoading] = useState(false)
  const [dayLoading, setDayLoading] = useState(false)
  const [monthError, setMonthError] = useState('')
  const [dayError, setDayError] = useState('')
  const [requestDialogOpen, setRequestDialogOpen] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [studentMessage, setStudentMessage] = useState('')
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestError, setRequestError] = useState('')
  const [viewMode, setViewMode] = useState('week')
  const [statusFilter, setStatusFilter] = useState('all')
  const [publicSettings, setPublicSettings] = useState({})
  const [snackbarState, setSnackbarState] = useState({
    open: false,
    severity: 'success',
    message: '',
  })

  const currentMonthKey = getMonthKey(currentMonthDate)
  const canLoadCalendar = true
  const selectedDateKey = selectedDate ? formatDateKey(selectedDate) : ''
  const monthSlots = useMemo(() => monthCache[currentMonthKey] || [], [monthCache, currentMonthKey])
  const slotsByDate = useMemo(() => groupSlotsByDate(monthSlots), [monthSlots])
  const fallbackDaySlots = useMemo(
    () => (selectedDateKey ? slotsByDate.get(selectedDateKey) || [] : []),
    [selectedDateKey, slotsByDate]
  )
  const hasDayCacheEntry = selectedDateKey
    ? Object.prototype.hasOwnProperty.call(dayCache, selectedDateKey)
    : false
  const selectedDaySlots = useMemo(() => {
    if (!selectedDateKey) {
      return []
    }

    return hasDayCacheEntry ? dayCache[selectedDateKey] : fallbackDaySlots
  }, [dayCache, fallbackDaySlots, hasDayCacheEntry, selectedDateKey])
  const filteredMonthSlots = useMemo(
    () => filterSlotsByStatus(monthSlots, statusFilter),
    [monthSlots, statusFilter]
  )
  const filteredSlotsByDate = useMemo(() => groupSlotsByDate(filteredMonthSlots), [filteredMonthSlots])
  const filteredSelectedDaySlots = useMemo(
    () => filterSlotsByStatus(selectedDaySlots, statusFilter),
    [selectedDaySlots, statusFilter]
  )
  const monthSummary = useMemo(() => {
    const summary = getStatusSummary(monthSlots)

    return {
      ...summary,
      total: monthSlots.length,
    }
  }, [monthSlots])

  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    let ignore = false

    async function loadPublicSettings() {
      try {
        const data = await fetchPublicSystemSettings()

        if (!ignore) {
          setPublicSettings(data)
        }
      } catch {
        if (!ignore) {
          setPublicSettings({})
        }
      }
    }

    loadPublicSettings()

    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    if (!canLoadCalendar || monthCache[currentMonthKey]) {
      return
    }

    let ignore = false

    async function loadMonth() {
      setMonthLoading(true)
      setMonthError('')

      try {
        const fetchMonth = isAuthenticated ? fetchCalendarMonth : fetchPublicCalendarMonth
        const data = await fetchMonth({
          userId: teacherId,
          month: currentMonthKey,
        })

        if (!ignore) {
          setMonthCache((current) => ({
            ...current,
            [currentMonthKey]: data.slots || [],
          }))
        }
      } catch (error) {
        if (!ignore) {
          setMonthError(getApiMessage(error, 'Não foi possível carregar os slots do mês.'))
        }
      } finally {
        if (!ignore) {
          setMonthLoading(false)
        }
      }
    }

    loadMonth()

    return () => {
      ignore = true
    }
  }, [canLoadCalendar, isAuthenticated, teacherId, currentMonthKey, monthCache])

  useEffect(() => {
    if (!canLoadCalendar || !selectedDateKey || dayCache[selectedDateKey]) {
      return
    }

    let ignore = false

    async function loadDay() {
      setDayLoading(true)
      setDayError('')

      try {
        const fetchDay = isAuthenticated ? fetchCalendarDay : fetchPublicCalendarDay
        const data = await fetchDay({
          userId: teacherId,
          date: selectedDateKey,
        })

        if (!ignore) {
          setDayCache((current) => ({
            ...current,
            [selectedDateKey]: data.slots || [],
          }))
        }
      } catch (error) {
        if (!ignore) {
          setDayError(getApiMessage(error, 'Não foi possível carregar os slots do dia.'))
        }
      } finally {
        if (!ignore) {
          setDayLoading(false)
        }
      }
    }

    loadDay()

    return () => {
      ignore = true
    }
  }, [canLoadCalendar, isAuthenticated, teacherId, selectedDateKey, dayCache])

  function handlePreviousMonth() {
    const nextMonthDate = addMonths(currentMonthDate, -1)
    setCurrentMonthDate(nextMonthDate)
    setSelectedDate(getMonthStart(nextMonthDate))
  }

  function handleNextMonth() {
    const nextMonthDate = addMonths(currentMonthDate, 1)
    setCurrentMonthDate(nextMonthDate)
    setSelectedDate(getMonthStart(nextMonthDate))
  }

  function handleCurrentMonth() {
    const today = new Date()
    setCurrentMonthDate(getMonthStart(today))
    setSelectedDate(today)
  }

  function handleMonthSelect(month) {
    const nextDate = new Date(currentMonthDate.getFullYear(), month, 1)
    setCurrentMonthDate(nextDate)
    setSelectedDate(nextDate)
  }

  function handleYearSelect(year) {
    const nextDate = new Date(year, currentMonthDate.getMonth(), 1)
    setCurrentMonthDate(nextDate)
    setSelectedDate(nextDate)
  }

  function handleSelectDate(date) {
    setSelectedDate(date)

    if (getMonthKey(date) !== currentMonthKey) {
      setCurrentMonthDate(getMonthStart(date))
    }
  }

  function handleOpenRequestDialog(slot) {
    if (slot.status !== 'available') {
      return
    }

    if (!isAuthenticated) {
      showSnackbar(
        'info',
        'Você pode visualizar a agenda sem login. Para solicitar um horário, entre na sua conta ou crie um cadastro.'
      )

      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }

      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate('/login?redirect=/calendar', {
          state: { from: { pathname: '/calendar' } },
        })
      }, 500)
      return
    }

    if (user?.role !== 'student') {
      return
    }

    setSelectedSlot(slot)
    setStudentMessage('')
    setRequestError('')
    setRequestDialogOpen(true)
  }

  function handleCloseRequestDialog() {
    if (requestLoading) {
      return
    }

    setRequestDialogOpen(false)
    setSelectedSlot(null)
    setStudentMessage('')
    setRequestError('')
  }

  function showSnackbar(severity, message) {
    setSnackbarState({
      open: true,
      severity,
      message,
    })
  }

  function handleRetryMonth() {
    setMonthError('')
    setMonthCache((current) => {
      const next = { ...current }
      delete next[currentMonthKey]
      return next
    })
  }

  function handleRetryDay() {
    if (!selectedDateKey) {
      return
    }

    setDayError('')
    setDayCache((current) => {
      const next = { ...current }
      delete next[selectedDateKey]
      return next
    })
  }

  function updateSlotToPending(slot) {
    const nextSlot = {
      ...slot,
      status: 'pending',
    }

    setMonthCache((current) => ({
      ...current,
      [currentMonthKey]: (current[currentMonthKey] || []).map((monthSlot) =>
        monthSlot.slot_date === slot.slot_date &&
        monthSlot.start_time === slot.start_time &&
        monthSlot.end_time === slot.end_time
          ? nextSlot
          : monthSlot
      ),
    }))

    setDayCache((current) => ({
      ...current,
      [slot.slot_date]: (current[slot.slot_date] || fallbackDaySlots).map((daySlot) =>
        daySlot.slot_date === slot.slot_date &&
        daySlot.start_time === slot.start_time &&
        daySlot.end_time === slot.end_time
          ? nextSlot
          : daySlot
      ),
    }))
  }

  async function handleConfirmRequest() {
    const requestTeacherId = selectedSlot?.user_id || teacherId

    if (!selectedSlot || !requestTeacherId) {
      return
    }

    setRequestLoading(true)
    setRequestError('')

    try {
      const { bookingRequest } = await createBookingRequest({
        teacher_id: requestTeacherId,
        requested_date: selectedSlot.slot_date,
        start_time: selectedSlot.start_time,
        end_time: selectedSlot.end_time,
        student_message: studentMessage.trim() || undefined,
      })

      updateSlotToPending(selectedSlot)
      handleCloseRequestDialog()
      showSnackbar(
        'success',
        bookingRequest?.notification_message
          ? 'Solicitação enviada com sucesso e notificação preparada para o professor principal.'
          : 'Solicitação enviada com sucesso. O slot agora está pendente.'
      )
    } catch (error) {
      const message = getApiMessage(
        error,
        'Não foi possível enviar a solicitação para este horário.'
      )

      setRequestError(message)
      showSnackbar('error', message)
    } finally {
      setRequestLoading(false)
    }
  }

  return (
    <Stack spacing={3}>
      {!isAuthenticated ? (
        <Alert severity="info">
          Você pode visualizar a agenda sem login. Para solicitar um horário, entre na sua conta ou crie um cadastro.
        </Alert>
      ) : null}

      {publicSettings.allow_same_day_booking === false ? (
        <Alert severity="info">
          Solicitações para o mesmo dia estão desativadas nas configurações do sistema.
        </Alert>
      ) : null}

      <CalendarControls
        currentMonthDate={currentMonthDate}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onCurrentMonth={handleCurrentMonth}
        onMonthChange={handleMonthSelect}
        onYearChange={handleYearSelect}
        teacherId={teacherId}
        teacherName={publicSettings.main_teacher_name}
        currentUserRole={user?.role}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        monthSummary={monthSummary}
      />

      {monthError ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={handleRetryMonth}>
              Tentar novamente
            </Button>
          }
        >
          {monthError}
        </Alert>
      ) : null}
      {!monthLoading && !monthError && canLoadCalendar && monthSlots.length === 0 ? (
        <EmptyState
          icon={<CalendarMonthRounded />}
          title="Nenhum slot encontrado neste mês."
          description="Gere a agenda no painel administrativo ou revise as regras e exceções cadastradas."
        />
      ) : null}
      {!monthLoading && !monthError && monthSlots.length > 0 && filteredMonthSlots.length === 0 ? (
        <EmptyState
          icon={<ViewWeekRounded />}
          title="Nenhum slot corresponde ao filtro no período."
          description="Troque o filtro para visualizar outros status do calendário."
        />
      ) : null}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, xl: 8 }}>
          <Box sx={{ opacity: monthLoading ? 0.72 : 1, transition: 'opacity 0.2s ease' }}>
            {viewMode === 'month' ? (
              <CalendarGrid
                currentMonthDate={currentMonthDate}
                selectedDate={selectedDate}
                slotsByDate={filteredSlotsByDate}
                currentUserRole={user?.role}
                onSelectDate={handleSelectDate}
              />
            ) : (
              <WeeklyCalendarView
                referenceDate={selectedDate || currentMonthDate}
                selectedDate={selectedDate}
                slotsByDate={filteredSlotsByDate}
                currentUserRole={user?.role}
                onSelectDate={handleSelectDate}
              />
            )}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, xl: 4 }}>
          <DaySlots
            selectedDateKey={selectedDateKey}
            slots={filteredSelectedDaySlots}
            totalSlots={selectedDaySlots.length}
            loading={dayLoading}
            errorMessage={dayError}
            currentUserRole={user?.role}
            isAuthenticated={isAuthenticated}
            statusFilter={statusFilter}
            onRequestSlot={handleOpenRequestDialog}
          />
        </Grid>
      </Grid>

      {dayError && selectedDateKey ? (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={handleRetryDay}>
              Recarregar dia
            </Button>
          }
        >
          Não foi possível atualizar os detalhes do dia selecionado.
        </Alert>
      ) : null}

      <RequestBookingDialog
        open={requestDialogOpen}
        slot={selectedSlot}
        loading={requestLoading}
        message={studentMessage}
        errorMessage={requestError}
        onChangeMessage={setStudentMessage}
        onClose={handleCloseRequestDialog}
        onConfirm={handleConfirmRequest}
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

export default CalendarPage
