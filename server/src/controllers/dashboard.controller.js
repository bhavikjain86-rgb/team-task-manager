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

const getChartData = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const currentYear = new Date().getFullYear();

    // Get all tasks for the user with a due date in the current year
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: userId,
        dueDate: {
          gte: new Date(currentYear, 0, 1),
          lte: new Date(currentYear, 11, 31)
        }
      },
      select: {
        status: true,
        dueDate: true
      }
    });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = monthNames.map((name, index) => ({
      name,
      val: 0,
      completed: 0
    }));

    tasks.forEach(task => {
      const month = new Date(task.dueDate).getMonth();
      chartData[month].val += 1;
      if (task.status === 'DONE') {
        chartData[month].completed += 1;
      }
    });

    res.json(chartData);
  } catch (error) {
    next(error);
  }
};

const getAdvancedDashboard = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. KPI Cards with Sparklines (last 7 days)
    const getSparkline = async (model, where = {}) => {
      const history = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0,0,0,0);
        const nextD = new Date(d);
        nextD.setDate(d.getDate() + 1);
        
        const count = await prisma[model].count({
          where: { 
            ...where,
            createdAt: { gte: d, lt: nextD }
          }
        });
        history.push({ day: i, val: count });
      }
      return history;
    };

    const totalProjects = await prisma.project.count({ where: { members: { some: { userId } } } });
    const tasksThisWeek = await prisma.task.count({ where: { assigneeId: userId, createdAt: { gte: weekAgo } } });
    const doneTasks = await prisma.task.count({ where: { assigneeId: userId, status: 'DONE' } });
    const totalTasks = await prisma.task.count({ where: { assigneeId: userId } });
    const overdueCount = await prisma.task.count({ where: { assigneeId: userId, status: { not: 'DONE' }, dueDate: { lt: now } } });

    const kpis = {
      projects: { val: totalProjects, trend: '+2', sparkline: await getSparkline('project', { members: { some: { userId } } }) },
      tasks: { val: tasksThisWeek, trend: '+12%', sparkline: await getSparkline('task', { assigneeId: userId }) },
      completion: { val: totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0, trend: '+5%', sparkline: [] },
      overdue: { val: overdueCount, trend: '-3', sparkline: [] }
    };

    // 2. My Tasks (Actionable)
    const myTasks = await prisma.task.findMany({
      where: { assigneeId: userId, status: { not: 'DONE' } },
      take: 8,
      include: { project: { select: { id: true, name: true } } },
      orderBy: [ { priority: 'desc' }, { dueDate: 'asc' } ]
    });

    // 3. Team Activity (last 10)
    const activity = await prisma.activity.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });

    // 4. Upcoming Deadlines (next 7 days)
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const upcoming = await prisma.task.findMany({
      where: { 
        assigneeId: userId, 
        status: { not: 'DONE' },
        dueDate: { gte: now, lte: nextWeek }
      },
      take: 5,
      include: { project: { select: { name: true } } },
      orderBy: { dueDate: 'asc' }
    });

    // 5. Project Health
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId } } },
      include: {
        _count: { select: { tasks: true, members: true } },
        tasks: { select: { status: true, dueDate: true } }
      }
    });

    const projectHealth = projects.map(p => {
      const done = p.tasks.filter(t => t.status === 'DONE').length;
      const overdue = p.tasks.filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < now).length;
      return {
        id: p.id,
        name: p.name,
        status: p.status,
        total: p._count.tasks,
        done,
        overdue,
        members: p._count.members,
        progress: p._count.tasks > 0 ? Math.round((done / p._count.tasks) * 100) : 0
      };
    });

    res.json({ kpis, myTasks, activity, upcoming, projectHealth });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
  getActivity,
  getOverdueTasks,
  getChartData,
  getAdvancedDashboard
};
