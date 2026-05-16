const prisma = require('../config/prisma');

const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied. Requires admin privileges.' });
  }
  next();
};

const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.params.id || req.body.projectId;
    
    if (!projectId) {
      return res.status(400).json({ message: 'Project ID is required to verify membership.' });
    }

    if (req.user.role === 'ADMIN') {
      return next(); // Admins have access to all projects implicitly
    }

    const member = await prisma.projectMember.findUnique({
      where: {
        userId_projectId: {
          userId: req.user.userId,
          projectId: projectId
        }
      }
    });

    if (!member) {
      return res.status(403).json({ message: 'Access denied. You are not a member of this project.' });
    }

    req.projectMember = member; // Attach membership info if needed downstream
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requireAdmin,
  requireProjectMember
};
