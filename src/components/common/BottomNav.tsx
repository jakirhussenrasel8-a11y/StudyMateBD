import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../../types';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Timer, 
  CalendarDays, 
  Award, 
  BookOpen, 
  BarChart3, 
  Settings, 
  MoreHorizontal,
  X,
  Users 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t, timerIsRunning, isTimer15sWarning } = useApp();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const mainTabs: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'tasks', label: t.nav.tasks, icon: CheckSquare },
    { id: 'timer', label: t.nav.timer, icon: Timer },
    { id: 'routine', label: t.nav.routine, icon: CalendarDays },
    { id: 'exams', label: t.nav.exams, icon: Award },
  ];

  const secondaryTabs: { id: NavTab; label: string; icon: React.ElementType; desc: string }[] = [
    { id: 'subjects', label: t.nav.subjects, icon: BookOpen, desc: t.subjects.subtitle },
    { id: 'friends', label: t.nav.friends, icon: Users, desc: t.friends.subtitle },
    { id: 'analytics', label: t.nav.analytics, icon: BarChart3, desc: t.analytics.subtitle },
    { id: 'settings', label: t.nav.settings, icon: Settings, desc: t.settings.subtitle },
  ];

  const handleSelectTab = (id: NavTab) => {
    setActiveTab(id);
    setShowMoreMenu(false);
  };

  const isMoreActive = ['subjects', 'friends', 'analytics', 'settings'].includes(activeTab);

  return (
    <>
      {/* More Menu Drawer for Mobile (Bottom Sheet Style) */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 z-40 bg-charcoal-900/50 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setShowMoreMenu(false)}
        >
          <div 
            className="absolute bottom-16 left-0 right-0 bg-white dark:bg-charcoal-900 rounded-t-[32px] p-5 shadow-2xl border-t border-[#E8E5ED] dark:border-charcoal-800 animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Drag Handle */}
            <div className="w-12 h-1.5 bg-[#E8E5ED] dark:bg-charcoal-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5ED] dark:border-charcoal-800 mb-3">
              <span className="font-black text-sm text-charcoal-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lavender-400" />
                {t.nav.menu}
              </span>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-700 dark:hover:text-slate-200 rounded-full cursor-pointer active:scale-90 transition-transform"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pb-2">
              {secondaryTabs.map(({ id, label, icon: Icon, desc }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleSelectTab(id)}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl text-left transition-all cursor-pointer active:scale-98 touch-manipulation ${
                      isActive 
                        ? 'bg-[#F2EDF8] text-charcoal-900 dark:bg-charcoal-800 dark:text-lavender-300 font-extrabold border border-lavender-200 dark:border-charcoal-700 shadow-xs' 
                        : 'hover:bg-[#F8F7FA] dark:hover:bg-charcoal-800/60 text-charcoal-700 dark:text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className={`p-2.5 rounded-2xl ${isActive ? 'bg-lavender-400 text-charcoal-900 font-bold' : 'bg-[#F2EDF8] dark:bg-charcoal-800 text-charcoal-600 dark:text-slate-300'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-black tracking-tight">{label}</div>
                      <div className="text-xs text-charcoal-500 dark:text-slate-400 line-clamp-1 mt-0.5">{desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-charcoal-900/95 backdrop-blur-md border-t border-[#E8E5ED] dark:border-charcoal-800 md:hidden pb-safe shadow-[0_-4px_24px_rgba(0,0,0,0.04)]">
        <div className="grid grid-cols-6 h-15 items-center px-1">
          {mainTabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            const isTimer = id === 'timer';

            return (
              <button
                key={id}
                onClick={() => handleSelectTab(id)}
                className={`flex flex-col items-center justify-center h-full py-1.5 transition-all relative cursor-pointer active:scale-90 touch-manipulation select-none ${
                  isActive
                    ? 'text-charcoal-900 dark:text-lavender-300 font-black'
                    : 'text-charcoal-400 hover:text-charcoal-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-lavender-400 rounded-full" />
                )}
                <div className={`p-1 rounded-2xl transition-colors relative ${isActive ? 'bg-[#F2EDF8] dark:bg-charcoal-800 text-charcoal-900 dark:text-white' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                  {isTimer && timerIsRunning && (
                    <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-charcoal-900 ${
                      isTimer15sWarning ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'
                    }`} />
                  )}
                </div>
                <span className="text-[10px] tracking-tight leading-none truncate max-w-[52px] font-semibold mt-0.5">
                  {label}
                </span>
              </button>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center h-full py-1.5 transition-all relative cursor-pointer active:scale-90 touch-manipulation select-none ${
              isMoreActive || showMoreMenu
                ? 'text-charcoal-900 dark:text-lavender-300 font-black'
                : 'text-charcoal-400 hover:text-charcoal-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {(isMoreActive || showMoreMenu) && (
              <span className="absolute top-0 w-8 h-1 bg-lavender-400 rounded-full" />
            )}
            <div className={`p-1 rounded-2xl transition-colors ${isMoreActive || showMoreMenu ? 'bg-[#F2EDF8] dark:bg-charcoal-800 text-charcoal-900 dark:text-white' : ''}`}>
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight leading-none font-semibold mt-0.5">
              {t.nav.menu}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
