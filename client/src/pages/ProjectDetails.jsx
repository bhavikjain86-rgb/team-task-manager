import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { 
  Plus, 
  X, 
  MoreVertical, 
  MessageSquare, 
  Trash2, 
  Clock, 
  ChevronLeft,
  AlertCircle,
  Hash,
  Send,
  Calendar,
  CheckCircle2,
  Circle,
  Flag,
  User,
  Paperclip,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getPriorityStyles, isOverdue, timeAgo } from '../utils/helpers';

const TaskModal = ({ task: initialTask, onClose, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [task, setTask] = useState(initialTask);
  const [isEditing, setIsEditing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (updates) => {
    try {
      const res = await api.patch(`/tasks/${task.id}`, updates);
      setTask({ ...task, ...res.data });
      onUpdate?.();
    } catch (e) {
      toast.error('Failed to update task');
    }
  };

  const handleComment = async (e) => {
    if (e) e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await api.post(`/tasks/${task.id}/comments`, { content: newComment });
      setNewComment('');
      // Refresh task to get new comment
      const res = await api.get(`/projects/${task.projectId}`);
      const updatedTask = res.data.tasks.find(t => t.id === task.id);
      setTask(updatedTask);
      onUpdate?.();
    } catch (e) {
      toast.error('Failed to post comment');
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleComment();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="bg-card-dark w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl relative border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-accent-orange/10 rounded-xl text-accent-orange">
                <Hash className="w-5 h-5" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-muted">Task Detail</span>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => onDelete(task.id)} className="p-2.5 text-muted hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all">
                <Trash2 className="w-5 h-5" />
             </button>
             <button onClick={onClose} className="p-2.5 text-muted hover:text-white hover:bg-white/5 rounded-xl transition-all">
                <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row custom-scrollbar">
          {/* Main Info */}
          <div className="flex-[2] p-8 space-y-8 border-r border-white/5">
             <div className="space-y-4">
                <input 
                  className="text-3xl font-black bg-transparent border-none outline-none w-full placeholder:text-white/10"
                  value={task.title}
                  onChange={(e) => setTask({...task, title: e.target.value})}
                  onBlur={() => handleUpdate({ title: task.title })}
                />
                
                <div className="flex flex-wrap gap-4 items-center">
                   <div className="flex bg-app p-1 rounded-xl border border-white/5">
                      {['TODO', 'IN_PROGRESS', 'DONE'].map(s => (
                        <button
                          key={s}
                          onClick={() => handleUpdate({ status: s })}
                          className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                            task.status === s ? 'bg-white text-app shadow-lg' : 'text-muted hover:text-white'
                          }`}
                        >
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                   </div>
                   
                   <div className="flex gap-1 bg-app p-1 rounded-xl border border-white/5">
                      {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map(p => (
                        <button
                          key={p}
                          onClick={() => handleUpdate({ priority: p })}
                          title={p}
                          className={`p-1.5 rounded-lg transition-all ${
                            task.priority === p ? getPriorityStyles(p).bg + ' ' + getPriorityStyles(p).text : 'text-muted hover:text-white'
                          }`}
                        >
                          <Flag className="w-4 h-4" />
                        </button>
                      ))}
                   </div>
                </div>
             </div>

             <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted uppercase tracking-widest font-black text-[10px]">
                   <Circle className="w-3 h-3 text-accent-orange fill-accent-orange" />
                   <span>Description</span>
                </div>
                <textarea 
                  className="w-full h-40 bg-white/[0.03] border border-white/5 rounded-2xl p-4 text-sm leading-relaxed outline-none focus:border-white/20 transition-all resize-none placeholder:text-white/10"
                  placeholder="Add a detailed description for this task..."
                  value={task.description || ''}
                  onChange={(e) => setTask({...task, description: e.target.value})}
                  onBlur={() => handleUpdate({ description: task.description })}
                />
             </div>

             {/* Comments */}
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-muted uppercase tracking-widest font-black text-[10px]">
                   <MessageSquare className="w-3 h-3" />
                   <span>Activity & Comments</span>
                </div>
                
                <div className="space-y-4">
                   {task.comments?.map(c => (
                     <div key={c.id} className="flex gap-4 group">
                        <div className="w-8 h-8 rounded-full bg-accent-orange/10 flex items-center justify-center text-accent-orange font-bold text-xs uppercase">
                           {c.author?.name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 bg-white/[0.03] rounded-2xl p-4 border border-white/5">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-white">{c.author?.name || 'Unknown'}</span>
                              <span className="text-[10px] text-muted">{timeAgo(c.createdAt)}</span>
                           </div>
                           <p className="text-sm text-white/80 leading-relaxed">{c.content}</p>
                        </div>
                     </div>
                   ))}
                </div>

                <div className="relative mt-6">
                   <textarea 
                     className="w-full bg-app border border-white/10 rounded-2xl p-4 pr-16 text-sm outline-none focus:border-accent-orange transition-all min-h-[100px] custom-scrollbar"
                     placeholder="Add a comment... (Ctrl+Enter to send)"
                     value={newComment}
                     onChange={(e) => setNewComment(e.target.value)}
                     onKeyDown={handleKeyDown}
                   />
                   <button 
                     onClick={handleComment}
                     className="absolute bottom-4 right-4 p-2 bg-accent-orange text-white rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-orange-950/20"
                   >
                      <Send className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>

          {/* Sidebar Info */}
          <div className="flex-1 bg-white/[0.01] p-8 space-y-8">
             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted">Assignee</label>
                   <div className="flex items-center gap-3 p-3 bg-app rounded-2xl border border-white/5">
                      <div className="w-10 h-10 rounded-full bg-accent-orange/10 flex items-center justify-center text-accent-orange font-black">
                         {task.assignee?.name?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold truncate">{task.assignee?.name || 'Unassigned'}</p>
                         <p className="text-[10px] font-bold text-muted uppercase tracking-tighter">Primary Member</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted">Due Date</label>
                   <div className={`flex items-center gap-3 p-3 bg-app rounded-2xl border ${isOverdue(task.dueDate, task.status) ? 'border-rose-500/30' : 'border-white/5'}`}>
                      <Calendar className={`w-5 h-5 ${isOverdue(task.dueDate, task.status) ? 'text-rose-400' : 'text-muted'}`} />
                      <input 
                        type="date"
                        className="bg-transparent border-none outline-none text-sm font-bold text-white w-full"
                        value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleUpdate({ dueDate: e.target.value })}
                      />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-muted">Subscribers</label>
                   <div className="flex -space-x-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-app border-2 border-card-dark flex items-center justify-center text-[10px] font-bold text-white">
                           {String.fromCharCode(64+i)}
                        </div>
                      ))}
                      <button className="w-8 h-8 rounded-full bg-white/5 border-2 border-card-dark border-dashed flex items-center justify-center text-muted hover:text-white transition-all">
                         <Plus className="w-4 h-4" />
                      </button>
                   </div>
                </div>
             </div>

             <div className="pt-8 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-muted uppercase tracking-widest">
                   <Clock className="w-3.5 h-3.5" />
                   <span>Metadata</span>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between items-center text-[11px]">
                      <span className="text-muted">Created By</span>
                      <span className="text-white font-medium">{task.assignee?.name || 'System'}</span>
                   </div>
                   <div className="flex justify-between items-center text-[11px]">
                      <span className="text-muted">Created At</span>
                      <span className="text-white font-medium">{new Date(task.createdAt).toLocaleDateString()}</span>
                   </div>
                   <div className="flex justify-between items-center text-[11px]">
                      <span className="text-muted">Last Active</span>
                      <span className="text-white font-medium">{timeAgo(task.updatedAt)}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onClick }) => {
  const overdue = isOverdue(task.dueDate, task.status);
  return (
    <div
      onClick={() => onClick(task)}
      className={`bg-white/[0.03] rounded-2xl p-4 mb-3 border border-white/5 cursor-pointer hover:bg-white/[0.05] hover:border-white/20 hover:shadow-2xl transition-all group relative overflow-hidden ${getPriorityStyles(task.priority).border}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-1.5 flex-wrap">
           <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${getPriorityStyles(task.priority).bg} ${getPriorityStyles(task.priority).text}`}>
             {task.priority}
           </span>
           {overdue && (
             <span className="text-[9px] font-black bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded uppercase tracking-tighter flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5" />
                Overdue
             </span>
           )}
        </div>
        <MoreVertical className="w-4 h-4 text-white/10 group-hover:text-white transition-colors" />
      </div>
      
      <h4 className="text-sm font-bold text-white mb-4 line-clamp-2 leading-snug tracking-tight group-hover:text-accent-orange transition-colors">
        {task.title}
      </h4>

      <div className="flex justify-between items-center mt-auto">
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1 text-[10px] font-bold text-muted">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{task.comments?.length || 0}</span>
           </div>
           <div className="flex items-center gap-1 text-[10px] font-bold text-muted">
              <Calendar className="w-3.5 h-3.5" />
              <span className={overdue ? 'text-rose-400' : ''}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</span>
           </div>
        </div>
        <div className="w-6 h-6 rounded-full bg-accent-orange/20 border-2 border-app flex items-center justify-center text-[8px] font-black text-accent-orange uppercase shadow-lg">
          {task.assignee?.name?.charAt(0) || '?'}
        </div>
      </div>
    </div>
  );
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TASKS');
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchProject = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      document.title = `${res.data.name} | TaskFlow`;
    } catch (error) {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task removed');
      setSelectedTask(null);
      fetchProject();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  if (loading || !project) return <div className="p-8 text-white flex items-center gap-3"><RefreshCw className="w-5 h-5 animate-spin" /> Loading workspace...</div>;

  const tasks = project.tasks || [];
  const todoTasks = tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasks = tasks.filter(t => t.status === 'DONE');

  return (
    <div className="flex flex-col h-full -m-4 md:-m-8">
      {/* Header Banner */}
      <div className="bg-app px-4 md:px-8 pt-8 pb-4 border-b border-white/5 shrink-0">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/projects')} className="p-2.5 hover:bg-white/5 rounded-xl text-muted hover:text-white transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-accent-orange flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-orange-950/40">
              {project?.name?.charAt(0) || '?'}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white leading-tight tracking-tight">{project.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-accent-green/10 text-accent-green rounded">{project.status}</span>
                <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">Last synced {timeAgo(project.updatedAt)}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="hidden lg:flex -space-x-3 mr-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-9 h-9 rounded-full bg-app border-4 border-app flex items-center justify-center text-[10px] font-black text-white hover:z-10 transition-all cursor-pointer">
                     {String.fromCharCode(64+i)}
                  </div>
                ))}
                <button className="w-9 h-9 rounded-full bg-white/5 border-4 border-app border-dashed flex items-center justify-center text-muted hover:text-white transition-all">
                   <Plus className="w-4 h-4" />
                </button>
             </div>
             <button className="bg-accent-orange text-white font-bold py-2 px-5 rounded-xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-orange-950/20 text-sm">
                Project Settings
             </button>
          </div>
        </div>

        <div className="flex gap-8">
          {['TASKS', 'OVERVIEW', 'MEMBERS', 'FILES'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 text-xs font-black tracking-widest relative transition-all ${
                activeTab === tab ? 'text-white' : 'text-muted hover:text-white'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent-orange rounded-full animate-in fade-in zoom-in-50 duration-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto p-4 md:p-8 bg-[#151515]/50 custom-scrollbar">
        <div className="flex gap-6 h-full min-w-max">
          {[
            { title: 'To Do', status: 'TODO', tasks: todoTasks, color: 'text-white' },
            { title: 'In Progress', status: 'IN_PROGRESS', tasks: inProgressTasks, color: 'text-accent-orange' },
            { title: 'Done', status: 'DONE', tasks: doneTasks, color: 'text-accent-green' }
          ].map((col, i) => (
            <div key={i} className="w-[340px] flex flex-col group/col">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <h3 className={`text-[11px] font-black uppercase tracking-[0.2em] ${col.color}`}>{col.title}</h3>
                  <span className="bg-white/5 text-muted text-[10px] font-black px-2 py-0.5 rounded border border-white/5 group-hover/col:border-white/20 transition-all">{col.tasks.length}</span>
                </div>
                <div className="flex gap-2">
                   <button className="p-1 text-muted hover:text-white transition-all"><Plus className="w-4 h-4" /></button>
                   <button className="p-1 text-muted hover:text-white transition-all"><MoreHorizontal className="w-4 h-4" /></button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-10">
                {col.tasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onClick={setSelectedTask} 
                  />
                ))}
                
                {/* Column Level Add Button */}
                <button 
                  className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center gap-2 text-muted hover:border-white/20 hover:text-white hover:bg-white/[0.02] transition-all group/add mt-2"
                >
                   <Plus className="w-5 h-5 group-hover/add:scale-125 transition-transform" />
                   <span className="text-xs font-bold">Add Task</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedTask && (
        <TaskModal 
          task={selectedTask} 
          onClose={() => setSelectedTask(null)} 
          onUpdate={fetchProject}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

export default ProjectDetails;
