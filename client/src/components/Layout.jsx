import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  LogOut, 
  Bell, 
  Settings,
  Search,
  HelpCircle
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => 
      isActive ? 'nav-link-active' : 'nav-link'
    }
  >
    <Icon className="w-5 h-5" />
    <span className="text-sm">{label}</span>
  </NavLink>
);

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-[#0F172A] border-r border-slate-800 p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FolderKanban className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-display font-extrabold text-white tracking-tight">TaskFlow</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarLink to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink to="/projects" icon={FolderKanban} label="Projects" />
          {isAdmin && <SidebarLink to="/team" icon={Users} label="Team Management" />}
        </nav>

        <div className="pt-6 border-t border-slate-800 space-y-1">
          <button className="nav-link w-full">
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </button>
          <button onClick={handleLogout} className="nav-link w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
            <LogOut className="w-5 h-5" />
            <span className="text-sm">Logout</span>
          </button>
        </div>

        <div className="mt-8 p-4 bg-slate-800/50 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4 flex-1 max-w-xl">
            <div className="relative w-full max-w-sm group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search projects, tasks, or members..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <button className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
              <HelpCircle className="w-5 h-5" />
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2" />
            <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 p-0.5">
              <div className="w-full h-full rounded-[10px] bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Outlet />
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden h-16 bg-white border-t border-slate-200 flex items-center justify-around px-2 shrink-0">
          <NavLink to="/dashboard" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold">Dashboard</span>
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
            <FolderKanban className="w-5 h-5" />
            <span className="text-[10px] font-bold">Projects</span>
          </NavLink>
          {isAdmin && (
            <NavLink to="/team" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-bold">Team</span>
            </NavLink>
          )}
          <button onClick={handleLogout} className="flex flex-col items-center gap-1 p-2 text-slate-400">
            <LogOut className="w-5 h-5" />
            <span className="text-[10px] font-bold">Exit</span>
          </button>
        </nav>
      </main>
    </div>
  );
};

export default Layout;
