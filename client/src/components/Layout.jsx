import React, { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  LogOut, 
  Settings,
  Bell,
  Plus,
  Search,
  User,
  ChevronDown,
  RefreshCw,
  MoreVertical
} from 'lucide-react';
import GlobalSearch from './GlobalSearch';
import QuickAddTaskModal from './QuickAddTaskModal';
import api from '../api/axios';
import { timeAgo } from '../utils/helpers';

const SidebarIcon = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) => 
      `w-12 h-12 flex flex-col items-center justify-center rounded-xl transition-all relative group ${
        isActive ? 'text-white' : 'text-white/30 hover:text-white'
      }`
    }
  >
    <Icon className="w-5 h-5" />
    <span className="absolute left-full ml-4 px-2 py-1 bg-white text-app text-[10px] font-black uppercase rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">
      {label}
    </span>
  </NavLink>
);

const Layout = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const profileRef = useRef(null);
  const notificationsRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) setIsNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/dashboard/activity');
      setNotifications(res.data.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isNotificationsOpen) fetchNotifications();
  }, [isNotificationsOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-app font-sans text-white overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-[60px] bg-sidebar flex-col items-center py-6 border-r border-white/5 shrink-0 z-40">
        <div className="mb-10 text-accent-orange hover:scale-110 transition-transform cursor-pointer" onClick={() => navigate('/dashboard')}>
          <FolderKanban className="w-8 h-8 fill-current" />
        </div>

        <nav className="flex-1 space-y-6">
          <SidebarIcon to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <SidebarIcon to="/projects" icon={FolderKanban} label="Projects" />
          {isAdmin && <SidebarIcon to="/team" icon={Users} label="Workspace" />}
        </nav>

        <div className="mt-auto space-y-6">
          <button className="w-12 h-12 flex items-center justify-center text-white/30 hover:text-white transition-all group relative">
            <Settings className="w-5 h-5" />
            <span className="absolute left-full ml-4 px-2 py-1 bg-white text-app text-[10px] font-black uppercase rounded opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap z-50">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-app px-4 md:px-8 flex items-center justify-between z-30 shrink-0 border-b border-white/5">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-1.5 rounded-xl text-muted text-sm hover:bg-white/10 transition-all w-full max-w-xs group"
            >
              <Search className="w-4 h-4 group-hover:text-accent-orange transition-colors" />
              <span className="flex-1 text-left">Search...</span>
              <kbd className="hidden sm:inline-flex px-1.5 py-0.5 bg-app border border-white/10 rounded text-[10px] font-black">⌘K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsQuickAddOpen(true)}
              className="hidden sm:flex items-center gap-2 bg-accent-orange text-white px-4 py-1.5 rounded-xl font-bold text-sm hover:brightness-110 transition-all active:scale-95 shadow-lg shadow-orange-950/20"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Add</span>
            </button>

            <div className="relative" ref={notificationsRef}>
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 rounded-xl transition-all relative ${isNotificationsOpen ? 'bg-white/10 text-white' : 'text-muted hover:text-white hover:bg-white/5'}`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-accent-orange rounded-full border-2 border-app"></span>}
              </button>

              {isNotificationsOpen && (
                <div className="absolute top-full mt-2 right-0 w-80 bg-card-dark rounded-2xl shadow-2xl border border-white/10 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-white/5 flex justify-between items-center bg-app/50">
                    <h3 className="text-xs font-black uppercase tracking-widest">Recent Activity</h3>
                    <span className="text-[10px] font-bold text-accent-orange px-2 py-0.5 bg-accent-orange/10 rounded">LIVE</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? notifications.map((n, i) => (
                      <div key={i} className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all">
                        <p className="text-xs font-medium"><span className="text-white font-bold">{n.user.name}</span> {n.action.toLowerCase().replace(/_/g, ' ')}</p>
                        <p className="text-[10px] text-muted mt-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    )) : (
                      <div className="p-10 text-center text-muted text-xs font-medium">No recent notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-white/10 hover:border-white/30 transition-all bg-white/5 pr-3 active:scale-95"
              >
                <div className="w-8 h-8 rounded-full bg-accent-orange flex items-center justify-center text-white font-black text-xs">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <ChevronDown className={`w-4 h-4 text-muted transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <div className="absolute top-full mt-2 right-0 w-56 bg-card-dark rounded-2xl shadow-2xl border border-white/10 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b border-white/5 bg-app/50">
                    <p className="text-sm font-bold truncate">{user?.name}</p>
                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">{user?.role}</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-white/5 text-muted hover:text-white transition-all">
                      <User className="w-4 h-4" />
                      <span>My Profile</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium hover:bg-white/5 text-muted hover:text-white transition-all">
                      <Settings className="w-4 h-4" />
                      <span>Account Settings</span>
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar relative">
          <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500">
            <Outlet />
          </div>
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden h-16 bg-sidebar border-t border-white/5 flex items-center justify-around px-2 shrink-0 z-40">
          <NavLink to="/dashboard" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-accent-orange' : 'text-muted'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase">Home</span>
          </NavLink>
          <NavLink to="/projects" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-accent-orange' : 'text-muted'}`}>
            <FolderKanban className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase">Projects</span>
          </NavLink>
          <button 
             onClick={() => setIsQuickAddOpen(true)}
             className="flex flex-col items-center justify-center w-12 h-12 bg-accent-orange rounded-2xl shadow-lg -translate-y-4 border-4 border-app"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>
          {isAdmin && (
            <NavLink to="/team" className={({ isActive }) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-accent-orange' : 'text-muted'}`}>
              <Users className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase">Team</span>
            </NavLink>
          )}
          <button onClick={() => setIsProfileOpen(true)} className="flex flex-col items-center gap-1 p-2 text-muted">
            <User className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase">Account</span>
          </button>
        </nav>
      </main>

      {/* Global Overlays */}
      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <QuickAddTaskModal isOpen={isQuickAddOpen} onClose={() => setIsQuickAddOpen(false)} />
    </div>
  );
};

export default Layout;
