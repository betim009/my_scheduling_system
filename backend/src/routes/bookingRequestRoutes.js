const { Router } = require('express');

const bookingRequestController = require('../controllers/bookingRequestController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

const router = Router();

router.use(authenticate);

router.post('/', authorizeRoles('student'), bookingRequestController.createBookingRequest);
router.get('/my', authorizeRoles('student'), bookingRequestController.listMyBookingRequests);
router.get('/', authorizeRoles('admin'), bookingRequestController.listBookingRequests);
router.patch(
  '/:id/approve',
  authorizeRoles('admin'),
  bookingRequestController.approveBookingRequest
);
router.patch(
  '/:id/reject',
  authorizeRoles('admin'),
  bookingRequestController.rejectBookingRequest
);
router.patch(
  '/:id/cancel',
  authorizeRoles('student'),
  bookingRequestController.cancelBookingRequest
);
router.get('/:id', bookingRequestController.getBookingRequestById);

module.exports = router;
