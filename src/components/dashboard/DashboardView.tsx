import React, { useMemo, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Flame, 
  Clock, 
  CheckCircle2, 
  ListTodo, 
  Calendar, 
  Plus, 
  Timer, 
  BookOpen, 
  Award, 
  ChevronRight, 
  Check, 
  ArrowUpRight,
  GraduationCap,
  Building2,
  Edit3,
  User,
  X,
  Sparkles,
  School
} from 'lucide-react';
import { getTodayDateString } from '../../lib/storage';

interface DashboardViewProps {
  onOpenCreateTask: () => void;
  onOpenCreateSubject: () => void;
  onOpenCreateExam: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenCreateTask,
  onOpenCreateSubject,
  onOpenCreateExam
}) => {
  const { 
    t, 
    language, 
    user, 
    profile,
    updateProfile,
    studyStreak, 
    todayStudyMinutes, 
    weeklyStudyMinutes, 
    tasksDueTodayCount, 
    pendingTasksCount, 
    completedTasksCount,
    tasks, 
    subjects, 
    routines, 
    exams, 
    sessions,
    toggleTaskCompletion,
    setActiveTab 
  } = useApp();

  const todayStr = getTodayDateString();

  // Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [studentName, setStudentName] = useState(profile?.full_name || 'তানভীর আহমেদ');
  const [studentClass, setStudentClass] = useState(profile?.student_class || 'একাদশ শ্রেণি (HSC 2026)');
  const [institution, setInstitution] = useState(profile?.institution || 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Dynamic greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard.greetingMorning;
    if (hour < 17) return t.dashboard.greetingAfternoon;
    return t.dashboard.greetingEvening;
  }, [t]);

  // Formatted today's date in local locale
  const formattedToday = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [language]);

  // Today's day of week in BD week system (0 = Saturday, 1 = Sunday, ..., 6 = Friday)
  const currentBdDayIndex = useMemo(() => {
    const jsDay = new Date().getDay();
    if (jsDay === 6) return 0; // Saturday
    return jsDay + 1;
  }, []);

  // Today's routine slots
  const todayRoutines = useMemo(() => {
    return routines
      .filter(r => r.day_of_week === currentBdDayIndex)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [routines, currentBdDayIndex]);

  // Priority and today's tasks
  const urgentTasks = useMemo(() => {
    return tasks
      .filter(t => t.due_date === todayStr || t.priority === 'high')
      .slice(0, 5);
  }, [tasks, todayStr]);

  // Upcoming exams (sorted by date)
  const upcomingExams = useMemo(() => {
    return exams
      .filter(e => e.exam_date >= todayStr)
      .sort((a, b) => a.exam_date.localeCompare(b.exam_date))
      .slice(0, 3);
  }, [exams, todayStr]);

  // Calculate days left for an exam date
  const getDaysLeft = (examDate: string) => {
    const today = new Date(todayStr);
    const target = new Date(examDate);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 7-day mini chart calculation (soft rose styled)
  const past7DaysData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'narrow' });
      
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

  // Helper for Subject mapping
  const subjectMap = useMemo(() => {
    const map = new Map<string, typeof subjects[0]>();
    subjects.forEach(s => map.set(s.id, s));
    return map;
  }, [subjects]);

  const handleOpenEditProfile = () => {
    setStudentName(profile?.full_name || 'তানভীর আহমেদ');
    setStudentClass(profile?.student_class || 'একাদশ শ্রেণি (HSC 2026)');
    setInstitution(profile?.institution || 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ');
    setIsEditProfileOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({
        full_name: studentName.trim(),
        student_class: studentClass.trim(),
        institution: institution.trim(),
      });
      setIsEditProfileOpen(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Student Initials
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'তানভীর আহমেদ';
  const displayClass = profile?.student_class || 'একাদশ শ্রেণি (HSC 2026)';
  const displayInstitution = profile?.institution || 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ';

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in">
      {/* 1. Student Identity & Welcome Hero Card (Aesthetic Soft Rose Theme) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white p-5 sm:p-7 shadow-xl shadow-rose-500/20 border border-rose-300/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Left Student Info */}
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            {/* Student Avatar */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center text-white text-xl sm:text-2xl font-black shadow-inner">
                <GraduationCap className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center" title="সক্রিয় শিক্ষার্থী">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>
            </div>

            {/* Student Details: Name, Class, Institution */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate drop-shadow-xs">
                  {displayName}
                </h1>
                <button
                  onClick={handleOpenEditProfile}
                  title="শিক্ষার্থীর তথ্য পরিবর্তন করুন"
                  className="p-1 rounded-lg bg-white/15 hover:bg-white/30 backdrop-blur-xs text-white/90 hover:text-white transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Class & Institution Tags */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-rose-50 border border-white/25">
                  <School className="w-3.5 h-3.5 text-rose-100" />
                  <span>{displayClass}</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/15 backdrop-blur-xs text-xs font-medium text-rose-100 border border-white/15">
                  <Building2 className="w-3.5 h-3.5 text-rose-200" />
                  <span className="truncate max-w-[190px] sm:max-w-none">{displayInstitution}</span>
                </div>
              </div>

              {/* Date & Greeting */}
              <div className="flex items-center gap-2 mt-2 text-xs text-rose-100 font-medium">
                <span className="opacity-90">{greeting}!</span>
                <span>•</span>
                <span className="flex items-center gap-1 opacity-90">
                  <Calendar className="w-3 h-3 text-rose-200" />
                  <span>{formattedToday}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action: Quick Focus Timer Button */}
          <div className="flex items-center gap-2.5 self-start md:self-center shrink-0">
            <button
              onClick={() => setActiveTab('timer')}
              className="flex items-center gap-2 bg-white text-rose-600 hover:bg-rose-50 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-rose-950/20 transition cursor-pointer"
            >
              <Timer className="w-4 h-4 text-rose-500" />
              <span>{t.dashboard.startTimer}</span>
            </button>
          </div>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-36 top-0 w-32 h-32 bg-pink-300/20 rounded-full blur-xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-10 w-28 h-28 bg-rose-400/20 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* 2. Key Metric Cards (Soft Rose Accents) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Today Study Time */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-100/80 dark:border-slate-800 shadow-2xs hover:border-rose-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.dashboard.todayStudyTime}
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {Math.floor(todayStudyMinutes / 60) > 0 && `${Math.floor(todayStudyMinutes / 60)}${t.dashboard.hours} `}
              {todayStudyMinutes % 60}
            </span>
            <span className="text-xs text-slate-500">{t.dashboard.minutes}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {t.dashboard.weeklyStudyTime}: {Math.floor(weeklyStudyMinutes / 60)} {t.dashboard.hours} {weeklyStudyMinutes % 60} {t.dashboard.minutes}
          </p>
        </div>

        {/* Metric 2: Study Streak */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-100/80 dark:border-slate-800 shadow-2xs hover:border-rose-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.dashboard.studyStreak}
            </span>
            <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-950/60 text-orange-500 dark:text-orange-400">
              <Flame className="w-4 h-4 fill-orange-500" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {studyStreak}
            </span>
            <span className="text-xs text-slate-500">{t.dashboard.days}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {studyStreak > 0 ? t.dashboard.streakFire : 'পড়া শুরু করে স্ট্রিক তৈরি করুন'}
          </p>
        </div>

        {/* Metric 3: Tasks Due Today */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-100/80 dark:border-slate-800 shadow-2xs hover:border-rose-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.dashboard.tasksDueToday}
            </span>
            <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {tasksDueTodayCount}
            </span>
            <span className="text-xs text-slate-500">টি</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {t.dashboard.pendingTasks}: {pendingTasksCount}
          </p>
        </div>

        {/* Metric 4: Completed Tasks */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-rose-100/80 dark:border-slate-800 shadow-2xs hover:border-rose-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t.dashboard.completedTasks}
            </span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {completedTasksCount}
            </span>
            <span className="text-xs text-slate-500">টি</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {tasks.length > 0 ? `${Math.round((completedTasksCount / tasks.length) * 100)}% সম্পন্ন` : 'কোনো টাস্ক নেই'}
          </p>
        </div>
      </div>

      {/* 3. Main Grid: Left Column (Routine & Urgent Tasks), Right Column (Exams & Weekly Trend) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Routine & Urgent Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Study Routine */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-100/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {t.dashboard.todayRoutine}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('routine')}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>পুরো রুটিন দেখুন</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayRoutines.length > 0 ? (
              <div className="space-y-2.5">
                {todayRoutines.map((routine) => {
                  const subject = subjectMap.get(routine.subject_id);
                  return (
                    <div
                      key={routine.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-rose-100/60 dark:border-slate-800/80 bg-rose-50/20 dark:bg-slate-800/40 hover:border-rose-200 transition"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-2.5 h-10 rounded-full" 
                          style={{ backgroundColor: subject?.color || '#f43f5e' }} 
                        />
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">
                            {subject?.name || 'বিষয় নির্ধারিত নেই'}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {routine.start_time} - {routine.end_time}
                            {routine.notes && ` • ${routine.notes}`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveTab('timer')}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 hover:bg-rose-200 transition cursor-pointer"
                      >
                        পড়া শুরু
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs bg-rose-50/30 dark:bg-slate-800/30 rounded-xl p-4">
                <p>{t.dashboard.noRoutineToday}</p>
                <button
                  onClick={() => setActiveTab('routine')}
                  className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  + রুটিন যোগ করুন
                </button>
              </div>
            )}
          </div>

          {/* Priority & Due Tasks */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-100/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ListTodo className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {t.dashboard.recentTasks}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('tasks')}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>সব টাস্ক ({tasks.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {urgentTasks.length > 0 ? (
              <div className="space-y-2">
                {urgentTasks.map((task) => {
                  const subject = task.subject_id ? subjectMap.get(task.subject_id) : undefined;
                  const isCompleted = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between p-3 rounded-xl border transition ${
                        isCompleted 
                          ? 'bg-slate-50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800 opacity-60' 
                          : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 shadow-2xs hover:border-rose-200'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                        <button
                          onClick={() => toggleTaskCompletion(task.id)}
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer shrink-0 ${
                            isCompleted 
                              ? 'bg-rose-500 border-rose-500 text-white' 
                              : 'border-slate-300 dark:border-slate-600 hover:border-rose-500'
                          }`}
                        >
                          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </button>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {subject && (
                              <span 
                                className="font-medium"
                                style={{ color: subject.color }}
                              >
                                {subject.name}
                              </span>
                            )}
                            {task.due_date && (
                              <span>জমা: {task.due_date === todayStr ? 'আজ' : task.due_date}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {task.priority === 'high' && !isCompleted && (
                        <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200">
                          জরুরি
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 dark:text-slate-400 text-xs bg-rose-50/30 dark:bg-slate-800/30 rounded-xl p-4">
                <p>{t.dashboard.noTasksToday}</p>
                <button
                  onClick={onOpenCreateTask}
                  className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  + নতুন টাস্ক যোগ করুন
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Quick Actions, Upcoming Exams & Mini 7-day Progress */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-100/80 dark:border-slate-800 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-rose-500" />
              <span>{t.dashboard.quickActions}</span>
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onOpenCreateTask}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-100 dark:border-slate-700/80 hover:bg-rose-50/50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                <Plus className="w-4 h-4 text-rose-500" />
                <span>{t.dashboard.newTask}</span>
              </button>
              <button
                onClick={onOpenCreateSubject}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-100 dark:border-slate-700/80 hover:bg-rose-50/50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-pink-500" />
                <span>{t.dashboard.newSubject}</span>
              </button>
              <button
                onClick={onOpenCreateExam}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-100 dark:border-slate-700/80 hover:bg-rose-50/50 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition cursor-pointer"
              >
                <Award className="w-4 h-4 text-amber-500" />
                <span>{t.dashboard.newExam}</span>
              </button>
              <button
                onClick={() => setActiveTab('timer')}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-rose-200 dark:border-rose-900/80 bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100/80 text-xs font-bold text-rose-800 dark:text-rose-300 transition cursor-pointer"
              >
                <Timer className="w-4 h-4 text-rose-600" />
                <span>{t.dashboard.startTimer}</span>
              </button>
            </div>
          </div>

          {/* Upcoming Exams Countdown */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-100/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-rose-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  {t.dashboard.upcomingExams}
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('exams')}
                className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                সবগুলো
              </button>
            </div>

            {upcomingExams.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingExams.map((exam) => {
                  const daysLeft = getDaysLeft(exam.exam_date);
                  const isToday = daysLeft === 0;
                  const subject = subjectMap.get(exam.subject_id);

                  return (
                    <div
                      key={exam.id}
                      className="p-3 rounded-xl border border-rose-100/60 dark:border-slate-800/80 bg-rose-50/20 dark:bg-slate-800/40 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                          {exam.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {subject?.name || 'বিষয়'} • {exam.exam_date}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        {isToday ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                            আজ পরীক্ষা!
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                            {daysLeft} দিন বাকি
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-4 text-center text-slate-400 text-xs">
                কোনো আসন্ন পরীক্ষা নেই
              </div>
            )}
          </div>

          {/* Past 7 Days Mini Chart (Rose & Pink Palette) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-rose-100/80 dark:border-slate-800 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300">
                {t.dashboard.weeklyTrend}
              </h3>
              <button
                onClick={() => setActiveTab('analytics')}
                className="text-[11px] text-rose-600 dark:text-rose-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>বিস্তারিত</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            <div className="h-28 flex items-end justify-between gap-1.5 pt-4">
              {past7DaysData.days.map((day) => {
                const heightPercent = Math.max(8, Math.round((day.minutes / past7DaysData.maxMins) * 100));
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400">
                      {day.minutes > 0 ? `${day.minutes}m` : ''}
                    </span>
                    <div 
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        day.isToday 
                          ? 'bg-gradient-to-t from-rose-500 to-pink-400 shadow-xs' 
                          : 'bg-rose-100 dark:bg-rose-950/60'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                      title={`${day.date}: ${day.minutes} mins`}
                    />
                    <span className={`text-[10px] font-semibold ${day.isToday ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-400'}`}>
                      {day.dayName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Edit Student Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-rose-100 dark:border-slate-800 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsEditProfileOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.dashboard.updateProfileModalTitle}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  আপনার নাম, শ্রেণি এবং শিক্ষা প্রতিষ্ঠানের নাম সেট করুন
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
              {/* Student Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.dashboard.studentName} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Student Class / Grade */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.dashboard.studentClass} *
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    placeholder="যেমন: একাদশ শ্রেণি (HSC 2026) / ১০ম শ্রেণি / অনার্স ২য় বর্ষ"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Institution Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.dashboard.studentInstitution} *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="যেমন: ঢাকা রেসিডেনসিয়াল মডেল কলেজ / নটর ডেম কলেজ"
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-md shadow-rose-500/20 transition disabled:opacity-50 cursor-pointer"
                >
                  {isSavingProfile ? t.common.loading : t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
