import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { TimerMode } from '../../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Settings as SettingsIcon, 
  BookOpen, 
  Flame, 
  CheckCircle,
  Volume2,
  VolumeX,
  Sparkles 
} from 'lucide-react';

export const PomodoroView: React.FC = () => {
  const { 
    subjects, 
    recordStudySession, 
    sessions, 
    t 
  } = useApp();

  // Mode durations in minutes
  const [focusDuration, setFocusDuration] = useState<number>(() => {
    return Number(localStorage.getItem('studymate_pomo_focus')) || 25;
  });
  const [shortBreakDuration, setShortBreakDuration] = useState<number>(() => {
    return Number(localStorage.getItem('studymate_pomo_short')) || 5;
  });
  const [longBreakDuration, setLongBreakDuration] = useState<number>(() => {
    return Number(localStorage.getItem('studymate_pomo_long')) || 15;
  });

  // Current State
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Drift-safe timer state using timestamps
  // remainingSeconds holds current remaining time
  const targetDurationSeconds = 
    (mode === 'pomodoro' ? focusDuration : mode === 'short_break' ? shortBreakDuration : longBreakDuration) * 60;

  const [remainingSeconds, setRemainingSeconds] = useState<number>(targetDurationSeconds);

  // References to handle drift and background tabs
  const endTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Sound Chime using Web Audio API (zero external assets needed)
  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Gentle melodic two-tone chime
      playTone(523.25, 0, 0.4);      // C5
      playTone(659.25, 0.15, 0.4);   // E5
      playTone(783.99, 0.3, 0.6);    // G5
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  }, [soundEnabled]);

  // Handle Session Completion (Only when timer naturally hits 0)
  const handleSessionComplete = useCallback(async () => {
    setIsRunning(false);
    endTimeRef.current = null;
    playChime();

    // Automatically record ONLY if it was a focus session and finished fully
    if (mode === 'pomodoro') {
      await recordStudySession({
        subject_id: selectedSubjectId || undefined,
        duration_minutes: focusDuration,
        session_type: 'pomodoro',
        notes: `Pomodoro Focus Session (${focusDuration}m)`,
      });

      // Move to short break next
      setMode('short_break');
      const nextSeconds = shortBreakDuration * 60;
      setRemainingSeconds(nextSeconds);
    } else {
      // Break completed, move back to focus
      setMode('pomodoro');
      const nextSeconds = focusDuration * 60;
      setRemainingSeconds(nextSeconds);
    }
  }, [mode, selectedSubjectId, focusDuration, shortBreakDuration, recordStudySession, playChime]);

  // Drift-safe tick mechanism
  useEffect(() => {
    if (isRunning) {
      if (!endTimeRef.current) {
        endTimeRef.current = Date.now() + remainingSeconds * 1000;
      }

      timerIntervalRef.current = window.setInterval(() => {
        if (!endTimeRef.current) return;
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.round((endTimeRef.current - now) / 1000));

        setRemainingSeconds(diffSeconds);

        if (diffSeconds <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          handleSessionComplete();
        }
      }, 500); // Check twice a second for precision
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      endTimeRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, remainingSeconds, handleSessionComplete]);

  // Mode Switch
  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    endTimeRef.current = null;
    setMode(newMode);
    const mins = newMode === 'pomodoro' ? focusDuration : newMode === 'short_break' ? shortBreakDuration : longBreakDuration;
    setRemainingSeconds(mins * 60);
  };

  // Start / Pause
  const toggleStartPause = () => {
    if (isRunning) {
      setIsRunning(false);
      endTimeRef.current = null;
    } else {
      endTimeRef.current = Date.now() + remainingSeconds * 1000;
      setIsRunning(true);
    }
  };

  // Reset current timer
  const handleReset = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    const mins = mode === 'pomodoro' ? focusDuration : mode === 'short_break' ? shortBreakDuration : longBreakDuration;
    setRemainingSeconds(mins * 60);
  };

  // Skip to next phase without false recording
  const handleSkip = () => {
    setIsRunning(false);
    endTimeRef.current = null;
    if (mode === 'pomodoro') {
      switchMode('short_break');
    } else {
      switchMode('pomodoro');
    }
  };

  // Save Duration Settings
  const handleSaveSettings = (focus: number, shortB: number, longB: number) => {
    setFocusDuration(focus);
    setShortBreakDuration(shortB);
    setLongBreakDuration(longB);
    localStorage.setItem('studymate_pomo_focus', String(focus));
    localStorage.setItem('studymate_pomo_short', String(shortB));
    localStorage.setItem('studymate_pomo_long', String(longB));
    setShowSettings(false);

    // Apply to current if paused
    if (!isRunning) {
      const currentModeMins = mode === 'pomodoro' ? focus : mode === 'short_break' ? shortB : longB;
      setRemainingSeconds(currentModeMins * 60);
    }
  };

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Calculate percentage for circular progress
  const totalTargetSecs = 
    (mode === 'pomodoro' ? focusDuration : mode === 'short_break' ? shortBreakDuration : longBreakDuration) * 60;
  const progressPercent = Math.max(0, Math.min(100, Math.round(((totalTargetSecs - remainingSeconds) / totalTargetSecs) * 100)));

  // Today's completed pomodoros count
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCompletedPomos = sessions.filter(
    s => s.session_type === 'pomodoro' && s.completed_at && s.completed_at.startsWith(todayStr)
  ).length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-20 md:pb-8 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {t.timer.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.timer.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
            title={soundEnabled ? 'সাউন্ড চালু' : 'সাউন্ড বন্ধ'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Settings Toggle */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
            title="টাইমার সেটিংস"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Timer Settings Drawer if opened */}
      {showSettings && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">
            {t.timer.settingsHeading}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.timer.focusDuration}
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.timer.shortBreakDuration}
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {t.timer.longBreakDuration}
              </label>
              <input
                type="number"
                min="5"
                max="60"
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                className="w-full px-3 py-1.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => handleSaveSettings(focusDuration, shortBreakDuration, longBreakDuration)}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {t.common.save}
            </button>
          </div>
        </div>
      )}

      {/* Main Focus Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-rose-100/80 dark:border-slate-800 shadow-lg text-center relative overflow-hidden">
        {/* Mode Selector Tabs (Responsive Mobile Width) */}
        <div className="flex items-center justify-center p-1 sm:p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold mb-6 max-w-sm mx-auto w-full">
          <button
            onClick={() => switchMode('pomodoro')}
            className={`flex-1 py-2 px-1 sm:px-3 rounded-xl transition cursor-pointer text-center text-[11px] sm:text-xs min-h-[38px] flex items-center justify-center ${
              mode === 'pomodoro'
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.timer.focusSession}
          </button>
          <button
            onClick={() => switchMode('short_break')}
            className={`flex-1 py-2 px-1 sm:px-3 rounded-xl transition cursor-pointer text-center text-[11px] sm:text-xs min-h-[38px] flex items-center justify-center ${
              mode === 'short_break'
                ? 'bg-pink-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.timer.shortBreak}
          </button>
          <button
            onClick={() => switchMode('long_break')}
            className={`flex-1 py-2 px-1 sm:px-3 rounded-xl transition cursor-pointer text-center text-[11px] sm:text-xs min-h-[38px] flex items-center justify-center ${
              mode === 'long_break'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {t.timer.longBreak}
          </button>
        </div>

        {/* Subject Selector for Focus Session */}
        <div className="max-w-xs mx-auto mb-6">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
            {t.timer.selectSubject}
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            disabled={isRunning}
            className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-rose-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 disabled:opacity-60"
          >
            <option value="">{t.timer.selectSubjectPrompt}</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Big Circular/Digital Countdown Display */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
            {/* SVG circular progress ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-rose-100/60 dark:stroke-slate-800"
                strokeWidth="6"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className={`transition-all duration-500 ${
                  mode === 'pomodoro' ? 'stroke-rose-500' : mode === 'short_break' ? 'stroke-pink-400' : 'stroke-purple-500'
                }`}
                strokeWidth="6"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-slate-900 dark:text-white">
                {formatTime(remainingSeconds)}
              </span>
              <span className="text-xs font-semibold text-rose-400 dark:text-rose-300 mt-2">
                {mode === 'pomodoro' ? 'গভীর মনোযোগে থাকুন' : 'বিশ্রাম ও শ্বাস নিন'}
              </span>
            </div>
          </div>
        </div>

        {/* Controls: Play/Pause, Reset, Skip */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <button
            onClick={handleReset}
            title={t.timer.reset}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={toggleStartPause}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base text-white shadow-lg transition transform active:scale-95 cursor-pointer flex items-center gap-2 ${
              mode === 'pomodoro' 
                ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 shadow-rose-500/25' 
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-pink-500/25'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>{t.timer.pause}</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white ml-0.5" />
                <span>{remainingSeconds < targetDurationSeconds ? t.timer.resume : t.timer.start}</span>
              </>
            )}
          </button>

          <button
            onClick={handleSkip}
            title={t.timer.skip}
            className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition cursor-pointer"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Today's Completed Cycles Badge */}
        <div className="mt-8 pt-4 border-t border-rose-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Sparkles className="w-4 h-4 text-rose-500" />
          <span>{t.timer.completedCyclesToday}:</span>
          <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
            {todayCompletedPomos} টি
          </span>
        </div>
      </div>

      {/* Helpful Student Tip Card */}
      <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-300">
        <p className="font-bold">পোমোডোরো নিয়ম:</p>
        <p className="mt-1 leading-relaxed text-rose-800/90 dark:text-rose-300/90">
          ২৫ মিনিট পড়ার পর ৫ মিনিট চোখ ও মনকে বিশ্রাম দিন। প্রতি ৪টি ফোকাস সেশনের পর একটি ১৫ মিনিটের দীর্ঘ বিরতি নিন। টাইমার শেষ হলে স্বয়ংক্রিয়ভাবে আপনার পড়ার রেকর্ড যোগ হবে।
        </p>
      </div>
    </div>
  );
};
