import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { format, isPast, isToday } from 'date-fns';
import { Plus, X, MoreVertical, MessageSquare, Trash2, UserPlus, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

// -------------------------------------------------------------
// Sub-components
// -------------------------------------------------------------

const PriorityBadge = ({ priority }) => {
  const colors = {
    LOW: 'bg-slate-100 text-slate-700',
    MEDIUM: 'bg-blue-100 text-blue-700',
    HIGH: 'bg-orange-100 text-orange-700',
    CRITICAL: 'bg-red-100 text-red-700',
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm ${colors[priority]}`}>{priority}</span>;
};

const TaskCard = ({ task, onClick }) => {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && !isToday(new Date(task.dueDate)) && task.status !== 'DONE';
  return (
    <div
      onClick={() => onClick(task)}
      className={`bg-white p-3 mb-3 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-all group
        ${isOverdue ? 'border-red-400 bg-red-50/30' : 'border-slate-200'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <PriorityBadge priority={task.priority} />
        {task.comments?.length > 0 && (
          <div className="flex items-center text-xs text-slate-400 gap-1">
            <MessageSquare className="w-3 h-3" />
            {task.comments.length}
          </div>
        )}
      </div>
      <h4 className="text-sm font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
        {task.title}
      </h4>
      <div className="flex justify-between items-center mt-3">
        {task.dueDate ? (
          <div className={`text-[11px] font-medium flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-slate-500'}`}>
            <Clock className="w-3 h-3" />
            {format(new Date(task.dueDate), 'MMM d')}
          </div>
        ) : (
          <div />
        )}
        {task.assignee && (
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700" title={task.assignee.name}>
            {task.assignee.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
};

const TaskDrawer = ({ isOpen, onClose, projectId, projectMembers, onTaskAdded }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/tasks/project/${projectId}`, {
        title,
        description,
        priority,
        dueDate: dueDate || undefined,
        assigneeId: assigneeId || undefined
      });
      toast.success('Task created');
      onTaskAdded();
      onClose();
      // Reset form
      setTitle(''); setDescription(''); setPriority('MEDIUM'); setDueDate(''); setAssigneeId('');
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-900">New Task</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          <form id="task-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title *</label>
              <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" placeholder="E.g. Design homepage mockup" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Add more details..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign To</label>
              <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                <option value="">Unassigned</option>
                {projectMembers.map(m => (
                  <option key={m.userId} value={m.userId}>{m.user.name}</option>
                ))}
              </select>
            </div>
          </form>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Cancel</button>
          <button form="task-form" type="submit" disabled={loading} className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-70">
            {loading ? 'Saving...' : 'Create Task'}
          </button>
        </div>
      </div>
    </>
  );
};

const TaskDetailModal = ({ task, onClose, onTaskUpdated }) => {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!task) return null;

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/tasks/${task.id}`, { status: newStatus });
      toast.success('Status updated');
      onTaskUpdated();
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      await api.post(`/tasks/${task.id}/comments`, { content: commentText });
      setCommentText('');
      onTaskUpdated(); // Refresh task to see new comment
    } catch (e) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${task.id}`);
      toast.success('Task deleted');
      onTaskUpdated();
      onClose();
    } catch (e) {
      toast.error('Failed to delete task');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-xl z-10 flex flex-col relative animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-start p-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <PriorityBadge priority={task.priority} />
              <select 
                value={task.status} 
                onChange={e => handleStatusChange(e.target.value)}
                className="text-xs font-semibold bg-slate-100 border-none rounded-md py-1 px-2 cursor-pointer focus:ring-0"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 leading-tight pr-8">{task.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDeleteTask} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Task">
              <Trash2 className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-slate-500 mb-1">Assignee</span>
              <div className="flex items-center gap-2 text-slate-900 font-medium">
                {task.assignee ? (
                  <>
                    <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-700">
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </div>
                    {task.assignee.name}
                  </>
                ) : 'Unassigned'}
              </div>
            </div>
            <div>
              <span className="block text-slate-500 mb-1">Due Date</span>
              <span className="text-slate-900 font-medium">
                {task.dueDate ? format(new Date(task.dueDate), 'MMMM d, yyyy') : 'No due date'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">Description</h4>
            <p className="text-slate-600 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
          </div>

          {/* Comments */}
          <div className="border-t border-slate-100 pt-6">
            <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-slate-400" />
              Activity & Comments
            </h4>
            <div className="space-y-4 mb-6">
              {task.comments?.length > 0 ? task.comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                    {c.author.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg rounded-tl-none flex-1">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="font-semibold text-sm text-slate-900">{c.author.name}</span>
                      <span className="text-xs text-slate-400">{format(new Date(c.createdAt), 'MMM d, h:mm a')}</span>
                    </div>
                    <p className="text-sm text-slate-700">{c.content}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-400 text-center py-4">No comments yet.</p>
              )}
            </div>
            
            <form onSubmit={handleAddComment} className="flex gap-3">
              <input 
                type="text" 
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder="Write a comment..." 
                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 focus:bg-white transition-colors"
              />
              <button 
                type="submit" 
                disabled={submitting || !commentText.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:hover:bg-indigo-600"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// Main Component
// -------------------------------------------------------------

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  
  const [project, setProject] = useState(null);
  const [activeTab, setActiveTab] = useState('TASKS'); // TASKS, MEMBERS, OVERVIEW
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // New Member State (Admin)
  const [allUsers, setAllUsers] = useState([]);
  const [newMemberId, setNewMemberId] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('MEMBER');

  const fetchProjectData = async () => {
    try {
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
      
      if (isAdmin && activeTab === 'MEMBERS' && allUsers.length === 0) {
        const usersRes = await api.get('/users');
        setAllUsers(usersRes.data);
      }
    } catch (error) {
      toast.error('Failed to load project details');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id, activeTab]);

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project forever?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (e) {
      toast.error('Failed to delete project');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberId) return;
    try {
      await api.post(`/projects/${id}/members`, { userId: newMemberId, role: newMemberRole });
      toast.success('Member added');
      setNewMemberId('');
      fetchProjectData();
    } catch (e) {
      toast.error('Failed to add member');
    }
  };

  const handleRemoveMember = async (uid) => {
    if (!window.confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${uid}`);
      toast.success('Member removed');
      fetchProjectData();
    } catch (e) {
      toast.error('Failed to remove member');
    }
  };

  if (loading || !project) {
    return <div className="animate-pulse space-y-4">
      <div className="h-20 bg-slate-200 rounded-xl"></div>
      <div className="h-10 bg-slate-200 rounded-lg w-1/3"></div>
      <div className="h-[500px] bg-slate-100 rounded-2xl"></div>
    </div>;
  }

  // Calculate Progress
  const totalTasks = project.tasks.length;
  const doneTasks = project.tasks.filter(t => t.status === 'DONE').length;
  const progress = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  // Kanban Columns
  const todoTasks = project.tasks.filter(t => t.status === 'TODO');
  const inProgressTasks = project.tasks.filter(t => t.status === 'IN_PROGRESS');
  const doneTasksList = project.tasks.filter(t => t.status === 'DONE');

  return (
    <div className="h-full flex flex-col -m-8">
      {/* Header Banner */}
      <div className="bg-white px-8 pt-8 pb-4 border-b border-slate-200 shrink-0">
        <div className="flex justify-between items-start mb-6">
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm" style={{ backgroundColor: project.colorTag || '#6366f1' }}>
              <span className="text-white font-bold text-xl">{project.name.charAt(0)}</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">{project.name}</h1>
              <p className="text-sm text-slate-500 max-w-2xl">{project.description}</p>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2">
              <button onClick={handleDeleteProject} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Project">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <div className="flex items-end justify-between">
          {/* Tabs */}
          <div className="flex gap-6 border-b-2 border-transparent">
            {['TASKS', ...(isAdmin ? ['MEMBERS'] : []), 'OVERVIEW'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-semibold capitalize relative ${
                  activeTab === tab ? 'text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.toLowerCase()}
                {activeTab === tab && (
                  <span className="absolute bottom-[-2px] left-0 right-0 h-[2px] bg-indigo-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className="pb-4 flex items-center gap-6 hidden sm:flex">
            <div className="w-48">
              <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className="flex -space-x-2">
              {project.members.slice(0, 5).map((m, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-xs font-bold text-indigo-700" title={m.user.name}>
                  {m.user.name.charAt(0)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-slate-50 p-8">
        
        {/* TASKS TAB */}
        {activeTab === 'TASKS' && (
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900">Board</h2>
              <button
                onClick={() => setIsTaskDrawerOpen(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Add Task
              </button>
            </div>
            
            <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
              {/* TODO Column */}
              <div className="w-80 shrink-0 flex flex-col bg-slate-100/50 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between px-1 mb-4">
                  <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">To Do</h3>
                  <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">{todoTasks.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {todoTasks.map(task => <TaskCard key={task.id} task={task} onClick={setSelectedTask} />)}
                </div>
              </div>

              {/* IN_PROGRESS Column */}
              <div className="w-80 shrink-0 flex flex-col bg-slate-100/50 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between px-1 mb-4">
                  <h3 className="font-bold text-amber-700 text-sm uppercase tracking-wide">In Progress</h3>
                  <span className="bg-amber-200 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {inProgressTasks.map(task => <TaskCard key={task.id} task={task} onClick={setSelectedTask} />)}
                </div>
              </div>

              {/* DONE Column */}
              <div className="w-80 shrink-0 flex flex-col bg-slate-100/50 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center justify-between px-1 mb-4">
                  <h3 className="font-bold text-emerald-700 text-sm uppercase tracking-wide">Done</h3>
                  <span className="bg-emerald-200 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">{doneTasksList.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {doneTasksList.map(task => <TaskCard key={task.id} task={task} onClick={setSelectedTask} />)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MEMBERS TAB */}
        {activeTab === 'MEMBERS' && isAdmin && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Manage Members</h2>
            
            <form onSubmit={handleAddMember} className="flex gap-4 mb-8 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-700 mb-1">Select User</label>
                <select value={newMemberId} onChange={e => setNewMemberId(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="">Choose a user...</option>
                  {allUsers.filter(u => !project.members.find(pm => pm.userId === u.id)).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="w-48">
                <label className="block text-sm font-medium text-slate-700 mb-1">Project Role</label>
                <select value={newMemberRole} onChange={e => setNewMemberRole(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <button type="submit" disabled={!newMemberId} className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2">
                <UserPlus className="w-4 h-4" /> Add
              </button>
            </form>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Project Role</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {project.members.map(m => (
                    <tr key={m.userId} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3 font-medium text-slate-900 flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {m.user.name.charAt(0)}
                        </div>
                        {m.user.name}
                      </td>
                      <td className="px-4 py-3">{m.user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${m.role === 'ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                          {m.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleRemoveMember(m.userId)} className="text-red-500 hover:text-red-700 font-medium text-xs">Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* OVERVIEW TAB */}
        {activeTab === 'OVERVIEW' && (
          <div className="max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Activity Timeline</h2>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
              {project.activities.length === 0 ? (
                <p className="text-slate-500 italic pl-10">No activity yet.</p>
              ) : project.activities.map(act => (
                <div key={act.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  {/* Icon */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white bg-indigo-100 text-indigo-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <span className="text-[10px] font-bold">{act.user.name.charAt(0)}</span>
                  </div>
                  {/* Card */}
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-slate-900 text-sm">{act.user.name}</h4>
                      <time className="text-xs font-medium text-slate-400">{format(new Date(act.createdAt), 'MMM d, h:mm a')}</time>
                    </div>
                    <p className="text-sm text-slate-600">{act.action.toLowerCase().replace('_', ' ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <TaskDrawer 
        isOpen={isTaskDrawerOpen} 
        onClose={() => setIsTaskDrawerOpen(false)} 
        projectId={id} 
        projectMembers={project.members}
        onTaskAdded={fetchProjectData}
      />

      <TaskDetailModal
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onTaskUpdated={() => {
          fetchProjectData();
          // The modal closes on delete, but on update it stays open. We need to refresh the selected task.
          if (selectedTask) {
             api.get(`/projects/${id}`).then(res => {
               const updatedTask = res.data.tasks.find(t => t.id === selectedTask.id);
               if (updatedTask) setSelectedTask(updatedTask);
             });
          }
        }}
      />
    </div>
  );
};

export default ProjectDetails;
