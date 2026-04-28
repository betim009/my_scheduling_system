const apiWeekdayOptions = [
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
  { value: 7, label: 'Domingo' },
]

const exceptionTypeOptions = [
  { value: 'block_full_day', label: 'Bloquear dia inteiro' },
  { value: 'block_time_range', label: 'Bloquear faixa de horário' },
  { value: 'extra_time_range', label: 'Adicionar faixa extra' },
  { value: 'custom_time_range', label: 'Faixa personalizada' },
]

function getWeekdayLabel(weekday) {
  return apiWeekdayOptions.find((option) => option.value === Number(weekday))?.label || '-'
}

function getExceptionTypeLabel(type) {
  return exceptionTypeOptions.find((option) => option.value === type)?.label || type
}

function normalizeTimeForInput(value) {
  return String(value || '').slice(0, 5)
}

export {
  apiWeekdayOptions,
  exceptionTypeOptions,
  getExceptionTypeLabel,
  getWeekdayLabel,
  normalizeTimeForInput,
}
