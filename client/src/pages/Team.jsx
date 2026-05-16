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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-[28px] font-bold text-white">Workspace</h1>
        <button className="btn-primary flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          <span>Invite Member</span>
        </button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
          <input
            type="text"
            placeholder="Search team members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-[var(--bg-card-dark)] border border-[var(--border-dark)] rounded-[var(--radius-card)] text-white text-sm"
          />
        </div>
        <button className="btn-pill-dark">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      <div className="card-base card-understand">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              [1, 2, 3].map(i => <tr key={i}><td colSpan={5} className="h-12 animate-pulse bg-white/5"></td></tr>)
            ) : filteredUsers.map((u) => (
              <tr key={u.id} className="group hover:bg-white/5 transition-colors">
                <td className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-orange)] flex items-center justify-center text-white font-bold text-xs">
                    {u.name.charAt(0)}
                  </div>
                  <span className="font-medium">{u.name}</span>
                </td>
                <td className="text-[var(--text-muted)]">{u.email}</td>
                <td>
                  <span className={u.role === 'ADMIN' ? 'badge-in-progress' : 'badge-realistic'}>
                    {u.role}
                  </span>
                </td>
                <td className="text-[var(--text-muted)]">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="text-right">
                  <button className="p-2 text-[var(--text-muted)] hover:text-white transition-colors">
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
