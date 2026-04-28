const { Router } = require('express');

const systemSettingController = require('../controllers/systemSettingController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

const router = Router();

router.get('/public', systemSettingController.listPublicSettings);

router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/', systemSettingController.listSettings);
router.put('/', systemSettingController.updateManySettings);
router.get('/:key', systemSettingController.getSettingByKey);
router.put('/:key', systemSettingController.updateSetting);

module.exports = router;
