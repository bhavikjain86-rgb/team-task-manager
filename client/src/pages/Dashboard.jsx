import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Line, ComposedChart, Cell, Tooltip
} from 'recharts';
import { ChevronRight, Filter, ChevronDown, BarChart3, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import Dropdown from '../components/Dropdown';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, activityRes, tasksRes, chartRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/activity'),
        api.get('/projects'),
        api.get('/dashboard/chart')
      ]);
      setStats(statsRes.data);
      setActivities(activityRes.data);
      setChartData(chartRes.data);
      
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

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-white flex items-center gap-3">
    <RefreshCw className="w-5 h-5 animate-spin" />
    <span>Syncing live data...</span>
  </div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
      
      {/* TOP LEFT - "Check" Card (Cream) */}
      <div className="bg-card-light rounded-card p-6 flex flex-col text-app shadow-xl shadow-black/5 hover:-translate-y-1 transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-[15px] font-semibold uppercase tracking-tight">Check</h2>
          <div className="flex-1 h-1.5 bg-[#622B141a] rounded-full overflow-hidden">
            <div className="bg-accent-green h-full w-[99%]" />
          </div>
          <span className="text-xs font-bold text-accent-green">99% Complete</span>
        </div>
        <div className="space-y-4">
          {tasks.map((task, i) => (
            <div key={task.id} className="flex items-center justify-between group cursor-pointer hover:bg-black/5 p-2 -m-2 rounded-xl transition-all">
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${i < 3 ? 'bg-accent-green border-accent-green' : 'bg-[#C4B99A] border-[#C4B99A] group-hover:border-accent-green'}`}>
                  {i < 3 && <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-0.5" />}
                </div>
                <span className={`text-[13px] font-medium transition-all ${i < 3 ? 'line-through opacity-40' : 'group-hover:translate-x-1'}`}>
                  {task.title}
                </span>
              </div>
              <div className="w-7 h-7 rounded-full bg-app/10 border-2 border-white shrink-0 overflow-hidden shadow-sm">
                <div className="w-full h-full bg-[#995F2F] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {task.assignee?.name.charAt(0) || 'U'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* TOP RIGHT - "Report" Card (Orange) */}
      <div className="bg-card-orange rounded-card p-6 flex flex-col text-white shadow-xl shadow-orange-950/20 hover:-translate-y-1 transition-all duration-300">
        <h2 className="text-[15px] font-semibold uppercase tracking-tight mb-6">Report</h2>
        <div className="space-y-0">
          {[1, 2, 3].map((_, i) => (
            <div key={i} className={`py-4 flex items-center justify-between cursor-pointer group ${i !== 0 ? 'border-t border-white/20' : ''}`}>
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2].map(j => (
                    <div key={j} className="w-7 h-7 rounded-full bg-white/20 border-2 border-[#995F2F] flex items-center justify-center text-[10px] font-bold shadow-sm">
                      {String.fromCharCode(65 + j + i)}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                   {i === 0 ? (
                     <span className="bg-app text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">In Progress</span>
                   ) : i === 1 ? (
                     <span className="bg-white text-app text-[11px] font-medium px-3 py-1 rounded-full border border-black/5 shadow-sm">Realistic</span>
                   ) : (
                     <span className="bg-accent-green text-white text-[11px] font-medium px-3 py-1 rounded-full shadow-sm">Complete</span>
                   )}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM LEFT - "Understand" Card (Dark) */}
      <div className="bg-card-dark rounded-card p-6 lg:col-span-1 text-white shadow-xl shadow-black/20 hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[15px] font-semibold uppercase tracking-tight text-white">Understand</h2>
          <span className="text-[12px] text-muted">Time Entry Week</span>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-app/40 rounded-block p-4 border border-white/5 hover:bg-app/60 transition-colors cursor-default">
            <div className="text-[28px] font-bold leading-tight">3,458</div>
            <div className="text-[12px] font-medium text-white/80">Contract Hours</div>
          </div>
          <div className="bg-app/40 rounded-block p-4 border border-white/5 hover:bg-app/60 transition-colors cursor-default">
            <div className="text-[28px] font-bold leading-tight">1,059</div>
            <div className="text-[12px] font-medium text-white/80">Client Hours</div>
          </div>
          <div className="bg-card-light rounded-block p-4 text-app hover:brightness-95 transition-all cursor-default">
            <div className="text-[28px] font-bold leading-tight">30.62%</div>
            <div className="text-[12px] font-medium text-app/60">Utilization</div>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Dropdown 
            label="Filter" 
            options={['High Priority', 'Overdue', 'My Tasks']} 
            onSelect={() => {}}
          />
          <Dropdown 
            label="Employee" 
            options={['All Members', 'Marcus R.', 'Sasha K.', 'Alex J.']} 
            onSelect={() => {}}
          />
        </div>

        <table className="w-full text-[13px]">
          <thead>
            <tr className="text-muted font-normal">
              <th className="text-left font-normal pb-4 px-2">Employee</th>
              <th className="text-left font-normal pb-4 px-2">Contract</th>
              <th className="text-left font-normal pb-4 px-2">Client</th>
              <th className="text-left font-normal pb-4 px-2">Intern</th>
              <th className="text-left font-normal pb-4 px-2 text-right">More</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {activities.slice(0, 4).map((act, i) => (
              <tr key={act.id} className="border-t border-white/5 hover:bg-white/5 transition-colors group cursor-pointer">
                <td className="py-3 px-2 flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/10 text-[10px] flex items-center justify-center font-bold">
                    {act.user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-white group-hover:text-card-light transition-colors">{act.user.name.split(' ')[0]}</span>
                </td>
                <td className="py-3 px-2">40.0</td>
                <td className="py-3 px-2 text-muted">{i % 3 === 0 ? '—' : '22.0'}</td>
                <td className="py-3 px-2 text-muted">—</td>
                <td className="py-3 px-2 text-right">
                   <ChevronRight className="w-4 h-4 text-white/20 inline group-hover:text-white transition-all" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BOTTOM RIGHT - "Plan" Card (Yellow) */}
      <div className="bg-card-yellow rounded-card p-6 flex flex-col text-app shadow-xl shadow-black/10 hover:-translate-y-1 transition-all duration-300">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-[15px] font-semibold uppercase tracking-tight">Plan</h2>
          <div className="flex items-center gap-2">
            <div className="flex bg-black/5 p-1 rounded-full">
              <button className="px-3 py-1 text-[11px] font-bold rounded-full bg-app text-white transition-all active:scale-95 shadow-lg">Optimistic</button>
              <button className="px-3 py-1 text-[11px] font-bold rounded-full text-app hover:bg-black/5 transition-all">Realistic</button>
            </div>
            <button className="bg-[#4A1E0D] text-white text-[11px] font-bold py-1.5 px-4 rounded-full flex items-center gap-2 active:scale-95 transition-all shadow-md">
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
                tick={{ fill: '#622B14', fontSize: 11, fontWeight: 500 }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(v) => v === 0 ? '0' : v}
                tick={{ fill: '#622B14', fontSize: 11, fontWeight: 500 }}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(98,43,20,0.05)' }}
                contentStyle={{ 
                  backgroundColor: '#E4D6A9', 
                  border: 'none', 
                  borderRadius: '12px', 
                  boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  fontSize: '12px',
                  fontWeight: '600'
                }}
              />
              <Bar dataKey="val" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.name === 'Jun' ? '#4A1E0D' : (index % 2 === 0 ? '#FFFFFF' : '#995F2F')} 
                  />
                ))}
              </Bar>
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke="#622B14" 
                strokeWidth={3} 
                dot={{ fill: '#622B14', r: 4 }}
                activeDot={{ r: 6, stroke: '#E4D6A9', strokeWidth: 2 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
