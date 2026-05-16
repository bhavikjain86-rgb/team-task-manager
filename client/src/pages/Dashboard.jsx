import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  FolderOpen, 
  ListTodo, 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  ArrowUpRight,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition-all group overflow-hidden relative">
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full opacity-[0.03] transition-transform group-hover:scale-110`} style={{ backgroundColor: color }} />
    
    <div className="flex justify-between items-start relative z-10">
      <div className={`p-3 rounded-2xl border`} style={{ backgroundColor: `${color}10`, color: color, borderColor: `${color}20` }}>
        <Icon className="w-6 h-6" strokeWidth={2.5} />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-100/50 border border-emerald-200/50 px-2.5 py-1 rounded-xl">
          <ArrowUpRight className="w-3 h-3" strokeWidth={3} />
          {trend}%
        </div>
      )}
    </div>
    
    <div className="mt-5 relative z-10">
      <h3 className="text-sm font-medium text-slate-500">{title}</h3>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-3xl font-display font-extrabold text-slate-900 tracking-tight">{value}</span>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [overdue, setOverdue] = useState([]);
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
        setOverdue(overdueRes.data);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
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

  const chartData = stats ? [
    { name: 'Todo', value: stats.todoTasks, color: '#64748B' },
    { name: 'In Progress', value: stats.inProgressTasks, color: '#D97706' },
    { name: 'Done', value: stats.doneTasks, color: '#008542' }
  ] : [];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-white rounded-3xl border border-slate-100" />)}
        <div className="md:col-span-2 h-[400px] bg-white rounded-3xl border border-slate-100" />
        <div className="md:col-span-2 h-[400px] bg-white rounded-3xl border border-slate-100" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Here's what's happening with your projects today.</p>
        </div>
        <div className="hidden lg:flex items-center gap-3 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          <div className="px-4 py-2 text-sm font-bold text-slate-900">Today</div>
          <div className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 cursor-pointer">Week</div>
          <div className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-600 cursor-pointer">Month</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Projects" value={stats?.totalProjects} icon={FolderOpen} color="#6366f1" trend={12} />
        <StatCard title="My Active Tasks" value={stats?.myTasks} icon={ListTodo} color="#0EA5E9" trend={5} />
        <StatCard title="Completed" value={stats?.completedProjects} icon={CheckCircle2} color="#008542" />
        <StatCard title="Overdue Tasks" value={stats?.overdueTasks} icon={AlertCircle} color="#EF4444" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Task Distribution */}
        <div className="lg:col-span-5 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-display font-bold text-slate-900">Task Status Distribution</h2>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex-1 min-h-[250px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-6">
            {chartData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 transition-transform hover:scale-105">
                <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: item.color }} />
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter">{item.name}</span>
                <span className="text-lg font-display font-extrabold text-slate-900 leading-none mt-1">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle: Recent Activity */}
        <div className="lg:col-span-7 bg-white rounded-[32px] p-8 shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-display font-bold text-slate-900">Recent Activity</h2>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
              View all <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <div className="space-y-6 max-h-[420px] overflow-y-auto pr-4 custom-scrollbar">
            {activities.length > 0 ? activities.map((activity, idx) => (
              <div key={activity.id} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border border-slate-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-all">
                    {activity.user.name.charAt(0).toUpperCase()}
                  </div>
                  {idx !== activities.length - 1 && <div className="w-px h-full bg-slate-100 mt-2" />}
                </div>
                <div className="flex-1 pb-6">
                  <p className="text-sm text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-900">{activity.user.name}</span> {activity.action.toLowerCase().replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3 h-3" />
                    {format(new Date(activity.createdAt), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10">
                <p className="text-slate-400 text-sm italic">No recent activity.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Overdue Panel */}
      <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 overflow-hidden relative">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-display font-bold text-slate-900">Overdue Tasks</h2>
          </div>
          <span className="text-xs font-bold bg-rose-100 text-rose-700 px-3 py-1 rounded-full uppercase tracking-wider">Attention Required</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {overdue.length > 0 ? overdue.map(task => (
            <div key={task.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-rose-600 uppercase tracking-widest bg-rose-50 px-2 py-0.5 rounded-md">High Priority</span>
                <span className="text-[10px] font-bold text-slate-400">{format(new Date(task.dueDate), 'MMM d')}</span>
              </div>
              <h4 className="font-bold text-slate-900 line-clamp-1">{task.title}</h4>
              <p className="text-xs text-slate-500 mt-1 font-medium">{task.project.name}</p>
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200/50">
                <div className="w-6 h-6 rounded-lg bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                  {task.assignee?.name.charAt(0) || '?'}
                </div>
                <span className="text-[10px] font-bold text-slate-600 truncate">{task.assignee?.name || 'Unassigned'}</span>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <CheckCircle2 className="w-10 h-10 text-emerald-300 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">Excellent! No overdue tasks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
