import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  GraduationCap, 
  Flame, 
  Sun, 
  Moon, 
  Globe, 
  User as UserIcon, 
  LogIn,
  LogOut 
} from 'lucide-react';

interface HeaderProps {
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAuth }) => {
  const { 
    t, 
    language, 
    setLanguage, 
    theme, 
    setTheme, 
    studyStreak, 
    user, 
    profile,
    isDemoMode,
    signOut,
    setActiveTab 
  } = useApp();

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo and Brand */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-rose-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 bg-clip-text text-transparent">
                StudyMate
              </span>
              <span className="text-[10px] sm:text-xs font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40">
                BD
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 hidden sm:block -mt-0.5 font-medium">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Study Streak Badge */}
          <div 
            title={`${studyStreak} ${t.dashboard.streakFire}`}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/60 text-orange-600 dark:text-orange-400 text-xs font-bold"
          >
            <Flame className={`w-3.5 h-3.5 sm:w-4 sm:h-4 fill-orange-500 text-orange-500 ${studyStreak > 0 ? 'animate-pulse' : 'opacity-40'}`} />
            <span>{studyStreak}</span>
            <span className="hidden sm:inline font-normal text-slate-600 dark:text-slate-400">{t.dashboard.days}</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            title="Switch Language (ভাষা পরিবর্তন)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500" />
            <span>{language === 'bn' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? t.settings.themeDark : t.settings.themeLight}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* User Account / Sign In */}
          {user && !isDemoMode ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 transition cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span className="max-w-[70px] sm:max-w-[120px] truncate">
                  {profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
              </button>
              <button
                onClick={signOut}
                title={t.auth.logout}
                className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:to-pink-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs shadow-rose-500/20 transition cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.auth.login}</span>
              <span className="sm:hidden">লগইন</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
