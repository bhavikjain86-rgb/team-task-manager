import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, X, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ tasks: [], projects: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query.trim()) {
      setResults({ tasks: [], projects: [] });
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [pRes, tRes] = await Promise.all([
          api.get(`/projects?search=${query}`),
          // We don't have a direct task search yet, so we search projects then filter 
          // (In a real app, we'd have a dedicated /tasks/search endpoint)
          api.get('/projects') 
        ]);
        setResults({
          projects: pRes.data.slice(0, 5),
          tasks: tRes.data.flatMap(p => p.tasks).filter(t => t.title.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-md flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="bg-card-dark w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-4 p-5 border-b border-white/5">
          <Search className="w-6 h-6 text-muted" />
          <input
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-xl font-medium placeholder:text-white/20"
            placeholder="Search tasks, projects, people..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button onClick={onClose} className="p-1 text-muted hover:text-white bg-white/5 rounded-lg text-xs font-bold uppercase tracking-widest px-2">Esc</button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
          {loading && <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-accent-orange" /></div>}
          
          {!loading && query && results.tasks.length === 0 && results.projects.length === 0 && (
            <div className="py-10 text-center text-muted">No results found for "{query}"</div>
          )}

          {results.projects.length > 0 && (
            <div className="mb-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-3 px-2">Projects</h3>
              <div className="space-y-1">
                {results.projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { navigate(`/projects/${p.id}`); onClose(); }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-lg bg-accent-orange/20 flex items-center justify-center text-accent-orange font-bold text-xs">{p.name.charAt(0)}</div>
                      <span className="font-semibold">{p.name}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all text-accent-orange" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {results.tasks.length > 0 && (
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-muted mb-3 px-2">Tasks</h3>
              <div className="space-y-1">
                {results.tasks.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { navigate(`/projects/${t.projectId}`); onClose(); }}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all text-left group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-accent-green" />
                      <span className="font-semibold">{t.title}</span>
                    </div>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-tighter">In {t.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {!query && (
            <div className="py-10 text-center">
              <p className="text-muted text-sm font-medium">Type something to search across TaskFlow...</p>
              <div className="flex justify-center gap-4 mt-6">
                 <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-muted uppercase">Projects</div>
                 <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-muted uppercase">Tasks</div>
                 <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5 text-[10px] font-bold text-muted uppercase">Team</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;
