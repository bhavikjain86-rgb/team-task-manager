import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, Plus, Clock, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const QuickAddTaskModal = ({ isOpen, onClose, onSuccess }) => {
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    projectId: '',
    assigneeId: '',
    dueDate: '',
    priority: 'MEDIUM',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [pRes, uRes] = await Promise.all([
            api.get('/projects'),
            api.get('/users')
          ]);
          setProjects(pRes.data);
          setMembers(uRes.data);
        } catch (e) {
          toast.error('Failed to load data');
        }
      };
      fetchData();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.projectId) return toast.error('Please select a project');
    setLoading(true);
    try {
      await api.post(`/tasks/project/${formData.projectId}`, formData);
      toast.success('Task added successfully');
      onSuccess?.();
      onClose();
      setFormData({ title: '', projectId: '', assigneeId: '', dueDate: '', priority: 'MEDIUM', description: '' });
    } catch (e) {
      toast.error('Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="bg-card-dark w-full max-w-lg rounded-card shadow-2xl relative border border-white/10 animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-bold">Quick Add Task</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted">Title</label>
            <input
              required
              className="w-full bg-app border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-accent-orange outline-none"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Project</label>
              <select
                required
                className="w-full bg-app border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-accent-orange outline-none appearance-none"
                value={formData.projectId}
                onChange={e => setFormData({...formData, projectId: e.target.value})}
              >
                <option value="">Select Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Assignee</label>
              <select
                className="w-full bg-app border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-accent-orange outline-none appearance-none"
                value={formData.assigneeId}
                onChange={e => setFormData({...formData, assigneeId: e.target.value})}
              >
                <option value="">Unassigned</option>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Due Date</label>
              <input
                type="date"
                className="w-full bg-app border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-accent-orange outline-none"
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted">Priority</label>
              <select
                className="w-full bg-app border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:border-accent-orange outline-none appearance-none"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>
          <div className="pt-4 flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-sm font-bold text-muted hover:text-white transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-[2] bg-accent-orange py-3 rounded-xl font-bold text-sm hover:brightness-110 active:scale-95 transition-all">
              {loading ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickAddTaskModal;
