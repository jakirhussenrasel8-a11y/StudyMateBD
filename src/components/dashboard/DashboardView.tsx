import React, { useMemo, useState, useEffect } from 'react';
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
  ArrowRight,
  GraduationCap,
  Building2,
  Edit3,
  User,
  X,
  Sparkles,
  School,
  Search,
  Bell,
  Star,
  Users
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
    friends,
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
    setActiveTab,
    registerModal 
  } = useApp();

  const todayStr = getTodayDateString();

  // Profile Edit Modal State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [studentName, setStudentName] = useState(profile?.full_name || 'তানভীর আহমেদ');
  const [studentClass, setStudentClass] = useState(profile?.student_class || 'একাদশ শ্রেণি (HSC 2026)');
  const [institution, setInstitution] = useState(profile?.institution || 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sync profile when cloud data arrives
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setStudentName(profile.full_name);
      if (profile.student_class) setStudentClass(profile.student_class);
      if (profile.institution) setInstitution(profile.institution);
    }
  }, [profile]);

  // Register modal for Android back gesture
  useEffect(() => {
    if (isEditProfileOpen) {
      const unregister = registerModal('edit-profile');
      return unregister;
    }
  }, [isEditProfileOpen, registerModal]);

  // Dynamic greeting based on current local hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard.greetingMorning;
    if (hour < 17) return t.dashboard.greetingAfternoon;
    return t.dashboard.greetingEvening;
  }, [t]);

  // Formatted today's date
  const formattedToday = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [language]);

  // BD day of week (0 = Saturday, ..., 6 = Friday)
  const currentBdDayIndex = useMemo(() => {
    const jsDay = new Date().getDay();
    if (jsDay === 6) return 0;
    return jsDay + 1;
  }, []);

  // Today's routine slots
  const todayRoutines = useMemo(() => {
    return routines
      .filter(r => r.day_of_week === currentBdDayIndex)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [routines, currentBdDayIndex]);

  // Urgent tasks
  const urgentTasks = useMemo(() => {
    return tasks
      .filter(t => t.due_date === todayStr || t.priority === 'high')
      .slice(0, 5);
  }, [tasks, todayStr]);

  // Upcoming exams
  const upcomingExams = useMemo(() => {
    return exams
      .filter(e => e.exam_date >= todayStr)
      .sort((a, b) => a.exam_date.localeCompare(b.exam_date))
      .slice(0, 3);
  }, [exams, todayStr]);

  const getDaysLeft = (examDate: string) => {
    const today = new Date(todayStr);
    const target = new Date(examDate);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // 7-day capsule chart calculation (Matching Screen 3 of Reference Image)
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

  // Subject mapping
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

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'তানভীর আহমেদ';
  const displayClass = profile?.student_class || 'একাদশ শ্রেণি (HSC 2026)';
  const displayInstitution = profile?.institution || 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ';

  // Overall completion percentage
  const totalTasksCount = tasks.length;
  const progressPercent = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 45;

  const totalStudyHours = (todayStudyMinutes / 60).toFixed(1);

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in max-w-6xl mx-auto">
      {/* 1. Header Greeting & Progress Bar Pill (Reference Image Screen 2) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-3.5">
          {/* Avatar with pastel ring */}
          <div className="relative shrink-0">
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-lavender-200 dark:bg-charcoal-800 border-2 border-lavender-400 flex items-center justify-center text-charcoal-900 dark:text-white font-black text-lg shadow-xs overflow-hidden">
              <span className="text-xl">👨‍🎓</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-charcoal-500 dark:text-slate-400">
                {greeting},
              </span>
              <button 
                onClick={handleOpenEditProfile}
                className="text-xs font-bold text-lavender-600 dark:text-lavender-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Edit3 className="w-3 h-3" />
                <span>সম্পাদনা</span>
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">
              {displayName}
            </h1>
            {/* Class & Institution Tags */}
            <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-lavender-100 text-charcoal-800 dark:bg-charcoal-800 dark:text-lavender-200 font-bold border border-lavender-200/60 dark:border-charcoal-700">
                {displayClass}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FFF9E5] text-charcoal-800 dark:bg-charcoal-800 dark:text-amber-300 font-semibold border border-[#FFE49A]/60 dark:border-charcoal-700 truncate max-w-[200px]">
                {displayInstitution}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Pill Bar (Matching Screen 2 top pill) */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto bg-white dark:bg-charcoal-900 p-2.5 sm:px-4 rounded-full border border-[#E8E5ED] dark:border-charcoal-800 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-charcoal-700 dark:text-slate-300">
            <Sparkles className="w-4 h-4 text-lavender-500" />
            <span>অগ্রগতি</span>
          </div>
          <div className="w-28 sm:w-36 h-3 bg-[#F2EDF8] dark:bg-charcoal-800 rounded-full overflow-hidden p-0.5 border border-lavender-200/50">
            <div 
              className="h-full bg-lavender-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.max(10, progressPercent)}%` }}
            />
          </div>
          <span className="text-xs font-black text-charcoal-900 dark:text-white font-mono">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* 2. Headline: "Your Progress Today" with Quick Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-charcoal-900 dark:text-white tracking-tight">
            {language === 'bn' ? 'আজকের অগ্রগতি ও পড়াশোনা' : 'Your Progress Today'}
          </h2>
          <p className="text-xs sm:text-sm text-charcoal-500 dark:text-slate-400 font-medium mt-0.5">
            {formattedToday}
          </p>
        </div>

        {/* Quick Focus Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('timer')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-charcoal-900 hover:bg-black text-white dark:bg-white dark:text-charcoal-900 font-black text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
          >
            <div className="w-5 h-5 rounded-full bg-lavender-400 flex items-center justify-center text-charcoal-900">
              <Timer className="w-3 h-3 text-charcoal-900" />
            </div>
            <span>{t.dashboard.startTimer}</span>
          </button>
        </div>
      </div>

      {/* 3. "Learning Time Tracker" Dual Cards (Reference Image Screen 3) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-charcoal-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>{language === 'bn' ? 'লার্নিং টাইম ট্র্যাকার' : 'Learning Time Tracker'}</span>
          </h3>
          <span className="text-xs text-charcoal-500 dark:text-slate-400 font-medium">
            সাপ্তাহিক ও দৈনিক পরিসংখ্যান
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Lessons / Tasks Done (Pastel Mint #CFE4E0) */}
          <div className="bg-[#E6F4F1] dark:bg-pastelMint-500/10 rounded-3xl p-5 border border-pastelMint-200 dark:border-pastelMint-500/30 flex flex-col justify-between shadow-xs relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-charcoal-700 dark:text-pastelMint-200 text-xs font-bold">
                <div className="p-2 rounded-2xl bg-white dark:bg-charcoal-800 text-pastelMint-500 shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span>টাস্ক ও লেসন</span>
              </div>
              <button 
                onClick={() => setActiveTab('tasks')}
                className="w-8 h-8 rounded-full bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition cursor-pointer"
                title="টাস্ক পেইজ"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-charcoal-900 dark:text-white font-mono">
                {completedTasksCount}
              </span>
              <span className="text-xs text-charcoal-500 dark:text-pastelMint-200 font-bold">
                / {totalTasksCount} সম্পন্ন
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-pastelMint-200/80 dark:border-pastelMint-500/20 text-[11px] text-charcoal-600 dark:text-slate-300 font-medium">
              বাকি আছে: <span className="font-bold text-charcoal-900 dark:text-white">{pendingTasksCount} টি</span>
            </div>
          </div>

          {/* Card 2: Study Hours (Soft Yellow #FFE49A) */}
          <div className="bg-[#FFF9E5] dark:bg-pastelYellow-400/10 rounded-3xl p-5 border border-[#FFE49A] dark:border-pastelYellow-400/30 flex flex-col justify-between shadow-xs relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-charcoal-700 dark:text-amber-200 text-xs font-bold">
                <div className="p-2 rounded-2xl bg-white dark:bg-charcoal-800 text-amber-500 shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <span>পড়ার সময় (আজ)</span>
              </div>
              <button 
                onClick={() => setActiveTab('timer')}
                className="w-8 h-8 rounded-full bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition cursor-pointer"
                title="টাইমার শুরু করুন"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-charcoal-900 dark:text-white font-mono">
                {Math.floor(todayStudyMinutes / 60) > 0 && `${Math.floor(todayStudyMinutes / 60)}h `}
                {todayStudyMinutes % 60}m
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-[#FFE49A]/80 dark:border-pastelYellow-400/20 text-[11px] text-charcoal-600 dark:text-slate-300 font-medium">
              সাপ্তাহিক মোট: <span className="font-bold text-charcoal-900 dark:text-white">{Math.floor(weeklyStudyMinutes / 60)} ঘণ্টা {weeklyStudyMinutes % 60} মি.</span>
            </div>
          </div>

          {/* Card 3: Study Streak (Soft Lavender #F2EDF8) */}
          <div className="bg-[#F2EDF8] dark:bg-lavender-950/20 rounded-3xl p-5 border border-lavender-200 dark:border-lavender-800/40 flex flex-col justify-between shadow-xs relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-charcoal-700 dark:text-lavender-200 text-xs font-bold">
                <div className="p-2 rounded-2xl bg-white dark:bg-charcoal-800 text-orange-500 shadow-xs">
                  <Flame className="w-4 h-4 fill-orange-500" />
                </div>
                <span>স্টাডি স্ট্রিক</span>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white">
                প্রতিদিন
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-charcoal-900 dark:text-white font-mono">
                {studyStreak}
              </span>
              <span className="text-xs text-charcoal-500 dark:text-lavender-200 font-bold">
                দিন নিয়মিত
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-lavender-200 dark:border-lavender-800/30 text-[11px] text-charcoal-600 dark:text-slate-300 font-medium">
              {studyStreak > 0 ? 'নিয়ম ধরে রাখুন! দারুণ অগ্রগতি 🔥' : 'আজকেই একটি সেশন শেষ করে স্ট্রিক শুরু করুন'}
            </div>
          </div>

          {/* Card 4: Upcoming Exams (Soft Blue #E4F1FD) */}
          <div className="bg-[#E4F1FD] dark:bg-pastelBlue-400/10 rounded-3xl p-5 border border-pastelBlue-200 dark:border-pastelBlue-400/30 flex flex-col justify-between shadow-xs relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-charcoal-700 dark:text-blue-200 text-xs font-bold">
                <div className="p-2 rounded-2xl bg-white dark:bg-charcoal-800 text-blue-500 shadow-xs">
                  <Award className="w-4 h-4" />
                </div>
                <span>আসন্ন পরীক্ষা</span>
              </div>
              <button 
                onClick={() => setActiveTab('exams')}
                className="w-8 h-8 rounded-full bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition cursor-pointer"
                title="পরীক্ষা তালিকা"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-charcoal-900 dark:text-white font-mono">
                {upcomingExams.length}
              </span>
              <span className="text-xs text-charcoal-500 dark:text-blue-200 font-bold">
                টি সামনে আছে
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-pastelBlue-200/80 dark:border-pastelBlue-400/20 text-[11px] text-charcoal-600 dark:text-slate-300 font-medium truncate">
              {upcomingExams[0] ? `${upcomingExams[0].title} (${getDaysLeft(upcomingExams[0].exam_date)} দিন বাকি)` : 'কোনো পরীক্ষা শিডিউল নেই'}
            </div>
          </div>
        </div>
      </div>

      {/* 4. "Progress" Capsule Bar Chart (Reference Image Screen 3) */}
      <div className="bg-[#F2EDF8] dark:bg-charcoal-900/80 rounded-3xl p-6 border border-lavender-200 dark:border-charcoal-800 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-lavender-400 flex items-center justify-center text-charcoal-900">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-base text-charcoal-900 dark:text-white">
                {language === 'bn' ? 'গত ৭ দিনের পড়ার অগ্রগতি' : 'Progress'}
              </h3>
              <p className="text-xs text-charcoal-500 dark:text-slate-400">
                প্রতিদিনের মোট পড়াশোনার মিনিট
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('analytics')}
            className="text-xs font-black text-charcoal-900 dark:text-lavender-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>পূর্ণ রিপোর্ট</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Vertical Capsule Pill Bars (Matching reference Screen 3) */}
        <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-6">
          {past7DaysData.days.map((day, idx) => {
            const heightPercent = Math.max(15, Math.round((day.minutes / past7DaysData.maxMins) * 100));
            // Rotate colors like in reference: pastelYellow, lavender, pastelMint
            const isHighlighted = day.isToday;
            const barBg = idx % 3 === 0 
              ? 'bg-[#FFE49A]' 
              : idx % 3 === 1 
              ? 'bg-lavender-400' 
              : 'bg-[#CFE4E0]';

            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                {/* Outer Capsule Column with Striped Top */}
                <div className="w-full max-w-[48px] h-full flex flex-col justify-end bg-white/60 dark:bg-charcoal-800/60 rounded-t-full rounded-b-3xl p-1 relative overflow-hidden border border-lavender-200/50">
                  {/* Striped hatched pattern top background */}
                  <div className="absolute inset-x-0 top-0 bottom-1/2 striped-pill opacity-70 pointer-events-none" />

                  {/* Solid colored bottom capsule */}
                  <div 
                    className={`w-full rounded-t-full rounded-b-2xl transition-all duration-500 flex flex-col items-center justify-between p-1 relative z-10 ${barBg}`}
                    style={{ height: `${heightPercent}%` }}
                  >
                    {/* Badge circle with number */}
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-charcoal-900 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold font-mono">
                      {day.minutes > 0 ? day.minutes : '0'}
                    </div>

                    <span className="text-[9px] font-bold text-charcoal-900/80 hidden sm:inline">
                      মি.
                    </span>
                  </div>
                </div>

                {/* Day Label */}
                <span className={`text-[11px] font-black tracking-tight ${isHighlighted ? 'text-charcoal-900 dark:text-white font-black' : 'text-charcoal-500 dark:text-slate-400'}`}>
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Subject Cards Showcase (Reference Image Screen 2) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-charcoal-900 dark:text-white tracking-tight">
              {t.nav.subjects}
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-slate-400">
              আপনার সক্রিয় পাঠ্য বিষয়সমূহ
            </p>
          </div>

          <button
            onClick={onOpenCreateSubject}
            className="text-xs font-bold text-charcoal-900 dark:text-white bg-white dark:bg-charcoal-800 px-3.5 py-1.5 rounded-full border border-[#E8E5ED] dark:border-charcoal-700 hover:bg-[#F2EDF8] transition cursor-pointer flex items-center gap-1 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>নতুন বিষয়</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.slice(0, 4).map((sub, idx) => {
            const isMint = idx % 2 === 0;
            const cardBg = isMint 
              ? 'bg-[#E6F4F1] dark:bg-pastelMint-500/10 border-pastelMint-200 dark:border-pastelMint-500/30' 
              : 'bg-[#F2EDF8] dark:bg-lavender-950/20 border-lavender-200 dark:border-lavender-800/40';

            const subTasks = tasks.filter(t => t.subject_id === sub.id);
            const doneTasks = subTasks.filter(t => t.status === 'completed').length;

            return (
              <div 
                key={sub.id} 
                className={`rounded-[28px] p-5 sm:p-6 border ${cardBg} flex flex-col justify-between shadow-xs transition hover:shadow-md group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-white dark:bg-charcoal-800 flex items-center justify-center text-charcoal-900 shadow-xs">
                      <BookOpen className="w-5 h-5 text-charcoal-800 dark:text-white" />
                    </div>

                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-xs font-black shadow-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{doneTasks}/{subTasks.length || 1}</span>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-charcoal-500 dark:text-slate-400 uppercase tracking-wider">
                    {sub.description || 'পাঠ্য বিষয়'}
                  </span>

                  <h4 className="text-base sm:text-lg font-black text-charcoal-900 dark:text-white tracking-tight mt-1 line-clamp-1">
                    {sub.name}
                  </h4>
                </div>

                <div className="mt-5 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-charcoal-700 dark:text-slate-300">
                      {subTasks.length} টি টাস্ক
                    </span>
                  </div>

                  <button
                    onClick={() => setActiveTab('tasks')}
                    className="w-10 h-10 rounded-full bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition cursor-pointer"
                    title="বিষয়ের টাস্ক দেখুন"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5.5. Study Friends Activity Snapshot */}
      <div className="bg-white dark:bg-charcoal-900 rounded-[28px] p-5 sm:p-6 border border-[#E8E5ED] dark:border-charcoal-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-lavender-100 text-charcoal-900 dark:bg-lavender-950 dark:text-lavender-300 flex items-center justify-center">
              <Users className="w-5 h-5 text-lavender-600 dark:text-lavender-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-charcoal-900 dark:text-white">
                {t.friends.title}
              </h3>
              <p className="text-xs text-charcoal-500 dark:text-slate-400">
                বন্ধুদের সাথে পড়ালেখা ও দৈনিক স্ট্রিক
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('friends')}
            className="text-xs font-black text-charcoal-900 dark:text-white bg-[#F2EDF8] hover:bg-lavender-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 px-3.5 py-1.5 rounded-full transition cursor-pointer flex items-center gap-1"
          >
            <span>সবাই ({friends.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Friends Avatars & Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {friends.slice(0, 3).map((friend) => (
            <div
              key={friend.id}
              onClick={() => setActiveTab('friends')}
              className="p-3.5 rounded-2xl bg-[#F8F7FA] dark:bg-charcoal-800/60 border border-[#E8E5ED] dark:border-charcoal-700/80 hover:border-lavender-300 transition cursor-pointer flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#CFE4E0] to-[#C5A7E2] text-charcoal-900 font-black text-sm flex items-center justify-center shrink-0">
                  {friend.friend_name[0] || 'ব'}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-black text-charcoal-900 dark:text-white truncate">
                    {friend.friend_name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] text-charcoal-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-bold">
                      <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                      {friend.study_streak} দিন
                    </span>
                    <span>•</span>
                    <span>{(friend.today_minutes / 60).toFixed(1)}ঘ</span>
                  </div>
                </div>
              </div>

              <span className="text-[10px] font-bold text-lavender-600 dark:text-lavender-400 shrink-0">
                {friend.completed_tasks}টি টাস্ক
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Today's Routine & Urgent Tasks Dual Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Study Routine */}
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-5 sm:p-6 border border-[#E8E5ED] dark:border-charcoal-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-lavender-500" />
              <h3 className="font-black text-base text-charcoal-900 dark:text-white">
                {t.dashboard.todayRoutine}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('routine')}
              className="text-xs font-bold text-lavender-600 dark:text-lavender-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>পুরো রুটিন</span>
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
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-[#E8E5ED] dark:border-charcoal-800 bg-[#F8F7FA] dark:bg-charcoal-800/50 hover:border-lavender-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-10 rounded-full" 
                        style={{ backgroundColor: subject?.color || '#C5A7E2' }} 
                      />
                      <div>
                        <p className="font-extrabold text-sm text-charcoal-900 dark:text-white">
                          {subject?.name || 'বিষয় নির্ধারিত নেই'}
                        </p>
                        <p className="text-xs text-charcoal-500 dark:text-slate-400 mt-0.5">
                          {routine.start_time} - {routine.end_time}
                          {routine.notes && ` • ${routine.notes}`}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveTab('timer')}
                      className="px-3 py-1.5 text-xs font-black rounded-full bg-white dark:bg-charcoal-700 text-charcoal-900 dark:text-white border border-[#E8E5ED] dark:border-charcoal-600 hover:bg-[#F2EDF8] transition cursor-pointer shadow-2xs"
                    >
                      পড়া শুরু
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-charcoal-500 dark:text-slate-400 text-xs bg-[#F8F7FA] dark:bg-charcoal-800/30 rounded-2xl p-4">
              <p>{t.dashboard.noRoutineToday}</p>
              <button
                onClick={() => setActiveTab('routine')}
                className="mt-2 text-xs font-bold text-lavender-600 dark:text-lavender-400 hover:underline cursor-pointer"
              >
                + রুটিন যোগ করুন
              </button>
            </div>
          )}
        </div>

        {/* Priority & Due Tasks */}
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-5 sm:p-6 border border-[#E8E5ED] dark:border-charcoal-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-lavender-500" />
              <h3 className="font-black text-base text-charcoal-900 dark:text-white">
                {t.dashboard.recentTasks}
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-bold text-lavender-600 dark:text-lavender-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>সব টাস্ক ({tasks.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {urgentTasks.length > 0 ? (
            <div className="space-y-2.5">
              {urgentTasks.map((task) => {
                const subject = task.subject_id ? subjectMap.get(task.subject_id) : undefined;
                const isCompleted = task.status === 'completed';
                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition ${
                      isCompleted 
                        ? 'bg-[#F8F7FA] dark:bg-charcoal-800/30 border-transparent opacity-60' 
                        : 'bg-white dark:bg-charcoal-800/60 border-[#E8E5ED] dark:border-charcoal-700 shadow-2xs hover:border-lavender-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center transition cursor-pointer shrink-0 ${
                          isCompleted 
                            ? 'bg-lavender-500 border-lavender-500 text-white' 
                            : 'border-[#E8E5ED] dark:border-charcoal-600 hover:border-lavender-400'
                        }`}
                      >
                        {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold truncate ${isCompleted ? 'line-through text-charcoal-400' : 'text-charcoal-900 dark:text-white'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-charcoal-500 dark:text-slate-400">
                          {subject && (
                            <span 
                              className="font-bold"
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
                      <span className="shrink-0 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#FFE49A] text-charcoal-900 border border-[#FFE49A]">
                        জরুরি
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-8 text-center text-charcoal-500 dark:text-slate-400 text-xs bg-[#F8F7FA] dark:bg-charcoal-800/30 rounded-2xl p-4">
              <p>{t.dashboard.noTasksToday}</p>
              <button
                onClick={onOpenCreateTask}
                className="mt-2 text-xs font-bold text-lavender-600 dark:text-lavender-400 hover:underline cursor-pointer"
              >
                + নতুন টাস্ক যোগ করুন
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 7. Edit Student Profile Modal (Mobile Bottom-Sheet) */}
      {isEditProfileOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsEditProfileOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-charcoal-900 rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-[#E8E5ED] dark:border-charcoal-800 p-6 relative max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-[#E8E5ED] dark:bg-charcoal-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

            <button
              onClick={() => setIsEditProfileOpen(false)}
              className="absolute top-5 right-5 p-1.5 text-charcoal-400 hover:text-charcoal-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-charcoal-800 transition cursor-pointer active:scale-90"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4 shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-lavender-400 text-charcoal-900 flex items-center justify-center font-bold shadow-xs shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-charcoal-900 dark:text-white">
                  {t.dashboard.updateProfileModalTitle}
                </h3>
                <p className="text-xs text-charcoal-500 dark:text-slate-400">
                  আপনার নাম, শ্রেণি এবং শিক্ষা প্রতিষ্ঠানের নাম সেট করুন
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 pt-1 overflow-y-auto pr-1 flex-1 touch-manipulation">
              <div>
                <label className="block text-xs font-black text-charcoal-800 dark:text-slate-200 mb-1">
                  {t.dashboard.studentName} *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="যেমন: তানভীর আহমেদ"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 focus:outline-hidden focus:ring-2 focus:ring-lavender-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-charcoal-800 dark:text-slate-200 mb-1">
                  {t.dashboard.studentClass} *
                </label>
                <div className="relative">
                  <School className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    placeholder="যেমন: একাদশ শ্রেণি (HSC 2026)"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 focus:outline-hidden focus:ring-2 focus:ring-lavender-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-charcoal-800 dark:text-slate-200 mb-1">
                  {t.dashboard.studentInstitution} *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="যেমন: ঢাকা রেসিডেনসিয়াল মডেল কলেজ"
                    className="w-full pl-10 pr-3.5 py-2.5 text-sm font-semibold rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 focus:outline-hidden focus:ring-2 focus:ring-lavender-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E8E5ED] dark:border-charcoal-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-charcoal-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-charcoal-800 rounded-full transition cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="flex-1 sm:flex-initial px-6 py-2.5 text-xs font-black text-white dark:text-charcoal-900 bg-charcoal-900 dark:bg-white rounded-full shadow-md transition disabled:opacity-50 cursor-pointer active:scale-95"
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
