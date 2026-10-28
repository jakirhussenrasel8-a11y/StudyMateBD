import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  BarChart3, 
  Clock, 
  Flame, 
  CheckCircle2, 
  Calendar, 
  TrendingUp, 
  PieChart, 
  BookOpen, 
  Sparkles,
  ArrowLeft,
  ArrowUpRight 
} from 'lucide-react';
import { getTodayDateString } from '../../lib/storage';

export const AnalyticsView: React.FC = () => {
  const { 
    sessions, 
    tasks, 
    subjects, 
    studyStreak, 
    todayStudyMinutes, 
    weeklyStudyMinutes, 
    t, 
    language,
    goBack,
    canGoBack 
  } = useApp();

  const todayStr = getTodayDateString();

  // 1. Total study time across all recorded sessions
  const totalRecordedMinutes = useMemo(() => {
    return sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  }, [sessions]);

  // 2. Task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 3. Subject-wise breakdown (from real study_sessions)
  const subjectBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    sessions.forEach(s => {
      const subId = s.subject_id || 'unassigned';
      map.set(subId, (map.get(subId) || 0) + (s.duration_minutes || 0));
    });

    const list = [];
    for (const [subId, minutes] of map.entries()) {
      const subject = subjects.find(s => s.id === subId);
      list.push({
        subjectId: subId,
        subjectName: subject?.name || 'অনির্ধারিত বিষয়',
        color: subject?.color || '#C5A7E2',
        minutes,
        percentage: totalRecordedMinutes > 0 ? Math.round((minutes / totalRecordedMinutes) * 100) : 0,
      });
    }

    return list.sort((a, b) => b.minutes - a.minutes);
  }, [sessions, subjects, totalRecordedMinutes]);

  // 4. Past 7 days calculation
  const past7DaysData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });
      
      const totalMins = sessions
        .filter(s => s.completed_at && s.completed_at.startsWith(dateKey))
        .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

      days.push({
        date: dateKey,
        dayName,
        minutes: totalMins,
        isToday: dateKey === todayStr,
      });
    }

    const maxMins = Math.max(...days.map(d => d.minutes), 60);
    return { days, maxMins };
  }, [sessions, language, todayStr]);

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in max-w-5xl mx-auto">
      {/* Header with Back Button matching reference image screen 3 */}
      <div className="flex items-center gap-3">
        <button
          onClick={goBack}
          className="w-10 h-10 rounded-full bg-white dark:bg-charcoal-800 border border-[#E8E5ED] dark:border-charcoal-700 flex items-center justify-center text-charcoal-900 dark:text-white shadow-xs hover:bg-[#F2EDF8] dark:hover:bg-charcoal-700 transition cursor-pointer active:scale-95 shrink-0"
          title="পূর্ববর্তী পৃষ্ঠায় ফিরে যান"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5 text-charcoal-900 dark:text-white" />
        </button>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">
            {t.analytics.title}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-slate-400 mt-0.5">
            {t.analytics.subtitle}
          </p>
        </div>
      </div>

      {/* 4 Summary Cards (Pastel Palette from Reference Image) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Study Time - Soft Yellow */}
        <div className="bg-[#FFF9E5] dark:bg-pastelYellow-400/10 rounded-3xl p-5 border border-[#FFE49A] dark:border-pastelYellow-400/30 shadow-xs">
          <div className="flex items-center justify-between text-charcoal-700 dark:text-amber-200">
            <span className="text-xs font-bold">{t.analytics.totalStudyTime}</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white font-mono">
            {Math.floor(totalRecordedMinutes / 60)}
            <span className="text-xs font-bold text-charcoal-500 ml-1">{t.dashboard.hours}</span>{' '}
            {totalRecordedMinutes % 60}
            <span className="text-xs font-bold text-charcoal-500 ml-1">{t.dashboard.minutes}</span>
          </div>
          <p className="text-[11px] text-charcoal-500 dark:text-slate-400 mt-1 font-medium">
            মোট {sessions.length} টি সেশন সম্পন্ন
          </p>
        </div>

        {/* Study Time Today - Mint */}
        <div className="bg-[#E6F4F1] dark:bg-pastelMint-500/10 rounded-3xl p-5 border border-pastelMint-200 dark:border-pastelMint-500/30 shadow-xs">
          <div className="flex items-center justify-between text-charcoal-700 dark:text-pastelMint-200">
            <span className="text-xs font-bold">{t.dashboard.todayStudyTime}</span>
            <Calendar className="w-4 h-4 text-pastelMint-500" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white font-mono">
            {Math.floor(todayStudyMinutes / 60) > 0 && `${Math.floor(todayStudyMinutes / 60)}h `}
            {todayStudyMinutes % 60}
            <span className="text-xs font-bold text-charcoal-500 ml-1">{t.dashboard.minutes}</span>
          </div>
          <p className="text-[11px] text-charcoal-500 dark:text-slate-400 mt-1 font-medium">
            সাপ্তাহিক: {Math.floor(weeklyStudyMinutes / 60)}h {weeklyStudyMinutes % 60}m
          </p>
        </div>

        {/* Study Streak - Soft Lavender */}
        <div className="bg-[#F2EDF8] dark:bg-lavender-950/20 rounded-3xl p-5 border border-lavender-200 dark:border-lavender-800/40 shadow-xs">
          <div className="flex items-center justify-between text-charcoal-700 dark:text-lavender-200">
            <span className="text-xs font-bold">{t.analytics.studyStreak}</span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white font-mono">
            {studyStreak}
            <span className="text-xs font-bold text-charcoal-500 ml-1">{t.dashboard.days}</span>
          </div>
          <p className="text-[11px] text-charcoal-500 dark:text-slate-400 mt-1 font-medium">
            ধারাবাহিকতা বজায় রাখুন
          </p>
        </div>

        {/* Completed Tasks - Sky Blue */}
        <div className="bg-[#E4F1FD] dark:bg-pastelBlue-400/10 rounded-3xl p-5 border border-pastelBlue-200 dark:border-pastelBlue-400/30 shadow-xs">
          <div className="flex items-center justify-between text-charcoal-700 dark:text-blue-200">
            <span className="text-xs font-bold">{t.analytics.completedTasksRatio}</span>
            <CheckCircle2 className="w-4 h-4 text-pastelBlue-400" />
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white font-mono">
            {taskCompletionRate}%
          </div>
          <p className="text-[11px] text-charcoal-500 dark:text-slate-400 mt-1 font-medium">
            {completedTasks} / {totalTasks} টি টাস্ক সম্পন্ন
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Past 7 Days Study Capsule Bar Chart */}
        <div className="bg-[#F2EDF8] dark:bg-charcoal-900 rounded-3xl p-6 border border-lavender-200 dark:border-charcoal-800 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-lavender-500" />
              <h3 className="font-black text-base text-charcoal-900 dark:text-white">
                {t.analytics.last7Days}
              </h3>
            </div>
            <span className="text-xs text-charcoal-500 dark:text-slate-400 font-bold">মিনিট হিসেবে</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 sm:gap-3 pt-6 pb-2 px-2">
            {past7DaysData.days.map((day, idx) => {
              const heightPercent = Math.max(16, Math.round((day.minutes / past7DaysData.maxMins) * 100));
              const barBg = idx % 3 === 0 
                ? 'bg-[#FFE49A]' 
                : idx % 3 === 1 
                ? 'bg-lavender-400' 
                : 'bg-[#CFE4E0]';

              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full max-w-[44px] h-full flex flex-col justify-end bg-white/70 dark:bg-charcoal-800/70 rounded-t-full rounded-b-3xl p-1 relative overflow-hidden border border-lavender-200/50">
                    <div className="absolute inset-x-0 top-0 bottom-1/2 striped-pill opacity-70 pointer-events-none" />

                    <div 
                      className={`w-full rounded-t-full rounded-b-2xl transition-all duration-500 flex flex-col items-center justify-between p-1 relative z-10 ${barBg}`}
                      style={{ height: `${heightPercent}%` }}
                    >
                      <div className="w-5 h-5 rounded-full bg-charcoal-900 text-white flex items-center justify-center text-[10px] font-mono font-bold">
                        {day.minutes}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[10px] sm:text-xs font-extrabold ${day.isToday ? 'text-charcoal-900 dark:text-white font-black' : 'text-charcoal-500 dark:text-slate-400'}`}>
                    {day.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subject Breakdown Progress Bars */}
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 border border-[#E8E5ED] dark:border-charcoal-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-4 h-4 text-lavender-500" />
              <h3 className="font-black text-base text-charcoal-900 dark:text-white">
                {t.analytics.subjectBreakdown}
              </h3>
            </div>
            <span className="text-xs text-charcoal-400 font-medium">বাস্তব সেশন তথ্য</span>
          </div>

          {subjectBreakdown.length > 0 ? (
            <div className="space-y-4 pt-2">
              {subjectBreakdown.map((item) => (
                <div key={item.subjectId} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-charcoal-900 dark:text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                      {item.subjectName}
                    </span>
                    <span className="font-mono text-charcoal-500 dark:text-slate-400 font-bold">
                      {Math.floor(item.minutes / 60)}h {item.minutes % 60}m ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-[#F2EDF8] dark:bg-charcoal-800 overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${item.percentage}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-charcoal-400 text-xs">
              এখনও কোনো পড়ার সেশন রেকর্ড হয়নি। টাইমার চালু করে পড়াশোনা শুরু করুন!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
