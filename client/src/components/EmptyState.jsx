import React from 'react';
import { LucideIcon } from 'lucide-react';

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  actionLabel, 
  onAction 
}) => (
  <div className="py-20 text-center flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
    <div className="w-24 h-24 bg-card-dark rounded-[32px] border border-white/5 flex items-center justify-center text-muted mb-6 shadow-2xl">
      <Icon className="w-12 h-12" />
    </div>
    <h2 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h2>
    <p className="text-muted text-sm max-w-xs mx-auto mb-8 font-medium">{subtitle}</p>
    {actionLabel && (
      <button 
        onClick={onAction}
        className="bg-accent-orange text-white font-bold py-3 px-8 rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-orange-950/20"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
