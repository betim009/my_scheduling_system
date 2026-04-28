const { Router } = require('express');

const planController = require('../controllers/planController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

const router = Router();

router.use(authenticate);

router.post('/', authorizeRoles('admin'), planController.createPlan);
router.get('/', planController.listPlans);
router.get('/:id', planController.getPlanById);
router.put('/:id', authorizeRoles('admin'), planController.updatePlan);
router.patch('/:id/toggle-active', authorizeRoles('admin'), planController.togglePlanActive);
router.delete('/:id', authorizeRoles('admin'), planController.deletePlan);

module.exports = router;
