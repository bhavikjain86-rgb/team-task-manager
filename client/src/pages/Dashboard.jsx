import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Line, ComposedChart, Cell
} from 'recharts';
import { ChevronRight, Filter, ChevronDown, BarChart3, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes, tasksRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/activity'),
          api.get('/projects')
        ]);
        setStats(statsRes.data);
        setActivities(activityRes.data);
        const projects = tasksRes.data;
        if (projects.length > 0) {
          const detailRes = await api.get(`/projects/${projects[0].id}`);
          setTasks(detailRes.data.tasks.slice(0, 5));
        }
      } catch (error) {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const chartData = [
    { name: 'Jan', val: 200 }, { name: 'Feb', val: 350 }, { name: 'Mar', val: -100 },
    { name: 'Apr', val: 400 }, { name: 'May', val: 150 }, { name: 'Jun', val: 450 },
    { name: 'Jul', val: 300 }, { name: 'Aug', val: 100 }, { name: 'Sep', val: -50 },
    { name: 'Oct', val: 200 }, { name: 'Nov', val: 400 }, { name: 'Dec', val: 300 },
  ];

  if (loading) return <div className="p-8 text-white">Initializing system...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
      
      {/* TOP LEFT - "Check" Card (Cream) */}
      <div className="bg-card-light rounded-card p-6 flex flex-col text-app">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-[15px] font-semibold uppercase tracking-tight">Check</h2>
          <div className="flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden">
            <div className="bg-accent-green h-full w-[99%]" />
          </div>
          <span className="text-xs font-bold text-accent-green">99% Complete</span>
        </div>
        <div className="space-y-4">
          {tasks.map((task, i) => (
            <div key={task.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded flex items-center justify-center border ${i < 3 ? 'bg-accent-green border-accent-green' : 'bg-[#D4C9B0] border-[#D4C9B0]'}`}>
                  {i < 3 && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />}
                </div>
                <span className={`text-[13px] font-medium ${i < 3 ? 'line-through text-muted' : 'text-app'}`}>
                  {task.title}
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white shrink-0 overflow-hidden">
                <div className="w-full h-full bg-indigo-200 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                  {task.assignee?.name.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOP RIGHT - "Report" Card (Orange) */}
      <div className="bg-card-orange rounded-card p-6 flex flex-col text-white">
        <h2 className="text-[15px] font-semibold uppercase tracking-tight mb-6">Report</h2>
        <div className="space-y-0">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className={`py-4 flex items-center justify-between ${i !== 0 ? 'border-t border-white/20' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2].map(j => (
                    <div key={j} className="w-7 h-7 rounded-full bg-white/20 border-2 border-accent-orange flex items-center justify-center text-[10px] font-bold">
                      {String.fromCharCode(65 + j + i)}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                   {i === 0 ? (
                     <span className="bg-app text-white text-[11px] font-medium px-3 py-1 rounded-full">In Progress</span>
                   ) : i === 1 ? (
                     <span className="bg-white text-app text-[11px] font-medium px-3 py-1 rounded-full border border-black/5">Realistic</span>
                   ) : (
                     <span className="bg-accent-green text-white text-[11px] font-medium px-3 py-1 rounded-full">Complete</span>
                   )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60" />
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM LEFT - "Understand" Card (Dark) */}
      <div className="bg-card-dark rounded-card p-6 lg:col-span-1 text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[15px] font-semibold uppercase tracking-tight text-white">Understand</h2>
          <span className="text-[12px] text-muted">Time Entry Week</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-accent-orange rounded-block p-4">
            <div className="text-[28px] font-bold leading-tight">3,458</div>
            <div className="text-[12px] font-medium text-white/80">Contract Hours</div>
          </div>
          <div className="bg-accent-orange rounded-block p-4">
            <div className="text-[28px] font-bold leading-tight">1,059</div>
            <div className="text-[12px] font-medium text-white/80">Client Hours</div>
          </div>
          <div className="bg-accent-tan rounded-block p-4 text-app">
            <div className="text-[28px] font-bold leading-tight">30.62%</div>
            <div className="text-[12px] font-medium text-black/60">Utilization</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button className="bg-[#2A2A2A] text-white text-[11px] font-bold py-1.5 px-4 rounded-full flex items-center gap-2">
            <span>Filter</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          <button className="bg-[#2A2A2A] text-white text-[11px] font-bold py-1.5 px-4 rounded-full flex items-center gap-2">
            <span>Employee</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-muted font-normal">
              <th className="text-left font-normal pb-4 px-2">Employee</th>
              <th className="text-left font-normal pb-4 px-2">Contract</th>
              <th className="text-left font-normal pb-4 px-2">Client</th>
              <th className="text-left font-normal pb-4 px-2">Intern</th>
              <th className="text-left font-normal pb-4 px-2">Leave</th>
              <th className="text-left font-normal pb-4 px-2">Overtime</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {activities.slice(0, 4).map((act, i) => (
              <tr key={act.id} className="border-t border-white/5">
                <td className="py-3 px-2 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/10 text-[10px] flex items-center justify-center font-bold">
                    {act.user.name.charAt(0)}
                  </div>
                  <span className="font-medium text-white">{act.user.name.split(' ')[0]}</span>
                </td>
                <td className="py-3 px-2">40.0</td>
                <td className="py-3 px-2 text-muted">{i % 3 === 0 ? '—' : '22.0'}</td>
                <td className="py-3 px-2 text-muted">—</td>
                <td className="py-3 px-2 text-muted">{i === 2 ? '8.0' : '—'}</td>
                <td className="py-3 px-2 text-muted">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BOTTOM RIGHT - "Plan" Card (Yellow) */}
      <div className="bg-card-yellow rounded-card p-6 flex flex-col text-app">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[15px] font-semibold uppercase tracking-tight">Plan</h2>
          <div className="flex items-center gap-2">
            <div className="flex bg-black/5 p-1 rounded-full">
              <button className="px-3 py-1 text-[11px] font-bold rounded-full bg-app text-white">Optimistic</button>
              <button className="px-3 py-1 text-[11px] font-bold rounded-full text-app">Realistic</button>
            </div>
            <button className="bg-[#2A2A2A] text-white text-[11px] font-bold py-1.5 px-4 rounded-full flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analyze</span>
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                dy={10}
                tick={{ fill: '#1A1A1A', fontSize: 11, fontWeight: 500 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(v) => v === 0 ? '0' : `${v}K`}
                tick={{ fill: '#1A1A1A', fontSize: 11, fontWeight: 500 }}
              />
              <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'Jun' ? '#000000' : (index % 2 === 0 ? '#FFFFFF' : '#F4622A')} 
                  />
                ))}
              </Bar>
              <Line 
                type="monotone" 
                dataKey="val" 
                stroke="#1A1A1A" 
                strokeWidth={2} 
                dot={false} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
