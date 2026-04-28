const { Router } = require('express');

const planRequestController = require('../controllers/planRequestController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

const router = Router();

router.use(authenticate);

router.post('/', authorizeRoles('student'), planRequestController.createPlanRequest);
router.get('/', planRequestController.listPlanRequests);
router.get('/:id', planRequestController.getPlanRequestById);
router.patch(
  '/:id/approve',
  authorizeRoles('admin'),
  planRequestController.approvePlanRequest
);
router.patch(
  '/:id/reject',
  authorizeRoles('admin'),
  planRequestController.rejectPlanRequest
);

module.exports = router;
