import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Settings as SettingsIcon, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Sparkles,
  ArrowLeft,
  BellRing,
  Flame,
  CheckSquare,
  Check,
  X
} from 'lucide-react';

export const PomodoroView: React.FC = () => {
  const { 
    subjects, 
    sessions, 
    activeTimerTaskId,
    activeTimerTaskTitle,
    clearActiveTaskTimer,
    toggleTaskCompletion,
    language,
    t,
    goBack,
    canGoBack,
    timerMode,
    timerRemainingSeconds,
    timerIsRunning,
    timerTargetSeconds,
    timerSelectedSubjectId,
    timerSoundEnabled,
    timerFocusDuration,
    timerShortBreakDuration,
    timerLongBreakDuration,
    isTimer15sWarning,
    startTimer,
    pauseTimer,
    resetTimer,
    skipTimer,
    switchTimerMode,
    setTimerSelectedSubjectId,
    setTimerSoundEnabled,
    setTimerDurations,
  } = useApp();

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [localFocus, setLocalFocus] = useState<number>(timerFocusDuration);
  const [localShort, setLocalShort] = useState<number>(timerShortBreakDuration);
  const [localLong, setLocalLong] = useState<number>(timerLongBreakDuration);

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Progress percentage
  const progressPercent = Math.max(
    0, 
    Math.min(100, Math.round(((timerTargetSeconds - timerRemainingSeconds) / Math.max(1, timerTargetSeconds)) * 100))
  );

  // Today's completed pomodoros count
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCompletedPomos = sessions.filter(
    s => s.session_type === 'pomodoro' && s.completed_at && s.completed_at.startsWith(todayStr)
  ).length;

  const handleSaveSettings = () => {
    setTimerDurations(
      Math.max(1, localFocus), 
      Math.max(1, localShort), 
      Math.max(1, localLong)
    );
    setShowSettings(false);
  };

  return (
    <div className="space-y-5 max-w-xl mx-auto pb-24 md:pb-8 animate-in fade-in">
      {/* Top Header with Back button matching reference screen 3 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-charcoal-800 border border-[#E8E5ED] dark:border-charcoal-700 flex items-center justify-center text-charcoal-900 dark:text-white shadow-xs hover:bg-[#F2EDF8] dark:hover:bg-charcoal-700 transition cursor-pointer active:scale-95"
            title="পূর্ববর্তী পৃষ্ঠায় ফিরে যান"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-charcoal-900 dark:text-white" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">
              {t.timer.title}
            </h2>
            <p className="text-xs text-charcoal-500 dark:text-slate-400 font-medium">
              {t.timer.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setTimerSoundEnabled(!timerSoundEnabled)}
            className={`p-2.5 rounded-full border transition cursor-pointer active:scale-90 ${
              timerSoundEnabled 
                ? 'bg-lavender-100 border-lavender-300 text-lavender-700 dark:bg-lavender-950/60 dark:border-lavender-800 dark:text-lavender-300' 
                : 'bg-white dark:bg-charcoal-800 border-[#E8E5ED] dark:border-charcoal-700 text-charcoal-400'
            }`}
            title={timerSoundEnabled ? 'সাউন্ড এলার্ম চালু' : 'সাউন্ড এলার্ম বন্ধ'}
          >
            {timerSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings Toggle */}
          <button
            onClick={() => {
              setLocalFocus(timerFocusDuration);
              setLocalShort(timerShortBreakDuration);
              setLocalLong(timerLongBreakDuration);
              setShowSettings(!showSettings);
            }}
            className="p-2.5 rounded-full bg-white dark:bg-charcoal-800 border border-[#E8E5ED] dark:border-charcoal-700 text-charcoal-600 dark:text-slate-300 hover:bg-[#F2EDF8] transition cursor-pointer active:scale-90"
            title="টাইমার সময় কাস্টমাইজ করুন"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Task Link Banner */}
      {activeTimerTaskId && activeTimerTaskTitle && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFE49A]/30 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-[#FFE49A] text-charcoal-900 flex items-center justify-center shrink-0">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                চলমান টাস্কের কাউন্টডাউন
              </div>
              <h4 className="text-xs sm:text-sm font-black text-charcoal-900 dark:text-white truncate">
                {activeTimerTaskTitle}
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                toggleTaskCompletion(activeTimerTaskId);
                clearActiveTaskTimer();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black bg-charcoal-900 hover:bg-black text-white dark:bg-white dark:text-charcoal-900 transition shadow-xs cursor-pointer active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>সম্পন্ন</span>
            </button>
            <button
              onClick={clearActiveTaskTimer}
              title="টাস্ক আনলিঙ্ক করুন"
              className="p-1.5 text-charcoal-400 hover:text-charcoal-700 dark:hover:text-slate-200 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 15-Second Alarm Urgent Alert Banner */}
      {isTimer15sWarning && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-100 via-rose-100 to-amber-100 dark:from-amber-950/60 dark:via-rose-950/60 dark:to-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 flex items-center justify-center gap-2.5 shadow-md animate-pulse">
          <BellRing className="w-5 h-5 text-amber-600 animate-bounce" />
          <span className="text-xs sm:text-sm font-black tracking-tight">
            শেষের ১৫ সেকেন্ড বাকি! এলার্ম বাজছে — মনোযোগ ধরে রাখুন!
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold text-xs">
            {timerRemainingSeconds}s
          </span>
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-5 border border-[#E8E5ED] dark:border-charcoal-800 shadow-sm animate-in fade-in">
          <h3 className="font-extrabold text-sm text-charcoal-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lavender-500" />
            {t.timer.settingsHeading}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-charcoal-500 dark:text-slate-400 mb-1">
                {t.timer.focusDuration} (মি.)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={localFocus}
                onChange={(e) => setLocalFocus(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-500 dark:text-slate-400 mb-1">
                {t.timer.shortBreakDuration} (মি.)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={localShort}
                onChange={(e) => setLocalShort(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-charcoal-500 dark:text-slate-400 mb-1">
                {t.timer.longBreakDuration} (মি.)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={localLong}
                onChange={(e) => setLocalLong(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold text-charcoal-500 hover:bg-slate-100 transition cursor-pointer"
            >
              {t.common.cancel}
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-5 py-1.5 bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-900 rounded-xl text-xs font-bold transition cursor-pointer active:scale-95"
            >
              {t.common.save}
            </button>
          </div>
        </div>
      )}

      {/* Main Focus Card with Lavender/Mint Reference Styling */}
      <div className={`rounded-3xl p-6 sm:p-8 border transition-all text-center relative overflow-hidden shadow-xs ${
        isTimer15sWarning
          ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700'
          : timerMode === 'pomodoro'
          ? 'bg-white dark:bg-charcoal-900 border-[#E8E5ED] dark:border-charcoal-800'
          : timerMode === 'short_break'
          ? 'bg-[#EBF7F4] dark:bg-[#122320] border-pastelMint-300 dark:border-pastelMint-500/40'
          : 'bg-[#F4EFFB] dark:bg-[#20172B] border-lavender-300 dark:border-lavender-800'
      }`}>
        {/* Mode Selector Tabs (Soft Rounded Capsule) */}
        <div className="flex items-center justify-center p-1.5 rounded-full bg-[#F2EDF8] dark:bg-charcoal-800 text-xs font-bold mb-6 max-w-sm mx-auto w-full border border-lavender-200/60 dark:border-charcoal-700">
          <button
            onClick={() => switchTimerMode('pomodoro')}
            className={`flex-1 py-2 px-2 rounded-full transition cursor-pointer text-center text-xs font-extrabold touch-manipulation ${
              timerMode === 'pomodoro'
                ? 'bg-charcoal-900 text-white shadow-xs'
                : 'text-charcoal-600 dark:text-slate-300 hover:text-charcoal-900'
            }`}
          >
            {t.timer.focusSession}
          </button>
          <button
            onClick={() => switchTimerMode('short_break')}
            className={`flex-1 py-2 px-2 rounded-full transition cursor-pointer text-center text-xs font-extrabold touch-manipulation ${
              timerMode === 'short_break'
                ? 'bg-[#5BA497] text-white shadow-xs'
                : 'text-charcoal-600 dark:text-slate-300 hover:text-charcoal-900'
            }`}
          >
            {t.timer.shortBreak}
          </button>
          <button
            onClick={() => switchTimerMode('long_break')}
            className={`flex-1 py-2 px-2 rounded-full transition cursor-pointer text-center text-xs font-extrabold touch-manipulation ${
              timerMode === 'long_break'
                ? 'bg-lavender-500 text-white shadow-xs'
                : 'text-charcoal-600 dark:text-slate-300 hover:text-charcoal-900'
            }`}
          >
            {t.timer.longBreak}
          </button>
        </div>

        {/* Subject Selector for Focus Session */}
        <div className="max-w-xs mx-auto mb-6">
          <label className="block text-xs font-bold text-charcoal-500 dark:text-slate-400 mb-1.5 flex items-center justify-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-lavender-500" />
            <span>{t.timer.selectSubject}</span>
          </label>
          <select
            value={timerSelectedSubjectId}
            onChange={(e) => setTimerSelectedSubjectId(e.target.value)}
            disabled={timerIsRunning}
            className="w-full px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-lavender-400 disabled:opacity-60"
          >
            <option value="">{t.timer.selectSubjectPrompt}</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Big Circular Countdown Display */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
            {/* SVG circular progress ring */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="43"
                className="stroke-[#E8E5ED] dark:stroke-charcoal-800"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="50"
                cy="50"
                r="43"
                className={`transition-all duration-300 ${
                  isTimer15sWarning
                    ? 'stroke-amber-500'
                    : timerMode === 'pomodoro' 
                    ? 'stroke-lavender-400' 
                    : timerMode === 'short_break' 
                    ? 'stroke-pastelMint-400' 
                    : 'stroke-pastelBlue-300'
                }`}
                strokeWidth="7"
                strokeDasharray="270.17"
                strokeDashoffset={270.17 - (270.17 * progressPercent) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Content */}
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl sm:text-5xl font-black tracking-tight font-mono text-charcoal-900 dark:text-white ${
                isTimer15sWarning ? 'text-amber-600 dark:text-amber-400 scale-105 transition-transform' : ''
              }`}>
                {formatTime(timerRemainingSeconds)}
              </span>
              <span className="text-xs font-bold text-lavender-600 dark:text-lavender-300 mt-2 px-3 py-1 rounded-full bg-[#F2EDF8] dark:bg-charcoal-800">
                {timerMode === 'pomodoro' ? 'গভীর মনোযোগে থাকুন 🎯' : 'বিশ্রাম ও শ্বাস নিন 🌿'}
              </span>
              {timerIsRunning && (
                <span className="text-[10px] text-charcoal-400 mt-1 font-medium">
                  ব্যাকগ্রাউন্ডে সক্রিয়
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls: Reset, Play/Pause Pill, Skip */}
        <div className="flex items-center justify-center gap-3.5 mt-4">
          <button
            onClick={resetTimer}
            title={t.timer.reset}
            className="w-12 h-12 rounded-full bg-[#F2EDF8] dark:bg-charcoal-800 text-charcoal-700 dark:text-slate-300 hover:bg-lavender-200 transition cursor-pointer flex items-center justify-center active:scale-90"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Primary Action Button (Reference dark pill + round arrow style) */}
          <button
            onClick={timerIsRunning ? pauseTimer : startTimer}
            className={`px-8 py-3.5 rounded-full font-black text-sm sm:text-base text-white shadow-md transition transform active:scale-95 cursor-pointer flex items-center gap-3 ${
              timerIsRunning
                ? 'bg-charcoal-800 hover:bg-charcoal-900'
                : 'bg-charcoal-900 hover:bg-black shadow-charcoal-900/20'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-lavender-400 flex items-center justify-center text-charcoal-900">
              {timerIsRunning ? (
                <Pause className="w-4 h-4 fill-charcoal-900" />
              ) : (
                <Play className="w-4 h-4 fill-charcoal-900 ml-0.5" />
              )}
            </div>
            <span>
              {timerIsRunning 
                ? t.timer.pause 
                : timerRemainingSeconds < timerTargetSeconds 
                ? t.timer.resume 
                : t.timer.start}
            </span>
          </button>

          <button
            onClick={skipTimer}
            title={t.timer.skip}
            className="w-12 h-12 rounded-full bg-[#F2EDF8] dark:bg-charcoal-800 text-charcoal-700 dark:text-slate-300 hover:bg-lavender-200 transition cursor-pointer flex items-center justify-center active:scale-90"
          >
            <SkipForward className="w-5 h-5" />
          </button>
        </div>

        {/* Today's Completed Cycles Badge */}
        <div className="mt-8 pt-4 border-t border-[#E8E5ED] dark:border-charcoal-800 flex items-center justify-center gap-2 text-xs text-charcoal-500 dark:text-slate-400">
          <Sparkles className="w-4 h-4 text-lavender-500" />
          <span>{t.timer.completedCyclesToday}:</span>
          <span className="font-extrabold text-charcoal-900 dark:text-white text-sm px-2 py-0.5 rounded-full bg-[#FFE49A] text-charcoal-900">
            {todayCompletedPomos} টি
          </span>
        </div>
      </div>

      {/* Student Tip Card in Pastel Mint */}
      <div className="p-4 rounded-3xl bg-[#E6F4F1] dark:bg-pastelMint-500/10 border border-pastelMint-200 dark:border-pastelMint-500/30 text-xs text-charcoal-900 dark:text-pastelMint-100 flex items-start gap-3">
        <div className="p-2 rounded-2xl bg-white dark:bg-charcoal-800 text-pastelMint-500 font-bold shrink-0">
          💡
        </div>
        <div>
          <p className="font-extrabold text-charcoal-900 dark:text-white">পোমোডোরো স্মার্ট ট্র্যাকিং:</p>
          <p className="mt-1 leading-relaxed text-charcoal-600 dark:text-pastelMint-200">
            টাইমার চালু রেখে আপনি অন্য যেকোনো পেজে (যেমন রুটিন বা টাস্ক) যেতে পারেন — টাইমার ব্যাকগ্রাউন্ডে চালু থাকবে এবং শেষের ১৫ সেকেন্ডে সতর্কতামূলক এলার্ম বাজবে।
          </p>
        </div>
      </div>
    </div>
  );
};
