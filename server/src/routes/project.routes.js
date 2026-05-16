const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin, requireProjectMember } = require('../middleware/rbac.middleware');

router.use(authenticate);

// List projects where user is a member
router.get('/', projectController.getProjects);

// Admin only routes
router.post('/', requireAdmin, projectController.createProject);

// Project specific routes
router.get('/:id', requireProjectMember, projectController.getProjectById);
router.patch('/:id', requireAdmin, projectController.updateProject);
router.delete('/:id', requireAdmin, projectController.deleteProject);

// Project Member management
router.post('/:id/members', requireAdmin, projectController.addMember);
router.delete('/:id/members/:uid', requireAdmin, projectController.removeMember);

module.exports = router;
