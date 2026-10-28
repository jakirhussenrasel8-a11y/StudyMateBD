import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full mx-auto px-4 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div 
        className={`pointer-events-auto flex items-center gap-3 p-4 rounded-2xl shadow-xl border backdrop-blur-md ${
          toast.type === 'success'
            ? 'bg-charcoal-900/95 text-white border-charcoal-800 dark:bg-white dark:text-charcoal-900 dark:border-slate-200'
            : toast.type === 'error'
            ? 'bg-rose-600/95 text-white border-rose-500'
            : 'bg-charcoal-900/95 text-white border-lavender-400'
        }`}
      >
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400 dark:text-emerald-600" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0 text-white" />}
        {toast.type === 'info' && <Info className="w-5 h-5 shrink-0 text-lavender-400 dark:text-lavender-600" />}
        <p className="text-xs sm:text-sm font-bold leading-tight">{toast.message}</p>
      </div>
    </div>
  );
};
