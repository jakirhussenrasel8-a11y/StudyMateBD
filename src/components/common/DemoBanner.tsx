import React from 'react';
import { useApp } from '../../context/AppContext';
import { Database, AlertTriangle, ShieldCheck, ChevronRight } from 'lucide-react';

interface DemoBannerProps {
  onOpenAuth: () => void;
  onOpenSettings: () => void;
}

export const DemoBanner: React.FC<DemoBannerProps> = ({ onOpenAuth, onOpenSettings }) => {
  const { isDemoMode, user, supabaseConfig, t } = useApp();

  if (!isDemoMode && user) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800/50 px-4 py-2 text-xs flex items-center justify-between text-emerald-800 dark:text-emerald-300">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="font-semibold">{t.auth.cloudConnected}</span>
          <span className="text-emerald-600/80 dark:text-emerald-400/80 hidden sm:inline">
            ({user.email})
          </span>
        </div>
        <span className="text-[11px] bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded font-medium">
          PostgreSQL Cloud Sync
        </span>
      </div>
    );
  }

  return (
    <div className="bg-rose-50/70 dark:bg-slate-900/90 border-b border-rose-200/70 dark:border-rose-950/40 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-rose-950 dark:text-rose-200">
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
        <p className="line-clamp-1">
          <strong className="font-semibold text-rose-700 dark:text-rose-300">{t.auth.demoActive}:</strong> {t.auth.demoNotice}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {supabaseConfig.isConfigured ? (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-2.5 py-1 rounded-md text-xs font-bold transition shadow-xs cursor-pointer"
          >
            {t.auth.login}
            <ChevronRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 bg-rose-900/90 hover:bg-rose-950 text-white dark:bg-rose-500 dark:hover:bg-rose-600 dark:text-white px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Connect Supabase Free</span>
          </button>
        )}
      </div>
    </div>
  );
};
