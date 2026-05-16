import { formatDistanceToNow, isPast, isToday } from 'date-fns';

/**
 * Formats a date into "2 hours ago", "Yesterday", etc.
 */
export const timeAgo = (date) => {
  if (!date) return 'Never';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Checks if a date is overdue (past today and not completed)
 */
export const isOverdue = (date, status) => {
  if (!date || status === 'DONE') return false;
  const d = new Date(date);
  return isPast(d) && !isToday(d);
};

/**
 * Priority color mapping for borders/badges
 */
export const getPriorityStyles = (priority) => {
  switch (priority) {
    case 'CRITICAL': return { border: 'border-l-4 border-red-600', text: 'text-red-600', bg: 'bg-red-50' };
    case 'HIGH': return { border: 'border-l-4 border-orange-500', text: 'text-orange-500', bg: 'bg-orange-50' };
    case 'MEDIUM': return { border: 'border-l-4 border-blue-500', text: 'text-blue-500', bg: 'bg-blue-50' };
    case 'LOW': return { border: 'border-l-4 border-slate-400', text: 'text-slate-400', bg: 'bg-slate-50' };
    default: return { border: 'border-l-4 border-slate-200', text: 'text-slate-500', bg: 'bg-slate-50' };
  }
};

/**
 * Formats status strings for display
 */
export const formatStatus = (status) => {
  return status.replace(/_/g, ' ').toLowerCase();
};
