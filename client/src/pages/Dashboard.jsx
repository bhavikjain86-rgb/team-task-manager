import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { format, formatDistanceToNow } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { FolderOpen, ListTodo, CheckCircle2, AlertCircle, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState(null);
  const [overdueTasks, setOverdueTasks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, activityRes, overdueRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activity'),
          api.get('/dashboard/overdue')
        ]);
        setStats(statsRes.data);
        setActivities(activityRes.data);
        setOverdueTasks(overdueRes.data);
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const pieData = stats ? [
    { name: 'To Do', value: stats.tasksByStatus.TODO, color: '#94a3b8' }, // slate-400
    { name: 'In Progress', value: stats.tasksByStatus.IN_PROGRESS, color: '#fbbf24' }, // amber-400
    { name: 'Done', value: stats.tasksByStatus.DONE, color: '#34d399' } // emerald-400
  ] : [];

  const StatCard = ({ title, value, icon: Icon, colorClass, iconBgClass }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${iconBgClass}`}>
        <Icon className={`w-8 h-8 ${colorClass}`} />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900">
          {loading ? <span className="animate-pulse bg-slate-200 text-transparent rounded">00</span> : value}
        </h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Greeting Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          {getGreeting()}, {user?.name.split(' ')[0]} <span className="animate-wave inline-block origin-bottom-right">👋</span>
        </h1>
        <p className="text-slate-500 mt-2">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={stats?.totalProjects}
          icon={FolderOpen}
          colorClass="text-indigo-600"
          iconBgClass="bg-indigo-50"
        />
        <StatCard
          title="My Tasks"
          value={stats?.myTasks}
          icon={ListTodo}
          colorClass="text-blue-600"
          iconBgClass="bg-blue-50"
        />
        <StatCard
          title="Completed Today"
          value={stats?.completedToday}
          icon={CheckCircle2}
          colorClass="text-emerald-600"
          iconBgClass="bg-emerald-50"
        />
        <StatCard
          title="Overdue"
          value={stats?.overdueCount}
          icon={AlertCircle}
          colorClass="text-red-600"
          iconBgClass="bg-red-50"
        />
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left: Task Status Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-[420px] flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Task Breakdown</h3>
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full border-4 border-slate-100 border-t-indigo-500 animate-spin"></div>
            </div>
          ) : (
            <>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-100">
                {pieData.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <div className="text-sm">
                      <span className="text-slate-500">{item.name}</span>
                      <span className="ml-1 font-semibold text-slate-900">{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Middle: Activity Feed */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-[420px] flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <Activity className="w-5 h-5 text-slate-400" />
            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex gap-4 animate-pulse">
                    <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : activities?.length > 0 ? (
              <div className="space-y-6">
                {activities.map(activity => (
                  <div key={activity.id} className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                      {activity.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-slate-700">
                        <span className="font-semibold text-slate-900">{activity.user.name}</span>
                        {' '}
                        {activity.action.toLowerCase().replace('_', ' ')}
                        {' in '}
                        <span className="font-semibold">{activity.project?.name || 'Project'}</span>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Overdue Tasks */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 h-[420px] flex flex-col">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="text-lg font-bold text-slate-900">Overdue Tasks</h3>
            </div>
            {overdueTasks?.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">
                {overdueTasks.length}
              </span>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              [1, 2].map(i => (
                <div key={i} className="h-24 rounded-xl border border-slate-100 bg-slate-50 animate-pulse"></div>
              ))
            ) : overdueTasks?.length > 0 ? (
              overdueTasks.map(task => (
                <Link
                  key={task.id}
                  to={`/projects/${task.project.id}`}
                  className="block p-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100/50 transition-colors group"
                >
                  <h4 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {task.title}
                  </h4>
                  <div className="flex flex-col gap-1 text-sm">
                    <p className="text-slate-600 line-clamp-1">{task.project.name}</p>
                    <p className="text-red-600 font-medium">
                      Due: {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                </Link>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 text-slate-200 mb-2" />
                <p>You're all caught up!</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
