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
  LogOut,
  Timer as TimerIcon,
  BellRing
} from 'lucide-react';
import { StudentAvatar } from './StudentAvatar';

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
    setActiveTab,
    timerIsRunning,
    timerRemainingSeconds,
    isTimer15sWarning
  } = useApp();

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  // Format mm:ss for header pill
  const formatTimerMinSec = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-charcoal-900/90 backdrop-blur-md border-b border-[#E8E5ED] dark:border-charcoal-800 transition-colors w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2 min-w-0">
        {/* Logo and Brand with Reference Lavender Aesthetics */}
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-lavender-400 flex items-center justify-center text-charcoal-900 shadow-xs shadow-lavender-400/30 group-hover:scale-105 transition-transform shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-6 sm:h-6 text-charcoal-900" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="font-black text-sm sm:text-lg tracking-tight text-charcoal-900 dark:text-white truncate">
                StudyMate
              </span>
              <span className="text-[9px] sm:text-xs font-black px-1.5 py-0.5 rounded-full bg-[#FFE49A] text-charcoal-900 shrink-0">
                BD
              </span>
            </div>
            <p className="text-[10px] text-charcoal-500 dark:text-slate-400 hidden sm:block -mt-0.5 font-medium truncate">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* Global Running Timer Mini-Bar Indicator */}
        {timerIsRunning && (
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border transition cursor-pointer active:scale-95 animate-pulse shrink-0 ${
              isTimer15sWarning 
                ? 'bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-950/80 dark:border-amber-700 dark:text-amber-300'
                : 'bg-lavender-100 border-lavender-300 text-charcoal-900 dark:bg-charcoal-800 dark:border-lavender-800 dark:text-lavender-300'
            }`}
            title="চলমান টাইমার দেখুন"
          >
            {isTimer15sWarning ? (
              <BellRing className="w-3 h-3 text-amber-600 animate-bounce" />
            ) : (
              <TimerIcon className="w-3 h-3 text-lavender-600 dark:text-lavender-400" />
            )}
            <span className="font-mono font-bold text-[11px] sm:text-xs">
              {formatTimerMinSec(timerRemainingSeconds)}
            </span>
          </button>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Study Streak Badge with Soft Warm Yellow */}
          <div 
            title={`${studyStreak} ${t.dashboard.streakFire}`}
            className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-full bg-[#FFF9E5] dark:bg-charcoal-800 border border-[#FFE49A] dark:border-charcoal-700 text-charcoal-900 dark:text-amber-300 text-xs font-bold shrink-0"
          >
            <Flame className={`w-3.5 h-3.5 fill-amber-500 text-amber-500 ${studyStreak > 0 ? 'animate-pulse' : 'opacity-40'}`} />
            <span>{studyStreak}</span>
            <span className="hidden sm:inline font-normal text-charcoal-500 dark:text-slate-400">{t.dashboard.days}</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            title="Switch Language (ভাষা পরিবর্তন)"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold text-charcoal-700 dark:text-slate-200 bg-[#F2EDF8] hover:bg-lavender-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 transition cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-charcoal-500 dark:text-slate-400" />
            <span>{language === 'bn' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? t.settings.themeDark : t.settings.themeLight}
            className="p-2 rounded-full text-charcoal-700 hover:text-charcoal-900 dark:text-slate-300 dark:hover:text-white bg-[#F2EDF8] hover:bg-lavender-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 transition cursor-pointer"
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-charcoal-700" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* User Account / Sign In */}
          {user && !isDemoMode ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('settings')}
                className="flex items-center gap-1.5 p-1 pr-3 rounded-full bg-white dark:bg-charcoal-800 border border-[#E8E5ED] dark:border-charcoal-700 text-charcoal-900 dark:text-white text-xs font-bold hover:bg-[#F2EDF8] transition cursor-pointer shadow-xs"
              >
                <StudentAvatar gender={profile?.gender || 'male'} size="xs" />
                <span className="max-w-[70px] sm:max-w-[120px] truncate">
                  {profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0]}
                </span>
              </button>
              <button
                onClick={signOut}
                title={t.auth.logout}
                className="p-2 text-charcoal-400 hover:text-rose-500 rounded-full hover:bg-rose-50 dark:hover:bg-charcoal-800 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-900 px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs transition hover:opacity-90 active:scale-95 cursor-pointer"
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
