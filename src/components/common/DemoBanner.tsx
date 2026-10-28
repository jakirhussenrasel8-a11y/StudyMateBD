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
      <div className="bg-[#E6F4F1] dark:bg-pastelMint-500/15 border-b border-pastelMint-200 dark:border-pastelMint-500/30 px-4 py-2 text-xs flex items-center justify-between text-charcoal-900 dark:text-pastelMint-100">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-pastelMint-500 dark:text-pastelMint-300" />
          <span className="font-extrabold">{t.auth.cloudConnected}</span>
          <span className="text-charcoal-500 dark:text-pastelMint-200 hidden sm:inline">
            ({user.email})
          </span>
        </div>
        <span className="text-[11px] bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-pastelMint-200 px-2.5 py-0.5 rounded-full font-bold border border-pastelMint-200">
          Supabase PostgreSQL
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#FFF9E5] dark:bg-charcoal-900/90 border-b border-[#FFE49A]/80 dark:border-charcoal-800 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 text-charcoal-900 dark:text-amber-200">
      <div className="flex items-center gap-2 flex-1 min-w-[200px]">
        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
        <p className="line-clamp-1">
          <strong className="font-black text-charcoal-900 dark:text-amber-300">{t.auth.demoActive}:</strong> {t.auth.demoNotice}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {supabaseConfig.isConfigured ? (
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1 bg-charcoal-900 hover:bg-black text-white dark:bg-white dark:text-charcoal-900 px-3 py-1 rounded-full text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
          >
            {t.auth.login}
            <ChevronRight className="w-3 h-3" />
          </button>
        ) : (
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 bg-lavender-400 hover:bg-lavender-500 text-charcoal-900 px-3 py-1 rounded-full text-xs font-black transition cursor-pointer shadow-xs active:scale-95"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Connect Supabase Free</span>
          </button>
        )}
      </div>
    </div>
  );
};
