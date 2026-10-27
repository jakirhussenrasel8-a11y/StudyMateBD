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
  Sparkles 
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
    language 
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
        id: subId,
        name: subject ? subject.name : (language === 'bn' ? 'সাধারণ বিষয়' : 'General / Unassigned'),
        color: subject ? subject.color : '#94a3b8',
        minutes,
        percentage: totalRecordedMinutes > 0 ? Math.round((minutes / totalRecordedMinutes) * 100) : 0,
      });
    }

    return list.sort((a, b) => b.minutes - a.minutes);
  }, [sessions, subjects, totalRecordedMinutes, language]);

  // 4. Past 7 days bar chart data
  const past7DaysData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short' });

      const dayMinutes = sessions
        .filter(s => s.completed_at && s.completed_at.startsWith(dateKey))
        .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

      days.push({
        date: dateKey,
        dayLabel,
        minutes: dayMinutes,
        isToday: dateKey === todayStr,
      });
    }

    const maxMinutes = Math.max(...days.map(d => d.minutes), 60);
    return { days, maxMinutes };
  }, [sessions, language, todayStr]);

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          {t.analytics.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t.analytics.subtitle}
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Study Time */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{t.analytics.totalStudyTime}</span>
            <Clock className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {Math.floor(totalRecordedMinutes / 60)}
            <span className="text-xs font-normal text-slate-500 ml-1">{t.dashboard.hours}</span>{' '}
            {totalRecordedMinutes % 60}
            <span className="text-xs font-normal text-slate-500 ml-1">{t.dashboard.minutes}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            মোট {sessions.length} টি সেশন রেকর্ড
          </p>
        </div>

        {/* Study Time Today */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{t.dashboard.todayStudyTime}</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {Math.floor(todayStudyMinutes / 60) > 0 && `${Math.floor(todayStudyMinutes / 60)}h `}
            {todayStudyMinutes % 60}
            <span className="text-xs font-normal text-slate-500 ml-1">{t.dashboard.minutes}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {t.dashboard.weeklyStudyTime}: {Math.floor(weeklyStudyMinutes / 60)}h {weeklyStudyMinutes % 60}m
          </p>
        </div>

        {/* Study Streak */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{t.analytics.studyStreak}</span>
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {studyStreak}
            <span className="text-xs font-normal text-slate-500 ml-1">{t.dashboard.days}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            একটানা অধ্যয়নের ধারাবাহিকতা
          </p>
        </div>

        {/* Completed Tasks Ratio */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold">{t.analytics.completedTasksRatio}</span>
            <CheckCircle2 className="w-4 h-4 text-teal-500" />
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            {taskCompletionRate}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {completedTasks} / {totalTasks} টি টাস্ক সম্পন্ন
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Past 7 Days Study Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {t.analytics.last7Days}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">মিনিট হিসেবে</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-2 pt-6 pb-2 px-2">
            {past7DaysData.days.map((day) => {
              const heightPercent = Math.max(6, Math.round((day.minutes / past7DaysData.maxMinutes) * 100));
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  {/* Tooltip on hover */}
                  <span className="text-[10px] font-bold text-slate-500 group-hover:text-emerald-600 transition">
                    {day.minutes > 0 ? `${day.minutes}m` : '0m'}
                  </span>

                  <div 
                    className={`w-full max-w-[42px] rounded-t-lg transition-all duration-500 group-hover:brightness-110 ${
                      day.isToday 
                        ? 'bg-gradient-to-t from-emerald-600 to-teal-500 shadow-sm shadow-emerald-500/20' 
                        : 'bg-emerald-200 dark:bg-emerald-950/80 border-t border-emerald-300 dark:border-emerald-800'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                    title={`${day.date}: ${day.minutes} mins`}
                  />

                  <span className={`text-[11px] font-bold ${day.isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {day.dayLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Study Time by Subject Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.analytics.subjectBreakdown}
                </h3>
              </div>
            </div>

            {subjectBreakdown.length > 0 ? (
              <div className="space-y-3.5">
                {subjectBreakdown.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <span className="font-bold text-slate-800 dark:text-slate-200 line-clamp-1">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                        <span>{item.minutes} {t.dashboard.minutes}</span>
                        <span className="text-slate-400 text-[11px]">({item.percentage}%)</span>
                      </div>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${item.percentage}%`, backgroundColor: item.color }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                {t.analytics.noStudySessionsYet}
              </div>
            )}
          </div>

          {/* Student Productivity Tip */}
          <div className="mt-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t.analytics.productivityTip}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
