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
  X 
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, t } = useApp();
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
    { id: 'analytics', label: t.nav.analytics, icon: BarChart3, desc: t.analytics.subtitle },
    { id: 'settings', label: t.nav.settings, icon: Settings, desc: t.settings.subtitle },
  ];

  const handleSelectTab = (id: NavTab) => {
    setActiveTab(id);
    setShowMoreMenu(false);
  };

  const isMoreActive = ['subjects', 'analytics', 'settings'].includes(activeTab);

  return (
    <>
      {/* More Menu Drawer for Mobile (Bottom Sheet Style) */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden animate-in fade-in duration-200"
          onClick={() => setShowMoreMenu(false)}
        >
          <div 
            className="absolute bottom-16 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-5 shadow-2xl border-t border-rose-100 dark:border-slate-800 animate-in slide-in-from-bottom-6 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Drag Handle */}
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {t.nav.menu}
              </span>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer active:scale-90 transition-transform"
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
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900/80 shadow-xs' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className={`p-2.5 rounded-xl ${isActive ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white shadow-xs shadow-rose-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold tracking-tight">{label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-rose-100/80 dark:border-slate-800 md:hidden pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-6 h-15 items-center px-1">
          {mainTabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleSelectTab(id)}
                className={`flex flex-col items-center justify-center h-full py-1.5 transition-all relative cursor-pointer active:scale-90 touch-manipulation select-none ${
                  isActive
                    ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-xs shadow-rose-500/40" />
                )}
                <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-rose-50 dark:bg-rose-950/60' : ''}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                </div>
                <span className="text-[10px] tracking-tight leading-none truncate max-w-[52px]">
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
                ? 'text-rose-600 dark:text-rose-400 font-extrabold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {(isMoreActive || showMoreMenu) && (
              <span className="absolute top-0 w-8 h-1 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-xs shadow-rose-500/40" />
            )}
            <div className={`p-1 rounded-xl transition-colors ${isMoreActive || showMoreMenu ? 'bg-rose-50 dark:bg-rose-950/60' : ''}`}>
              <MoreHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight leading-none">
              {t.nav.menu}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
