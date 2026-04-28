const { Router } = require('express');

const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

const router = Router();

router.use(authenticate, authorizeRoles('admin'));

router.get('/admin-summary', dashboardController.getAdminSummary);

module.exports = router;
