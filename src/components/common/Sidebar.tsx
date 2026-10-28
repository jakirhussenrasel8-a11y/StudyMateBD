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
  Database,
  BellRing,
  Users
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    activeTab, 
    setActiveTab, 
    t, 
    pendingTasksCount, 
    exams,
    friends,
    isDemoMode,
    timerIsRunning,
    timerRemainingSeconds,
    isTimer15sWarning
  } = useApp();

  // Count upcoming exams
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingExamsCount = exams.filter(e => e.exam_date >= todayStr).length;

  const formatTimerMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

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
      badgeColor: 'bg-lavender-500 text-white'
    },
    { 
      id: 'timer', 
      label: t.nav.timer, 
      icon: Timer,
      badge: timerIsRunning ? formatTimerMinSec(timerRemainingSeconds) : undefined,
      badgeColor: isTimer15sWarning ? 'bg-amber-500 text-white animate-pulse' : 'bg-lavender-400 text-charcoal-900 font-mono'
    },
    { id: 'analytics', label: t.nav.analytics, icon: BarChart3 },
    { 
      id: 'friends', 
      label: t.nav.friends, 
      icon: Users,
      badge: friends.length > 0 ? friends.length : undefined,
      badgeColor: 'bg-lavender-100 text-charcoal-900 font-bold'
    },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[#E8E5ED] dark:border-charcoal-800 bg-white dark:bg-charcoal-900 min-h-[calc(100vh-4rem)] p-4 shrink-0 transition-colors">
      <div className="space-y-1.5 flex-1">
        <div className="px-3 py-2 text-[11px] font-black uppercase tracking-wider text-charcoal-400 dark:text-slate-500">
          মেনু ও নেভিগেশন
        </div>
        {navItems.map(({ id, label, icon: Icon, badge, badgeColor }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition cursor-pointer select-none active:scale-98 ${
                isActive
                  ? 'bg-[#F2EDF8] text-charcoal-900 dark:bg-charcoal-800 dark:text-lavender-300 font-black border border-lavender-200/80 dark:border-charcoal-700 shadow-xs'
                  : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-[#F8F7FA] dark:text-slate-300 dark:hover:text-white dark:hover:bg-charcoal-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-1.5 rounded-xl ${isActive ? 'bg-lavender-400 text-charcoal-900' : 'text-charcoal-500 dark:text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{label}</span>
              </div>
              {badge !== undefined && (
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold shadow-xs ${badgeColor || 'bg-slate-200 dark:bg-charcoal-800 text-charcoal-700 dark:text-slate-300'}`}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Database Status in Sidebar Footer */}
      <div className="mt-auto pt-4 border-t border-[#E8E5ED] dark:border-charcoal-800">
        <div className="p-3.5 rounded-2xl bg-[#F8F7FA] dark:bg-charcoal-800/70 border border-[#E8E5ED] dark:border-charcoal-700/60 text-xs">
          <div className="flex items-center gap-2 mb-1.5 font-black text-charcoal-900 dark:text-slate-200">
            <Database className="w-3.5 h-3.5 text-lavender-500" />
            <span>ডাটাবেজ স্ট্যাটাস</span>
          </div>
          <p className="text-charcoal-500 dark:text-slate-400 text-[11px] leading-relaxed">
            {isDemoMode 
              ? 'লোকাল ডেমো মোড সক্রিয়। ডাটা ডিভাইসে সুরক্ষিত আছে।' 
              : 'Supabase PostgreSQL ক্লাউডে সংযুক্ত।'}
          </p>
          {isDemoMode && (
            <button
              onClick={() => setActiveTab('settings')}
              className="mt-2 text-[11px] text-lavender-700 dark:text-lavender-300 font-extrabold hover:underline cursor-pointer flex items-center gap-1"
            >
              ক্লাউড সিঙ্ক সেটআপ করুন &rarr;
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
