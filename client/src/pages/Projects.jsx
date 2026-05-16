import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Search, Plus, X, FolderOpen, Calendar, Users as UsersIcon, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    COMPLETED: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    ARCHIVED: 'bg-slate-50 text-slate-500 border-slate-100'
  };
  return (
    <span className={`text-[10px] uppercase tracking-widest font-extrabold px-2.5 py-1 rounded-lg border ${styles[status]}`}>
      {status}
    </span>
  );
};

const ProjectCard = ({ project, onClick }) => {
  const totalTasks = project._count?.tasks || 0;
  const doneTasks = project.tasks?.filter(t => t.status === 'DONE').length || 0;
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const displayMembers = project.members?.slice(0, 4) || [];
  const extraMembers = Math.max(0, (project.members?.length || 0) - 4);

  return (
    <div 
      onClick={() => onClick(project.id)}
      className="bg-white rounded-[32px] p-7 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-inner" style={{ backgroundColor: project.colorTag || '#6366f1' }}>
            {project.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-display font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-tight">
              {project.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
               <StatusBadge status={project.status} />
            </div>
          </div>
        </div>
        <button className="p-1.5 text-slate-300 hover:text-slate-600 transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-8 flex-1">
        {project.description || 'Elevate your workflow with this specialized task management project.'}
      </p>

      <div className="space-y-4">
        <div className="flex justify-between items-end text-xs font-bold uppercase tracking-tighter">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400">Progress</span>
            <span className="text-slate-900">{progress}% Completed</span>
          </div>
          <span className="text-indigo-600">{doneTasks}/{totalTasks} Tasks</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden p-0.5">
          <div 
            className="bg-indigo-600 h-1 rounded-full transition-all duration-1000" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 mt-6 border-t border-slate-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-tight">
              {project.dueDate ? format(new Date(project.dueDate), 'MMM d') : 'No date'}
            </span>
          </div>
        </div>
        <div className="flex -space-x-2">
          {displayMembers.map((m, i) => (
            <div 
              key={i} 
              className="w-8 h-8 rounded-xl bg-slate-100 border-2 border-white flex items-center justify-center text-[11px] font-bold text-slate-600"
              title={m.user.name}
            >
              {m.user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {extraMembers > 0 && (
            <div className="w-8 h-8 rounded-xl bg-indigo-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-lg shadow-indigo-500/20">
              +{extraMembers}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NewProjectModal = ({ isOpen, onClose, onProjectCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [colorTag, setColorTag] = useState('#6366f1');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/projects', {
        name,
        description,
        colorTag,
        dueDate: dueDate || undefined
      });
      toast.success('New project launched successfully!');
      onProjectCreated(res.data);
      onClose();
    } catch (error) {
      toast.error('Failed to initiate project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0F172A]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-8 border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-display font-extrabold text-slate-900">Create New Project</h2>
            <p className="text-slate-400 text-sm font-medium">Define your goals and assemble the team.</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-50 text-slate-400 hover:text-slate-600 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Project Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all text-slate-900 font-semibold"
              placeholder="E.g. Quantum Core Engine"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all text-slate-900 font-semibold resize-none"
              rows={3}
              placeholder="Describe the scope and vision..."
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Deadline</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500/20 focus:bg-white outline-none transition-all text-slate-900 font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Identity Color</label>
              <div className="flex gap-4 items-center">
                <input
                  type="color"
                  value={colorTag}
                  onChange={e => setColorTag(e.target.value)}
                  className="w-14 h-14 p-1 bg-white border-4 border-slate-100 rounded-2xl cursor-pointer"
                />
                <span className="text-sm font-bold text-slate-400 font-mono uppercase">{colorTag}</span>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl transition-all shadow-xl shadow-indigo-500/20 disabled:opacity-70 disabled:shadow-none"
            >
              {loading ? 'Initializing...' : 'Launch Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Projects = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-display font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
            Active Projects
            <span className="bg-slate-900 text-white text-xs font-black px-3 py-1 rounded-full">
              {projects.length}
            </span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">Design, develop, and deploy with your team.</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/25 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search projects by identity or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all shadow-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          <button className="px-4 py-2 text-xs font-bold bg-slate-900 text-white rounded-xl">All</button>
          <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">Active</button>
          <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-slate-600">Archived</button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-72 bg-white rounded-[32px] border border-slate-100 animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={(id) => navigate(`/projects/${id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24 bg-white border-2 border-slate-100 border-dashed rounded-[40px] px-8">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
             <FolderOpen className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-display font-extrabold text-slate-900">
            {search ? 'No matches found.' : 'Your workspace is empty.'}
          </h3>
          <p className="text-slate-500 mt-2 mb-8 max-w-sm mx-auto font-medium">
            {search ? 'Try adjusting your search criteria.' : 'Kickstart your journey by creating a new high-impact project.'}
          </p>
          {isAdmin && !search && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-6 py-3 rounded-2xl font-bold hover:bg-indigo-100 transition-all"
            >
              <Plus className="w-5 h-5" /> Launch Project
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProjectCreated={fetchProjects}
      />
    </div>
  );
};

export default Projects;
