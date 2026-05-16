import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FolderKanban } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
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
          <h1 className="text-[28px] font-bold text-white tracking-tight">Welcome Back</h1>
          <p className="text-[var(--text-muted)] mt-2">Sign in to manage your workspace</p>
        </div>

        <div className="card-base card-understand p-8 border border-[var(--border-dark)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest px-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-dark)] rounded-xl focus:border-[var(--accent-orange)] outline-none text-white text-sm transition-all"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between px-1">
                <label className="text-[12px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Password</label>
                <a href="#" className="text-[11px] font-bold text-[var(--accent-orange)] hover:underline">Forgot?</a>
              </div>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-[var(--bg-app)] border border-[var(--border-dark)] rounded-xl focus:border-[var(--accent-orange)] outline-none text-white text-sm transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary w-full py-3.5 text-sm uppercase tracking-widest font-black shadow-lg shadow-orange-500/10">
              Sign In
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[13px] text-[var(--text-muted)]">
              New here? <Link to="/signup" className="text-white font-bold hover:text-[var(--accent-orange)] transition-colors">Create account</Link>
            </p>
          </div>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
          <p className="text-[11px] text-white/40 font-medium text-center">
            Demo: admin@taskflow.com / Admin@123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
