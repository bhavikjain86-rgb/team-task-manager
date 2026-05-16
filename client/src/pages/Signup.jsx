import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FolderKanban } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('MEMBER');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, role);
      navigate('/dashboard');
    } catch (err) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] p-4">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-[var(--accent-orange)] rounded-2xl flex items-center justify-center shadow-2xl shadow-orange-500/20 mb-6">
            <FolderKanban className="text-white w-7 h-7" />
          </div>
          <h1 className="text-[28px] font-bold text-white tracking-tight">Join TaskFlow</h1>
          <p className="text-[var(--text-muted)] mt-2">Start managing your professional workforce</p>
        </div>

        <div className="card-base card-understand p-8 border border-[var(--border-dark)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-dark)] rounded-xl focus:border-[var(--accent-orange)] outline-none text-white text-sm"
                placeholder="Marcus Aurelius"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-dark)] rounded-xl focus:border-[var(--accent-orange)] outline-none text-white text-sm"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-dark)] rounded-xl focus:border-[var(--accent-orange)] outline-none text-white text-sm"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="space-y-1.5 pb-2">
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">Role</label>
              <select
                className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-dark)] rounded-xl focus:border-[var(--accent-orange)] outline-none text-white text-sm appearance-none cursor-pointer"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="MEMBER">Standard Member</option>
                <option value="ADMIN">System Admin</option>
              </select>
            </div>

            <button type="submit" className="btn-primary w-full py-3.5 text-sm uppercase tracking-widest font-black">
              Create Account
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[13px] text-[var(--text-muted)]">
              Already a member? <Link to="/login" className="text-white font-bold hover:text-[var(--accent-orange)] transition-colors">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
