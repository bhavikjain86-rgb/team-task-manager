import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, 
  Search, 
  MoreVertical, 
  Filter, 
  ChevronDown, 
  X, 
  Briefcase, 
  Clock, 
  Mail, 
  Shield,
  LayoutGrid,
  Activity,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { TableSkeleton } from '../components/Skeleton';
import { timeAgo } from '../utils/helpers';

const MemberSidePanel = ({ member, onClose, projects }) => {
  if (!member) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[450px] bg-card-dark border-l border-white/10 z-[250] shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <h3 className="text-sm font-black uppercase tracking-widest">Member Profile</h3>
        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-[32px] bg-accent-orange/10 flex items-center justify-center text-accent-orange font-black text-4xl mb-4 border-2 border-accent-orange/20">
            {member?.name?.charAt(0) || '?'}
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">{member.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-accent-orange text-white rounded">{member.role}</span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Joined {new Date(member.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-app p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Active Tasks</p>
                <p className="text-2xl font-bold text-white">{member.tasks?.filter(t => t.status !== 'DONE').length || 0}</p>
             </div>
             <div className="bg-app p-4 rounded-2xl border border-white/5 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Projects</p>
                <p className="text-2xl font-bold text-white">{member.projects?.length || 0}</p>
             </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-muted border-b border-white/5 pb-2">Contact Details</h4>
             <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                   <Mail className="w-4 h-4 text-muted" />
                   <span className="text-white/80">{member.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                   <Shield className="w-4 h-4 text-muted" />
                   <span className="text-white/80">{member.role} Authorization</span>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-muted border-b border-white/5 pb-2">Current Projects</h4>
             <div className="space-y-2">
                {member.projects?.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 bg-white/[0.03] rounded-xl border border-white/5">
                     <span className="text-xs font-bold text-white">{p.name}</span>
                     <span className="text-[9px] font-black uppercase tracking-widest text-accent-orange">Member</span>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Team = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
      document.title = "Workspace Team | TaskFlow";
    } catch (error) {
      toast.error('Failed to load team');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 bg-app min-h-screen pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-[28px] font-bold text-white tracking-tight">Workspace Members</h1>
        <button className="bg-accent-orange text-white font-bold py-2.5 px-6 rounded-[12px] hover:brightness-110 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-orange-950/20">
          <UserPlus className="w-5 h-5" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Workload Overview */}
      {!loading && (
        <div className="bg-card-dark rounded-card p-6 border border-white/5">
          <h2 className="text-[10px] font-black uppercase tracking-widest text-muted mb-6 flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-orange" />
            Workload Distribution
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {users.slice(0, 5).map(u => {
              const activeCount = u.tasks?.filter(t => t.status !== 'DONE').length || 0;
              const workload = Math.min(Math.round((activeCount / 10) * 100), 100);
              return (
                <div key={u.id} className="bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                   <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-accent-orange/10 flex items-center justify-center text-accent-orange font-bold text-xs uppercase">{u.name?.charAt(0) || '?'}</div>
                      <span className="text-xs font-bold text-white truncate">{u.name.split(' ')[0]}</span>
                   </div>
                   <div className="flex justify-between text-[9px] font-black uppercase tracking-widest mb-1.5">
                      <span className="text-muted">Workload</span>
                      <span className={workload > 80 ? 'text-rose-400' : 'text-accent-green'}>{workload}%</span>
                   </div>
                   <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full transition-all duration-500 ${workload > 80 ? 'bg-rose-500' : 'bg-accent-green'}`} style={{ width: `${workload}%` }} />
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-card-dark border border-white/5 rounded-card text-white text-sm focus:outline-none focus:border-accent-orange transition-all"
          />
        </div>
        <button className="bg-card-dark text-white font-bold py-1.5 px-6 rounded-2xl border border-white/5 flex items-center gap-2 text-sm hover:bg-white/5 transition-all">
          <Filter className="w-4 h-4 text-muted" />
          <span>Filters</span>
        </button>
      </div>

      <div className="bg-card-dark rounded-card border border-white/5 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-muted border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4">Member</th>
              <th className="px-6 py-4">Active Tasks</th>
              <th className="px-6 py-4">Workload</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Last Active</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <TableSkeleton rows={8} cols={6} />
            ) : filteredUsers.map((u) => {
              const activeCount = u.tasks?.filter(t => t.status !== 'DONE').length || 0;
              const workload = Math.min(Math.round((activeCount / 10) * 100), 100);
              return (
                <tr 
                  key={u.id} 
                  className="group hover:bg-white/[0.02] transition-all cursor-pointer border-t border-white/5"
                  onClick={() => setSelectedMember(u)}
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center text-accent-orange font-black text-sm uppercase">
                      {u.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <span className="font-bold text-sm text-white block">{u.name}</span>
                      <span className="text-[10px] text-muted font-medium">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${activeCount > 0 ? 'bg-accent-orange' : 'bg-white/10'}`} />
                        <span className="text-sm font-bold text-white">{activeCount} tasks</span>
                     </div>
                  </td>
                  <td className="px-6 py-4 min-w-[120px]">
                     <div className="space-y-1.5">
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden w-24">
                           <div className={`h-full ${workload > 80 ? 'bg-rose-500' : 'bg-accent-green'}`} style={{ width: `${workload}%` }} />
                        </div>
                        <p className="text-[9px] font-black uppercase text-muted tracking-widest">{workload}% Capacity</p>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-accent-orange text-white' : 'bg-white/5 text-muted border border-white/10'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center gap-2 text-muted text-xs">
                        <Clock className="w-3.5 h-3.5" />
                        {timeAgo(u.updatedAt)}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-muted group-hover:text-white transition-all">
                      <ChevronDown className="w-5 h-5 -rotate-90" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <MemberSidePanel 
        member={selectedMember} 
        onClose={() => setSelectedMember(null)} 
      />
    </div>
  );
};

export default Team;
