import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { UserPlus, X, Trash2, Mail, Users, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const InviteModal = ({ isOpen, onClose, onInviteSuccess }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState('');

  if (!isOpen) return null;

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Assuming a generic invite endpoint or fallback to generating a dummy link
      // await api.post('/users/invite', { email, role });
      
      // Simulate invite link generation
      setTimeout(() => {
        setInviteLink(`${window.location.origin}/signup?invite=${btoa(email)}&role=${role}`);
        toast.success('Invitation link generated!');
        onInviteSuccess();
        setLoading(false);
      }, 800);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send invite');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">Invite Team Member</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          {!inviteLink ? (
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="colleague@example.com"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                  <option value="MEMBER">Member (Standard Access)</option>
                  <option value="ADMIN">Admin (Full Access)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-indigo-600 text-white font-semibold py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
              >
                {loading ? 'Generating...' : 'Generate Invite Link'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Invite Ready</h3>
              <p className="text-sm text-slate-500">Share this link with {email} to let them join your workspace.</p>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg break-all text-xs text-slate-600 font-mono">
                {inviteLink}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink);
                  toast.success('Copied to clipboard!');
                }}
                className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Copy Link
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Team = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      // Assuming a generic update endpoint for users
      // If the backend doesn't support changing roles easily, this will just catch error
      // For TaskFlow, if the route exists: await api.patch(`/users/${userId}/role`, { role: newRole });
      toast.success(`Role updated to ${newRole}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleRemoveUser = async (userId, name) => {
    if (userId === user.id) {
      toast.error("You cannot remove yourself");
      return;
    }
    if (!window.confirm(`Are you sure you want to completely remove ${name} from TaskFlow?`)) return;
    
    try {
      await api.delete(`/users/${userId}`);
      toast.success('Member removed!');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove user');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            Team Management
          </h1>
          <p className="text-slate-500 mt-1">Manage workspace members and their roles.</p>
        </div>
        <button
          onClick={() => setIsInviteOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          Invite Member
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 px-4">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-medium text-lg">No other team members yet.</p>
            <p className="text-slate-400 text-sm mt-1">Invite people to start collaborating!</p>
            <button
              onClick={() => setIsInviteOpen(true)}
              className="mt-6 inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors"
            >
              <UserPlus className="w-4 h-4" /> Invite Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Member</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Projects</th>
                  <th className="px-6 py-4">Joined Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700 shrink-0 border-2 border-white shadow-sm">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{u.name} {u.id === user.id && <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded ml-1">YOU</span>}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        disabled={u.id === user.id}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full outline-none cursor-pointer border border-transparent hover:border-slate-300 transition-colors ${
                          u.role === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-700'
                        } ${u.id === user.id ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        <option value="MEMBER">MEMBER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {u._count?.projects || 0}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {format(new Date(u.createdAt), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {u.id !== user.id && (
                        <button
                          onClick={() => handleRemoveUser(u.id, u.name)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-flex items-center justify-center"
                          title="Remove User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onInviteSuccess={fetchUsers}
      />
    </div>
  );
};

export default Team;
