const prisma = require('../config/prisma');

const getProjects = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: { tasks: true }
        }
      }
    });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const { name, description, colorTag, dueDate } = req.body;
    const userId = req.user.userId;

    if (!name) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        colorTag,
        dueDate: dueDate ? new Date(dueDate) : null,
        members: {
          create: {
            userId: userId,
            role: 'ADMIN' // Adding creator as ADMIN member
          }
        },
        activities: {
          create: {
            action: 'PROJECT_CREATED',
            entityType: 'PROJECT',
            userId: userId
          }
        }
      }
    });

    // We also need to update the activity to include the projectId, but it's nested
    await prisma.activity.updateMany({
      where: {
        entityType: 'PROJECT',
        action: 'PROJECT_CREATED',
        userId: userId,
        projectId: null
      },
      data: {
        projectId: project.id,
        entityId: project.id
      }
    });

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

const getProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } }
          }
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true } },
            comments: true
          }
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 50,
          include: {
            user: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, status, dueDate, colorTag } = req.body;

    const project = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        colorTag,
      }
    });

    res.json(project);
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.project.delete({
      where: { id }
    });

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId: id,
        userId,
        role: role || 'MEMBER'
      }
    });

    res.status(201).json(member);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'User is already a member of this project' });
    }
    next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const { id, uid } = req.params;

    await prisma.projectMember.delete({
      where: {
        userId_projectId: {
          userId: uid,
          projectId: id
        }
      }
    });

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  addMember,
  removeMember
};
