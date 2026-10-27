import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  CheckSquare, 
  CalendarDays, 
  Award, 
  Timer, 
  BarChart3, 
  Settings,
  Database
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    t, 
    pendingTasksCount, 
    exams,
    isDemoMode,
    supabaseConfig 
  } = useApp();

  // Count upcoming exams
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingExamsCount = exams.filter(e => e.exam_date >= todayStr).length;

  const navItems: { id: NavTab; label: string; icon: React.ElementType; badge?: number | string; badgeColor?: string }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'subjects', label: t.nav.subjects, icon: BookOpen },
    { 
      id: 'tasks', 
      label: t.nav.tasks, 
      icon: CheckSquare, 
      badge: pendingTasksCount > 0 ? pendingTasksCount : undefined,
      badgeColor: 'bg-emerald-500 text-white'
    },
    { id: 'routine', label: t.nav.routine, icon: CalendarDays },
    { 
      id: 'exams', 
      label: t.nav.exams, 
      icon: Award,
      badge: upcomingExamsCount > 0 ? upcomingExamsCount : undefined,
      badgeColor: 'bg-indigo-500 text-white'
    },
    { id: 'timer', label: t.nav.timer, icon: Timer },
    { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-rose-100 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-3.5rem)] p-4 shrink-0">
      <div className="space-y-1 flex-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-rose-400 dark:text-rose-500/80">
          Navigation
        </div>
        {navItems.map(({ id, label, icon: Icon, badge, badgeColor }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 text-white shadow-sm shadow-rose-500/20 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-rose-50/60 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{label}</span>
              </div>
              {badge !== undefined && (
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : (badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300')}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Database Status in Sidebar Footer */}
      <div className="mt-auto pt-4 border-t border-rose-100 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-rose-50/40 dark:bg-slate-800/50 border border-rose-100 dark:border-slate-700/60 text-xs">
          <div className="flex items-center gap-2 mb-1.5 font-bold text-slate-700 dark:text-slate-300">
            <Database className="w-3.5 h-3.5 text-rose-500" />
            <span>Database Status</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
            {isDemoMode 
              ? 'Local demo mode is active. Data is stored on your device.' 
              : 'Connected to Supabase PostgreSQL.'}
          </p>
          {isDemoMode && (
            <button
              onClick={() => setActiveTab('settings')}
              className="mt-2 w-full text-center text-[11px] text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer"
            >
              Setup Supabase Cloud &rarr;
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
