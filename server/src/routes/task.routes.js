const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireProjectMember } = require('../middleware/rbac.middleware');

router.use(authenticate);

// Project specific task routes
router.get('/project/:projectId', requireProjectMember, taskController.getProjectTasks);
router.post('/project/:projectId', requireProjectMember, taskController.createTask);

// Task specific routes (middleware applied in controller or custom)
router.patch('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/:id/comments', taskController.addComment);

module.exports = router;
