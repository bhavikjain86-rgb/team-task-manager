import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { 
  Search, 
  Plus, 
  X, 
  FolderOpen, 
  Calendar, 
  ChevronRight, 
  LayoutGrid, 
  List,
  Filter,
  ArrowUpDown,
  AlertCircle,
  Users as UsersIcon,
  CheckCircle2,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { TableSkeleton, CardSkeleton } from '../components/Skeleton';

const QuickStats = ({ projects }) => {
  const activeCount = projects.filter(p => p.status === 'ACTIVE').length;
  const totalTasks = projects.reduce((acc, p) => acc + (p.tasks?.length || 0), 0);
  const overdueTasks = projects.reduce((acc, p) => {
    return acc + (p.tasks?.filter(t => t.status !== 'DONE' && t.dueDate && new Date(t.dueDate) < new Date()).length || 0);
  }, 0);

  return (
    <div className="bg-accent-orange/5 border border-accent-orange/10 rounded-2xl p-4 flex items-center justify-around mb-8">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center text-accent-orange">
          <FolderOpen className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">Active Projects</p>
          <p className="text-xl font-bold text-white">{activeCount}</p>
        </div>
      </div>
      <div className="w-px h-10 bg-white/5" />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">Tasks Pending</p>
          <p className="text-xl font-bold text-white">{totalTasks}</p>
        </div>
      </div>
      <div className="w-px h-10 bg-white/5" />
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted">Overdue</p>
          <p className="text-xl font-bold text-white">{overdueTasks}</p>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('projectViewMode') || 'GRID');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await api.get('/projects');
        setProjects(res.data);
        document.title = "Projects | TaskFlow";
      } catch (error) {
        toast.error('Failed to fetch projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    localStorage.setItem('projectViewMode', viewMode);
  }, [viewMode]);

  const filteredProjects = projects
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'NEWEST') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'OLDEST') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'A-Z') return a.name.localeCompare(b.name);
      if (sortBy === 'MOST_TASKS') return (b.tasks?.length || 0) - (a.tasks?.length || 0);
      return 0;
    });

  return (
    <div className="space-y-6 bg-app min-h-screen pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-[28px] font-bold text-white tracking-tight">Projects</h1>
        {isAdmin && (
          <button className="bg-accent-orange text-white font-bold py-2.5 px-6 rounded-[12px] hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-orange-950/20 active:scale-95">
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </button>
        )}
      </div>

      {!loading && <QuickStats projects={projects} />}

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card-dark p-4 rounded-2xl border border-white/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-app border border-white/5 rounded-xl text-white text-sm focus:border-accent-orange outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex bg-app p-1 rounded-xl border border-white/5">
            {['ALL', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                  filterStatus === s ? 'bg-accent-orange text-white shadow-lg' : 'text-muted hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="h-8 w-px bg-white/5 hidden md:block" />

          <div className="relative flex-1 md:flex-initial">
             <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
             <select 
               className="bg-app border border-white/5 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-white appearance-none outline-none focus:border-accent-orange w-full"
               value={sortBy}
               onChange={(e) => setSortBy(e.target.value)}
             >
               <option value="NEWEST">Newest First</option>
               <option value="OLDEST">Oldest First</option>
               <option value="A-Z">Name A-Z</option>
               <option value="MOST_TASKS">Most Tasks</option>
             </select>
          </div>

          <div className="flex bg-app p-1 rounded-xl border border-white/5">
             <button 
               onClick={() => setViewMode('GRID')}
               className={`p-1.5 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-white/10 text-white' : 'text-muted hover:text-white'}`}
             >
               <LayoutGrid className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setViewMode('LIST')}
               className={`p-1.5 rounded-lg transition-all ${viewMode === 'LIST' ? 'bg-white/10 text-white' : 'text-muted hover:text-white'}`}
             >
               <List className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className={viewMode === 'GRID' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {[1, 2, 3, 4, 5, 6].map(i => viewMode === 'GRID' ? <CardSkeleton key={i} /> : <div key={i} className="h-16 animate-pulse bg-white/5 rounded-xl" />)}
        </div>
      ) : filteredProjects.length > 0 ? (
        viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map(project => (
              <div 
                key={project.id}
                onClick={() => navigate(`/projects/${project.id}`)}
                className="bg-card-dark rounded-card p-6 hover:bg-[#2a2a2a] transition-all cursor-pointer border border-white/5 group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-accent-orange opacity-0 group-hover:opacity-100 transition-all" />
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-orange/10 flex items-center justify-center text-accent-orange font-black text-xl">
                      {project.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-accent-orange transition-colors">{project.name}</h3>
                      <span className="text-[10px] font-black text-muted uppercase tracking-widest">{project.status}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted group-hover:text-white transition-colors group-hover:translate-x-1 transition-transform" />
                </div>
                
                <p className="text-sm text-muted leading-relaxed line-clamp-2 mb-6">
                  {project.description || 'Professional workspace for team collaboration and task management.'}
                </p>

                <div className="space-y-4 pt-6 border-t border-white/5">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="text-muted">Progress</span>
                    <span className="text-white">65%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="bg-accent-green h-full w-[65%]" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex -space-x-2">
                       {[1, 2, 3].map(i => (
                         <div key={i} className="w-7 h-7 rounded-full bg-app border-2 border-card-dark flex items-center justify-center text-[10px] font-bold text-white uppercase">
                           {String.fromCharCode(64+i)}
                         </div>
                       ))}
                    </div>
                    <div className="flex items-center gap-2 text-muted text-[10px] font-bold">
                       <Clock className="w-3 h-3" />
                       <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-card-dark rounded-card border border-white/5 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black uppercase tracking-widest text-muted border-b border-white/5">
                  <th className="px-6 py-4">Project Name</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Progress</th>
                  <th className="px-6 py-4 text-center">Team</th>
                  <th className="px-6 py-4 text-center">Tasks</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProjects.map(project => (
                  <tr 
                    key={project.id} 
                    className="hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <td className="px-6 py-4 flex items-center gap-4">
                       <div className="w-3 h-3 rounded-full bg-accent-orange" />
                       <span className="font-bold text-sm text-white">{project.name}</span>
                    </td>
                    <td className="px-6 py-4">
                       <span className="text-[10px] font-black px-2 py-1 bg-white/5 border border-white/10 rounded uppercase tracking-widest text-muted">{project.status}</span>
                    </td>
                    <td className="px-6 py-4 min-w-[150px]">
                       <div className="flex items-center gap-3">
                          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                             <div className="bg-accent-green h-full w-[65%]" />
                          </div>
                          <span className="text-[10px] font-black">65%</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <div className="flex items-center justify-center gap-1.5 text-sm font-bold text-white">
                          <UsersIcon className="w-4 h-4 text-muted" />
                          3
                       </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                       <span className="text-sm font-bold text-white">{project.tasks?.length || 0}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button className="p-2 text-muted group-hover:text-white">
                          <ChevronRight className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-card-dark rounded-3xl flex items-center justify-center text-muted mb-6">
            <FolderOpen className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">No projects found</h2>
          <p className="text-muted text-sm max-w-xs mx-auto mb-8">Create your first project to start managing tasks and team collaboration.</p>
          <button className="btn-primary">Create New Project</button>
        </div>
      )}
    </div>
  );
};

export default Projects;
