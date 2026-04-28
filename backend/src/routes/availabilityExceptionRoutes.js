const { Router } = require('express');

const availabilityExceptionController = require('../controllers/availabilityExceptionController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

const router = Router();

router.use(authenticate, authorizeRoles('admin'));

router.post('/', availabilityExceptionController.createException);
router.get('/', availabilityExceptionController.listExceptions);
router.get('/:id', availabilityExceptionController.getExceptionById);
router.put('/:id', availabilityExceptionController.updateException);
router.delete('/:id', availabilityExceptionController.deleteException);

module.exports = router;
