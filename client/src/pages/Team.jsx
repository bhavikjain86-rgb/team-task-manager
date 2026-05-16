import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  UserPlus, 
  Search, 
  Mail, 
  Shield, 
  Trash2, 
  X,
  UserCheck,
  MoreVertical,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';

const RoleBadge = ({ role }) => {
  const isAlt = role === 'ADMIN';
  return (
    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${
      isAlt ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'
    }`}>
      {role}
    </span>
  );
};

const Team = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Modal state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/users', { name, email, password, role });
      toast.success('Team member invited successfully!');
      setIsModalOpen(false);
      setName('');
      setEmail('');
      setPassword('');
      setRole('MEMBER');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (id === currentUser.userId) {
      return toast.error('You cannot remove yourself');
    }
    if (!window.confirm('Are you sure you want to remove this team member?')) return;
    
    try {
      await api.delete(`/users/${id}`);
      toast.success('Member removed from workspace');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to remove member');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
            Team Workspace
            <span className="bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full">
              {users.length} Members
            </span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Control permissions and manage your project workforce.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 hover:-translate-y-0.5 active:translate-y-0"
        >
          <UserPlus className="w-5 h-5" />
          Invite Member
        </button>
      </div>

      {/* Manifest Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search team by name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium"
          />
        </div>
        <button className="flex items-center gap-2 px-5 py-4 bg-white border border-slate-200 rounded-2xl text-slate-500 font-bold text-sm hover:border-slate-300 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Users Table / Manifest */}
      <div className="bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Member Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Address</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Permissions</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Onboarded</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-10 h-20 bg-white" />
                  </tr>
                ))
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shadow-inner">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 leading-tight">{u.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">ID: {u.id.substring(0, 8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-slate-600 font-semibold text-sm">
                      <Mail className="w-4 h-4 text-slate-300" />
                      {u.email}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <RoleBadge role={u.role} />
                  </td>
                  <td className="px-8 py-6">
                    <span className="text-xs font-bold text-slate-400">{new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                         <MoreVertical className="w-5 h-5" />
                       </button>
                       {u.id !== currentUser.userId && (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                       )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-display font-extrabold text-slate-900">Invite Team Member</h2>
                <p className="text-slate-400 text-sm font-medium">Add a new professional to your workspace.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-50 text-slate-400 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Full Name</label>
                <div className="relative">
                  <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all font-semibold"
                    placeholder="E.g. Marcus Reid"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all font-semibold"
                    placeholder="marcus@company.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Initial Password</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all font-semibold"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">System Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all font-bold text-slate-900 appearance-none"
                >
                  <option value="MEMBER">Standard Member</option>
                  <option value="ADMIN">System Administrator</option>
                </select>
              </div>

              <div className="pt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-6 py-4 text-sm font-bold text-slate-400 hover:text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-70"
                >
                  {isSubmitting ? 'Onboarding...' : 'Onboard Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
