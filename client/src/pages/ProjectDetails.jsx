import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Plus, X, MoreVertical, MessageSquare, Trash2, Clock, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const TaskCard = ({ task, onClick }) => {
  return (
    <div
      onClick={() => onClick(task)}
      className="bg-white rounded-[16px] p-4 mb-3 border border-slate-100 shadow-sm cursor-pointer hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
          task.priority === 'HIGH' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
        }`}>
          {task.priority}
        </span>
        <MoreVertical className="w-4 h-4 text-slate-300 group-hover:text-slate-500" />
      </div>
      <h4 className="text-[13px] font-semibold text-[var(--text-dark)] mb-3 line-clamp-2">
        {task.title}
      </h4>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <Clock className="w-3.5 h-3.5" />
          <span>Jun 24</span>
        </div>
        <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
          {task.assignee?.name.charAt(0) || 'U'}
        </div>
      </div>
    </div>
  );
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TASKS');

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (error) {
        toast.error('Failed to load project');
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    };
    fetchProjectData();
  }, [id]);

  if (loading || !project) return <div className="p-8 text-white">Loading workspace...</div>;

  const todoTasks = project.tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = project.tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = project.tasks.filter(t => t.status === 'DONE');

  return (
    <div className="flex flex-col h-full -m-8">
      {/* Header Banner */}
      <div className="bg-[var(--bg-app)] px-8 pt-8 pb-4 border-b border-[var(--border-dark)] shrink-0">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/projects')} className="p-2 hover:bg-white/5 rounded-lg text-[var(--text-muted)] hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-orange)] flex items-center justify-center text-white font-bold text-lg">
              {project.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white leading-tight">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge-in-progress">Active</span>
                <span className="text-xs text-[var(--text-muted)] font-medium">Updated 2h ago</span>
              </div>
            </div>
          </div>
          <button className="btn-pill-dark">
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        <div className="flex gap-8">
          {['TASKS', 'OVERVIEW', 'MEMBERS'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-sm font-bold tracking-tight relative ${
                activeTab === tab ? 'text-white' : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-orange)] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-8 bg-[#151515]">
        <div className="flex gap-6 h-full min-w-max">
          {[
            { title: 'To Do', tasks: todoTasks, color: 'text-white' },
            { title: 'In Progress', tasks: inProgressTasks, color: 'text-[var(--accent-orange)]' },
            { title: 'Done', tasks: doneTasks, color: 'text-[var(--accent-green)]' }
          ].map((col, i) => (
            <div key={i} className="w-[320px] flex flex-col">
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                  <h3 className={`text-[13px] font-bold uppercase tracking-widest ${col.color}`}>{col.title}</h3>
                  <span className="bg-white/5 text-[var(--text-muted)] text-[10px] font-black px-1.5 py-0.5 rounded border border-white/5">{col.tasks.length}</span>
                </div>
                <Plus className="w-4 h-4 text-[var(--text-muted)] cursor-pointer hover:text-white" />
              </div>
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {col.tasks.map(task => <TaskCard key={task.id} task={task} onClick={() => {}} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
