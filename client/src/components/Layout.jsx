import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, Users, LogOut } from 'lucide-react';

const Layout = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderKanban },
    ...(isAdmin ? [{ name: 'Team', path: '/team', icon: Users }] : [])
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <aside className="fixed bottom-0 w-full md:relative md:w-64 bg-white border-t md:border-t-0 md:border-r border-slate-200 flex md:flex-col justify-between z-50">
        <div className="flex flex-row md:flex-col w-full">
          {/* Logo - Hidden on mobile bottom bar, shown on desktop */}
          <div className="hidden md:flex h-16 items-center px-6 border-b border-slate-100">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
              TaskFlow
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-row md:flex-col justify-around md:justify-start md:p-4 md:space-y-1 overflow-x-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 px-3 py-3 md:py-2 flex-1 md:flex-none text-[10px] md:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-50 md:bg-indigo-600 text-indigo-700 md:text-white rounded-none md:rounded-md border-t-2 border-indigo-600 md:border-0'
                      : 'text-slate-500 hover:bg-slate-50 md:hover:bg-slate-100 hover:text-slate-900 border-t-2 border-transparent md:border-0 md:rounded-md'
                  }`
                }
              >
                <item.icon className="w-5 h-5 md:w-5 md:h-5" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* User Profile Block - Hidden on mobile */}
        <div className="hidden md:block p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${isAdmin ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-slate-600 rounded-md hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
        {/* Mobile Header (Shows Logo and Logout since bottom nav doesn't have it) */}
        <div className="md:hidden flex justify-between items-center bg-white p-4 border-b border-slate-200 sticky top-0 z-40">
          <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
            TaskFlow
          </span>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm border border-indigo-200">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-red-500">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
