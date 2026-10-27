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
      {/* More Menu Drawer for Mobile */}
      {showMoreMenu && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden animate-in fade-in"
          onClick={() => setShowMoreMenu(false)}
        >
          <div 
            className="absolute bottom-16 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-2xl p-4 shadow-2xl border-t border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {t.nav.menu}
              </span>
              <button 
                onClick={() => setShowMoreMenu(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 pb-2">
              {secondaryTabs.map(({ id, label, icon: Icon, desc }) => {
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleSelectTab(id)}
                    className={`flex items-center gap-3 p-3 rounded-xl text-left transition cursor-pointer ${
                      isActive 
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-gradient-to-tr from-rose-500 to-pink-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{label}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-rose-100/80 dark:border-slate-800 md:hidden pb-safe">
        <div className="grid grid-cols-6 h-14 items-center">
          {mainTabs.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => handleSelectTab(id)}
                className={`flex flex-col items-center justify-center h-full py-1 transition relative cursor-pointer ${
                  isActive
                    ? 'text-rose-600 dark:text-rose-400 font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <span className="absolute top-0 w-8 h-0.5 bg-rose-500 rounded-full" />
                )}
                <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                <span className="text-[10px] mt-0.5 leading-none truncate max-w-[50px]">
                  {label}
                </span>
              </button>
            );
          })}

          {/* More Button */}
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex flex-col items-center justify-center h-full py-1 transition relative cursor-pointer ${
              isMoreActive || showMoreMenu
                ? 'text-rose-600 dark:text-rose-400 font-bold'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {(isMoreActive || showMoreMenu) && (
              <span className="absolute top-0 w-8 h-0.5 bg-rose-500 rounded-full" />
            )}
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] mt-0.5 leading-none">
              {t.nav.menu}
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};
