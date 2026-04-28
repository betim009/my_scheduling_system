const { Router } = require('express');

const calendarSlotController = require('../controllers/calendarSlotController');

const router = Router();

router.get('/calendar-slots/day', calendarSlotController.listPublicSlotsByDay);
router.get('/calendar-slots', calendarSlotController.listPublicSlotsByMonth);

module.exports = router;
