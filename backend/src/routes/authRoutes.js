const { Router } = require('express');

const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticate, authController.getMe);
router.get('/admin-only', authenticate, authorizeRoles('admin'), authController.getAdminArea);

module.exports = router;
