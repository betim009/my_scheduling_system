const systemSettingsCatalog = [
  {
    setting_key: 'main_teacher_name',
    value_type: 'string',
    default_value: 'Alberto',
    section: 'main_teacher',
  },
  {
    setting_key: 'main_teacher_phone',
    value_type: 'string',
    default_value: '5528999082744',
    section: 'main_teacher',
  },
  {
    setting_key: 'main_teacher_email',
    value_type: 'string',
    default_value: '',
    section: 'main_teacher',
  },
  {
    setting_key: 'default_slot_duration_minutes',
    value_type: 'number',
    default_value: 60,
    section: 'default_schedule',
  },
  {
    setting_key: 'default_max_bookings_per_day',
    value_type: 'number',
    default_value: 8,
    section: 'default_schedule',
  },
  {
    setting_key: 'allow_same_day_booking',
    value_type: 'boolean',
    default_value: true,
    section: 'default_schedule',
  },
  {
    setting_key: 'default_weekday_start_time',
    value_type: 'string',
    default_value: '08:00',
    section: 'default_hours',
  },
  {
    setting_key: 'default_weekday_end_time',
    value_type: 'string',
    default_value: '18:00',
    section: 'default_hours',
  },
  {
    setting_key: 'default_excluded_hours',
    value_type: 'json',
    default_value: ['12:00'],
    section: 'default_hours',
  },
  {
    setting_key: 'default_saturday_hours',
    value_type: 'json',
    default_value: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    section: 'default_hours',
  },
  {
    setting_key: 'booking_request_notification_template',
    value_type: 'string',
    default_value:
      'Alberto, você recebeu uma nova solicitação de agendamento do aluno {{student_name}} para {{date}} às {{time}}.',
    section: 'notification_templates',
  },
  {
    setting_key: 'plan_request_notification_template',
    value_type: 'string',
    default_value:
      'Alberto, você recebeu uma nova solicitação de plano do aluno {{student_name}} para o plano {{plan_name}}.',
    section: 'notification_templates',
  },
  {
    setting_key: 'default_subscription_duration_days',
    value_type: 'number',
    default_value: 30,
    section: 'subscriptions',
  },
  {
    setting_key: 'auto_activate_subscription_after_approval',
    value_type: 'boolean',
    default_value: false,
    section: 'subscriptions',
  },
];

const systemSettingsCatalogMap = new Map(
  systemSettingsCatalog.map((setting) => [setting.setting_key, setting])
);

module.exports = {
  systemSettingsCatalog,
  systemSettingsCatalogMap,
};
