import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  LogOut, 
  Settings,
  ChevronDown,
  RefreshCw,
  BarChart3
} from 'lucide-react';

const SidebarIcon = ({ to, icon: Icon }) => (
  <NavLink
    to={to}
    className={({ isActive }) => 
      `w-12 h-12 flex items-center justify-center rounded-xl transition-all ${
        isActive ? 'text-white' : 'text-[#555555] hover:text-white'
      }`
    }
  >
    <Icon className="w-6 h-6" />
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
    <div className="flex h-screen bg-app font-sans text-white">
      {/* Sidebar - Icons Only */}
      <aside className="w-[60px] bg-sidebar flex flex-col items-center py-6 border-r border-white/5 shrink-0">
        <div className="mb-10 text-accent-orange">
          <FolderKanban className="w-8 h-8 fill-current" />
        </div>

        <nav className="flex-1 space-y-4">
          <SidebarIcon to="/dashboard" icon={LayoutDashboard} />
          <SidebarIcon to="/projects" icon={FolderKanban} />
          {isAdmin && <SidebarIcon to="/team" icon={Users} />}
        </nav>

        <div className="space-y-4">
          <button className="w-12 h-12 flex items-center justify-center text-[#555555] hover:text-white transition-all">
            <Settings className="w-6 h-6" />
          </button>
          <button onClick={handleLogout} className="w-12 h-12 flex items-center justify-center text-[#555555] hover:text-rose-500 transition-all">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-app">
        {/* Top Header */}
        <header className="h-16 bg-app px-8 flex items-center justify-between z-10 shrink-0">
          <div className="flex items-center gap-4">
            <button className="bg-[#2A2A2A] text-white font-medium py-1.5 px-4 rounded-full hover:bg-[#333] transition-all flex items-center gap-2 text-sm">
              <span>May 2026</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="bg-[#2A2A2A] text-white font-medium py-1.5 px-4 rounded-full hover:bg-[#333] transition-all flex items-center gap-2 text-sm">
              <BarChart3 className="w-4 h-4" />
              <span>Edit View</span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button className="bg-white text-app font-bold py-1.5 px-5 rounded-full hover:bg-slate-100 transition-all flex items-center gap-2 text-sm">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden">
              <div className="w-full h-full bg-accent-orange flex items-center justify-center text-white font-bold text-xs uppercase">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
