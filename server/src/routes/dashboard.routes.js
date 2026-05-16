const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/activity', dashboardController.getActivity);
router.get('/overdue', dashboardController.getOverdueTasks);
router.get('/chart', dashboardController.getChartData);
router.get('/advanced', dashboardController.getAdvancedDashboard);

module.exports = router;
