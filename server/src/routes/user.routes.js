const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/rbac.middleware');

router.use(authenticate);

router.get('/', requireAdmin, userController.getUsers);
router.patch('/:id', userController.updateUser);

module.exports = router;
