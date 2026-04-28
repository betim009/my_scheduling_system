const { Router } = require('express');

const bookingController = require('../controllers/bookingController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

const router = Router();

router.use(authenticate);

router.get('/my', authorizeRoles('student'), bookingController.listMyBookings);
router.get('/', authorizeRoles('admin'), bookingController.listBookings);
router.patch('/:id/cancel', authorizeRoles('admin'), bookingController.cancelBooking);
router.patch(
  '/:id/reschedule',
  authorizeRoles('admin'),
  bookingController.rescheduleBooking
);
router.get('/:id', bookingController.getBookingById);

module.exports = router;
