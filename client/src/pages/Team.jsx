import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Search, MoreVertical, Filter, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

const Team = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
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
    <div className="space-y-8 bg-app min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-[28px] font-bold text-white">Workspace</h1>
        <button className="bg-accent-orange text-white font-bold py-2.5 px-6 rounded-[12px] hover:brightness-110 transition-all flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-card-dark border border-white/5 rounded-card text-white text-sm focus:outline-none focus:border-accent-orange"
          />
        </div>
        <button className="bg-[#2A2A2A] text-white font-bold py-1.5 px-5 rounded-full flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      <div className="bg-card-dark rounded-card p-6 border border-white/5 overflow-hidden">
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="text-muted font-normal">
              <th className="text-left font-normal pb-4 px-2">Member</th>
              <th className="text-left font-normal pb-4 px-2">Email</th>
              <th className="text-left font-normal pb-4 px-2">Role</th>
              <th className="text-left font-normal pb-4 px-2">Joined</th>
              <th className="text-right font-normal pb-4 px-2">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              [1, 2, 3].map(i => <tr key={i}><td colSpan={5} className="h-12 animate-pulse bg-white/5"></td></tr>)
            ) : filteredUsers.map((u) => (
              <tr key={u.id} className="group hover:bg-white/5 transition-colors border-t border-white/5">
                <td className="py-4 px-2 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-accent-orange flex items-center justify-center text-white font-bold text-xs">
                    {u.name.charAt(0)}
                  </div>
                  <span className="font-medium text-white">{u.name}</span>
                </td>
                <td className="py-4 px-2 text-muted">{u.email}</td>
                <td className="py-4 px-2">
                  <span className={`text-[11px] font-medium px-3 py-1 rounded-full ${u.role === 'ADMIN' ? 'bg-app text-white' : 'bg-white text-app border border-black/5'}`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-4 px-2 text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="py-4 px-2 text-right">
                  <button className="p-2 text-muted hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Team;
