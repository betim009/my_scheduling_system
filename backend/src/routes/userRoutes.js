const { Router } = require('express');

const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

const router = Router();

router.use(authenticate);
router.patch('/me', userController.updateCurrentUser);
router.use(authorizeRoles('admin'));
router.get('/', userController.listUsers);

module.exports = router;
