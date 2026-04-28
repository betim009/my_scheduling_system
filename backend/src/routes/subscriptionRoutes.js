const { Router } = require('express');

const subscriptionController = require('../controllers/subscriptionController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

const router = Router();

router.use(authenticate);

router.post('/', authorizeRoles('admin'), subscriptionController.createSubscription);
router.get('/my/summary', authorizeRoles('student'), subscriptionController.getMySubscriptionsSummary);
router.get('/my', authorizeRoles('student'), subscriptionController.listMySubscriptions);
router.get('/', authorizeRoles('admin'), subscriptionController.listSubscriptions);
router.get('/:id', subscriptionController.getSubscriptionById);
router.put('/:id', authorizeRoles('admin'), subscriptionController.updateSubscription);
router.patch('/:id/status', authorizeRoles('admin'), subscriptionController.updateSubscriptionStatus);
router.patch(
  '/:id/remaining-classes',
  authorizeRoles('admin'),
  subscriptionController.updateRemainingClasses
);

module.exports = router;
