const { Router } = require('express');

const authRoutes = require('./authRoutes');
const availabilityExceptionRoutes = require('./availabilityExceptionRoutes');
const availabilityRuleRoutes = require('./availabilityRuleRoutes');
const bookingRequestRoutes = require('./bookingRequestRoutes');
const bookingRoutes = require('./bookingRoutes');
const calendarSlotRoutes = require('./calendarSlotRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const planRoutes = require('./planRoutes');
const planRequestRoutes = require('./planRequestRoutes');
const subscriptionRoutes = require('./subscriptionRoutes');
const systemSettingRoutes = require('./systemSettingRoutes');
const userRoutes = require('./userRoutes');
const publicRoutes = require('./publicRoutes');

const router = Router();

router.get('/', (_request, response) => {
  response.status(200).send('API running');
});

router.get('/health', (_request, response) => {
  response.status(200).json({
    success: true,
    message: 'API running',
  });
});

router.use('/auth', authRoutes);
router.use('/public', publicRoutes);
router.use('/availability-rules', availabilityRuleRoutes);
router.use('/availability-exceptions', availabilityExceptionRoutes);
router.use('/calendar-slots', calendarSlotRoutes);
router.use('/booking-requests', bookingRequestRoutes);
router.use('/bookings', bookingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/plans', planRoutes);
router.use('/plan-requests', planRequestRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/system-settings', systemSettingRoutes);
router.use('/users', userRoutes);

module.exports = router;
