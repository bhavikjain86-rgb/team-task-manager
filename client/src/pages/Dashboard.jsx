import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  AreaChart, Area, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip
} from 'recharts';
import { 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  Calendar,
  MessageSquare,
  Users
} from 'lucide-react';
import toast from 'react-hot-toast';
import { timeAgo, getPriorityStyles, isOverdue } from '../utils/helpers';
import { Link, useNavigate } from 'react-router-dom';
import { CardSkeleton, TableSkeleton } from '../components/Skeleton';

const KPICard = ({ title, value, trend, sparkline, icon: Icon, color = "orange" }) => {
  const isPositive = trend.startsWith('+');
  return (
    <div className="bg-card-dark rounded-card p-5 border border-white/5 hover:border-white/10 transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
        </div>
        <div className={`p-2 rounded-xl ${color === 'orange' ? 'bg-accent-orange/10 text-accent-orange' : 'bg-accent-green/10 text-accent-green'}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      
      <div className="h-10 w-full mb-3">
        {sparkline && sparkline.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline}>
              <defs>
                <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#4CAF50' : '#F4622A'} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={isPositive ? '#4CAF50' : '#F4622A'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="val" 
                stroke={isPositive ? '#4CAF50' : '#F4622A'} 
                fillOpacity={1} 
                fill={`url(#grad-${title})`} 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${isPositive ? 'bg-accent-green/10 text-accent-green' : 'bg-rose-500/10 text-rose-400'}`}>
          {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </span>
        <span className="text-[10px] font-medium text-muted uppercase tracking-tighter">vs last week</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/advanced');
      setData(res.data);
      document.title = "Dashboard | TaskFlow";
    } catch (e) {
      toast.error('Failed to sync dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleMarkDone = async (taskId) => {
    try {
      await api.patch(`/tasks/${taskId}`, { status: 'DONE' });
      toast.success('Task completed!');
      fetchDashboard();
    } catch (e) {
      toast.error('Failed to update task');
    }
  };

  if (loading) return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><TableSkeleton rows={8} /></div>
        <div className="space-y-6"><CardSkeleton /><CardSkeleton /></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Top Row - KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Projects" 
          value={data.kpis.projects.val} 
          trend={data.kpis.projects.trend} 
          sparkline={data.kpis.projects.sparkline} 
          icon={FolderKanban}
        />
        <KPICard 
          title="Tasks This Week" 
          value={data.kpis.tasks.val} 
          trend={data.kpis.tasks.trend} 
          sparkline={data.kpis.tasks.sparkline} 
          icon={Calendar}
        />
        <KPICard 
          title="Completion Rate" 
          value={`${data.kpis.completion.val}%`} 
          trend={data.kpis.completion.trend} 
          sparkline={[]} 
          icon={CheckCircle2}
          color="green"
        />
        <KPICard 
          title="Overdue Tasks" 
          value={data.kpis.overdue.val} 
          trend={data.kpis.overdue.trend} 
          sparkline={[]} 
          icon={AlertCircle}
        />
      </div>

      {/* Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks (60%) */}
        <div className="lg:col-span-2 bg-card-dark rounded-card border border-white/5 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <h2 className="text-[15px] font-bold uppercase tracking-widest flex items-center gap-2">
              My Tasks
              <span className="text-[10px] font-black bg-accent-orange text-white px-2 py-0.5 rounded-full">{data.myTasks.length}</span>
            </h2>
            <Link to="/projects" className="text-xs font-bold text-accent-orange hover:underline">View All Projects</Link>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {data.myTasks.length > 0 ? data.myTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-all group relative">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${getPriorityStyles(task.priority).text.replace('text-', 'bg-')}`} />
                <div className="flex-1 min-w-0 pl-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white truncate">{task.title}</span>
                    {isOverdue(task.dueDate, task.status) && (
                      <span className="text-[9px] font-black bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded uppercase tracking-tighter">Overdue</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest truncate">{task.project.name}</span>
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${isOverdue(task.dueDate, task.status) ? 'text-rose-400' : 'text-white/40'}`}>
                      <Clock className="w-3 h-3" />
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => handleMarkDone(task.id)}
                  className="px-4 py-2 bg-white/5 hover:bg-accent-green hover:text-white border border-white/10 rounded-xl text-xs font-bold transition-all"
                >
                  Mark as Done
                </button>
              </div>
            )) : (
              <div className="p-12 text-center flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-muted mb-4" />
                <p className="text-muted font-medium">All caught up! No tasks assigned to you.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Stack (40%) */}
        <div className="space-y-6">
          {/* Team Activity */}
          <div className="bg-card-dark rounded-card border border-white/5 overflow-hidden flex flex-col h-[350px]">
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-xs font-bold uppercase tracking-widest">Team Activity</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {data.activity.map((act, i) => (
                <div key={i} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/[0.01] transition-all">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 rounded-full bg-accent-orange/20 flex items-center justify-center text-accent-orange font-bold text-[10px] uppercase shrink-0">
                      {act.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium leading-snug"><span className="text-white font-bold">{act.user.name}</span> {act.action.toLowerCase().replace(/_/g, ' ')}</p>
                      <p className="text-[10px] text-muted mt-1">{timeAgo(act.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-card-dark rounded-card border border-white/5 overflow-hidden flex flex-col h-[300px]">
            <div className="p-4 border-b border-white/5 bg-white/[0.02]">
              <h2 className="text-xs font-bold uppercase tracking-widest">Upcoming Deadlines</h2>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              {data.upcoming.map((task) => (
                <div key={task.id} className="p-3 bg-white/5 rounded-xl border border-white/5 mb-2 hover:border-white/20 transition-all cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-white truncate pr-2">{task.title}</span>
                    <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[8px] font-bold shrink-0">
                      {user?.name.charAt(0)}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-black text-muted uppercase tracking-widest truncate max-w-[60%]">{task.project.name}</span>
                    <span className="text-[9px] font-bold text-accent-orange flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row - Project Health */}
      <div className="bg-card-dark rounded-card border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
          <h2 className="text-[15px] font-bold uppercase tracking-widest">Project Health</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-muted border-b border-white/5">
                <th className="px-6 py-4">Project</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Progress</th>
                <th className="px-6 py-4">Tasks</th>
                <th className="px-6 py-4">Overdue</th>
                <th className="px-6 py-4">Members</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.projectHealth.map((proj) => (
                <tr 
                  key={proj.id} 
                  className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                  onClick={() => navigate(`/projects/${proj.id}`)}
                >
                  <td className="px-6 py-4 font-bold text-sm text-white">{proj.name}</td>
                  <td className="px-6 py-4">
                    <span className="badge-in-progress">{proj.status}</span>
                  </td>
                  <td className="px-6 py-4 min-w-[150px]">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="bg-accent-green h-full" style={{ width: `${proj.progress}%` }} />
                      </div>
                      <span className="text-[11px] font-black text-white">{proj.progress}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <span className="text-white">{proj.done}</span>
                    <span className="text-muted"> / {proj.total}</span>
                  </td>
                  <td className="px-6 py-4">
                    {proj.overdue > 0 ? (
                      <span className="text-sm font-black text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {proj.overdue}
                      </span>
                    ) : (
                      <span className="text-sm font-medium text-muted">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted" />
                      <span className="text-sm font-bold text-white">{proj.members}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-white/5 rounded-lg text-muted group-hover:text-white transition-all">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
