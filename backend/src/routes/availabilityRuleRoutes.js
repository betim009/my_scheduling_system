const { Router } = require('express');

const availabilityRuleController = require('../controllers/availabilityRuleController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

const router = Router();

router.use(authenticate, authorizeRoles('admin'));

router.post('/', availabilityRuleController.createRule);
router.get('/', availabilityRuleController.listRules);
router.get('/:id', availabilityRuleController.getRuleById);
router.put('/:id', availabilityRuleController.updateRule);
router.delete('/:id', availabilityRuleController.deleteRule);

module.exports = router;
