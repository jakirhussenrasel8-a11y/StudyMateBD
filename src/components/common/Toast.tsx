import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full mx-auto px-4 pointer-events-none transition-all duration-300 animate-in fade-in slide-in-from-top-4">
      <div 
        className={`pointer-events-auto flex items-center gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md ${
          toast.type === 'success'
            ? 'bg-emerald-500/90 text-white border-emerald-400 dark:bg-emerald-600/90'
            : toast.type === 'error'
            ? 'bg-rose-500/90 text-white border-rose-400 dark:bg-rose-600/90'
            : 'bg-slate-800/95 text-white border-slate-700 dark:bg-slate-900/95'
        }`}
      >
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 shrink-0" />}
        {toast.type === 'info' && <Info className="w-5 h-5 shrink-0 text-cyan-300" />}
        <p className="text-sm font-medium leading-tight">{toast.message}</p>
      </div>
    </div>
  );
};
