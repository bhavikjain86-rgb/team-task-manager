import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Search, Plus, X, FolderOpen, Calendar, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ProjectCard = ({ project, onClick }) => {
  return (
    <div 
      onClick={() => onClick(project.id)}
      className="bg-card-dark rounded-card p-6 hover:bg-[#2a2a2a] transition-all cursor-pointer border border-white/5 group"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent-orange flex items-center justify-center text-white font-bold text-lg">
            {project.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-white group-hover:text-accent-orange transition-colors">
              {project.name}
            </h3>
            <span className="text-[11px] font-medium text-muted uppercase tracking-widest">{project.status}</span>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-muted group-hover:text-white transition-colors" />
      </div>

      <p className="text-[13px] text-muted leading-relaxed line-clamp-2 mb-6">
        {project.description || 'No description provided.'}
      </p>

      <div className="flex justify-between items-center pt-6 border-t border-white/5">
        <div className="flex items-center gap-2 text-muted">
          <Calendar className="w-4 h-4" />
          <span className="text-[12px] font-medium">Jun 2026</span>
        </div>
        <div className="flex -space-x-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-7 h-7 rounded-full bg-card-dark border-2 border-app flex items-center justify-center text-[10px] font-bold text-white">
              {String.fromCharCode(64 + i)}
            </div>
          ))}
        </div>
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

  useEffect(() => {
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
    fetchProjects();
  }, []);

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 bg-app min-h-screen">
      <div className="flex justify-between items-center">
        <h1 className="text-[28px] font-bold text-white">Projects</h1>
        {isAdmin && (
          <button className="bg-accent-orange text-white font-bold py-2.5 px-6 rounded-[12px] hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-orange-500/10">
            <Plus className="w-5 h-5" />
            <span>Launch Project</span>
          </button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-6 py-3 bg-card-dark border border-white/5 rounded-card focus:outline-none focus:border-accent-orange text-white text-sm"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-card-dark rounded-card animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={(id) => navigate(`/projects/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Projects;
