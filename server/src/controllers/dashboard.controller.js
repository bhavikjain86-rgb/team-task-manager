const prisma = require('../config/prisma');

const getStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // User's projects
    const totalProjects = await prisma.project.count({
      where: {
        members: { some: { userId } }
      }
    });

    // User's tasks
    const myTasks = await prisma.task.count({
      where: { assigneeId: userId }
    });

    // Completed today
    const completedToday = await prisma.task.count({
      where: {
        assigneeId: userId,
        status: 'DONE',
        updatedAt: { gte: startOfToday }
      }
    });

    // Overdue count
    const overdueCount = await prisma.task.count({
      where: {
        assigneeId: userId,
        status: { not: 'DONE' },
        dueDate: { lt: now }
      }
    });

    // Tasks by status
    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      where: { assigneeId: userId },
      _count: { status: true }
    });

    const statusBreakdown = tasksByStatus.reduce((acc, curr) => {
      acc[curr.status] = curr._count.status;
      return acc;
    }, { TODO: 0, IN_PROGRESS: 0, DONE: 0 });

    res.json({
      totalProjects,
      myTasks,
      completedToday,
      overdueCount,
      tasksByStatus: statusBreakdown
    });
  } catch (error) {
    next(error);
  }
};

const getActivity = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const activities = await prisma.activity.findMany({
      where: {
        project: {
          members: { some: { userId } }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      }
    });

    res.json(activities);
  } catch (error) {
    next(error);
  }
};

const getOverdueTasks = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const now = new Date();

    const overdueTasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        status: { not: 'DONE' },
        dueDate: { lt: now }
      },
      include: {
        project: { select: { id: true, name: true } }
      },
      orderBy: { dueDate: 'asc' }
    });

    res.json(overdueTasks);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getActivity,
  getOverdueTasks
};
