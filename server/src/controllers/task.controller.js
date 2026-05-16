const prisma = require('../config/prisma');

// Helper to check membership
const checkMembership = async (userId, role, projectId) => {
  if (role === 'ADMIN') return true;
  const member = await prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } }
  });
  return !!member;
};

const getProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;

    const tasks = await prisma.task.findMany({
      where: { projectId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { title, description, status, priority, dueDate, tags, assigneeId } = req.body;
    const userId = req.user.userId;

    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        tags: tags || [],
        projectId,
        creatorId: userId,
        assigneeId
      }
    });

    await prisma.activity.create({
      data: {
        action: 'TASK_CREATED',
        entityType: 'TASK',
        entityId: task.id,
        projectId,
        userId
      }
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate, tags, assigneeId } = req.body;
    const userId = req.user.userId;

    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isMember = await checkMembership(userId, req.user.role, existingTask.projectId);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        tags,
        assigneeId
      }
    });

    await prisma.activity.create({
      data: {
        action: 'TASK_UPDATED',
        entityType: 'TASK',
        entityId: task.id,
        projectId: task.projectId,
        userId
      }
    });

    res.json(task);
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const role = req.user.role;

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (role !== 'ADMIN' && task.creatorId !== userId) {
      return res.status(403).json({ message: 'Only an admin or the task creator can delete this task' });
    }

    await prisma.task.delete({ where: { id } });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!content) {
      return res.status(400).json({ message: 'Comment content is required' });
    }

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const isMember = await checkMembership(userId, req.user.role, task.projectId);
    if (!isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId: id,
        authorId: userId
      },
      include: {
        author: { select: { id: true, name: true } }
      }
    });

    await prisma.activity.create({
      data: {
        action: 'COMMENT_ADDED',
        entityType: 'TASK',
        entityId: task.id,
        projectId: task.projectId,
        userId
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProjectTasks,
  createTask,
  updateTask,
  deleteTask,
  addComment
};
