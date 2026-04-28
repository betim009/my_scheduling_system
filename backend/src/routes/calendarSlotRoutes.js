const { Router } = require('express');

const calendarSlotController = require('../controllers/calendarSlotController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

const router = Router();

router.use(authenticate);

router.post('/generate', authorizeRoles('admin'), calendarSlotController.generateSlots);
router.get('/day', calendarSlotController.listSlotsByDay);
router.get('/', calendarSlotController.listSlotsByMonth);

module.exports = router;
