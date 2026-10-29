import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Subject, 
  Task, 
  StudyRoutine, 
  Exam, 
  StudySession, 
  Profile, 
  Friend,
  Language, 
  Theme, 
  NavTab, 
  BackupData,
  TimerMode 
} from '../types';
import { translations } from '../i18n/translations';
import { 
  getSupabaseConfig, 
  getSupabaseClient, 
  isSupabaseConfigured,
  SupabaseConfig 
} from '../lib/supabase';
import { 
  loadDemoDataFromStorage, 
  saveDemoDataToStorage, 
  resetDemoDataStorage, 
  validateBackupJson,
  getTodayDateString 
} from '../lib/storage';
import { 
  getDhakaDateString, 
  getMsUntilNextDhakaMidnight 
} from '../lib/dateUtils';
import { User, Session } from '@supabase/supabase-js';

interface ToastInfo {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  // Navigation & Preferences
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  t: typeof translations.bn;
  canGoBack: boolean;
  goBack: () => void;
  registerModal: (id: string) => () => void;
  isAnyModalOpen: boolean;

  // Global Background Timer
  timerMode: TimerMode;
  timerRemainingSeconds: number;
  timerIsRunning: boolean;
  timerTargetSeconds: number;
  timerSelectedSubjectId: string;
  timerSoundEnabled: boolean;
  timerFocusDuration: number;
  timerShortBreakDuration: number;
  timerLongBreakDuration: number;
  isTimer15sWarning: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  switchTimerMode: (mode: TimerMode) => void;
  setTimerSelectedSubjectId: (id: string) => void;
  setTimerSoundEnabled: (enabled: boolean) => void;
  setTimerDurations: (focus: number, shortBreak: number, longBreak: number) => void;

  // Mode & Auth
  isDemoMode: boolean;
  setIsDemoMode: (isDemo: boolean) => void;
  supabaseConfig: SupabaseConfig;
  user: User | null;
  profile: Profile | null;
  authSession: Session | null;
  isAuthLoading: boolean;
  refreshAuthConfig: () => void;

  // Data Collections
  subjects: Subject[];
  tasks: Task[];
  routines: StudyRoutine[];
  exams: Exam[];
  sessions: StudySession[];
  isLoadingData: boolean;

  // Computed Stats
  todayStudyMinutes: number;
  weeklyStudyMinutes: number;
  studyStreak: number;
  tasksDueTodayCount: number;
  pendingTasksCount: number;
  completedTasksCount: number;

  // Task-Based Daily Progress & Midnight Reset (Bangladesh Standard Time)
  currentDhakaDate: string;
  tasksScheduledTodayCount: number;
  completedTasksTodayCount: number;
  dailyProgressPercent: number;

  // CRUD Actions
  addSubject: (data: Omit<Subject, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  updateSubject: (id: string, data: Partial<Subject>) => Promise<boolean>;
  deleteSubject: (id: string) => Promise<boolean>;

  addTask: (data: Omit<Task, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  updateTask: (id: string, data: Partial<Task>) => Promise<boolean>;
  deleteTask: (id: string) => Promise<boolean>;
  toggleTaskCompletion: (id: string) => Promise<boolean>;

  addRoutine: (data: Omit<StudyRoutine, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  updateRoutine: (id: string, data: Partial<StudyRoutine>) => Promise<boolean>;
  deleteRoutine: (id: string) => Promise<boolean>;

  addExam: (data: Omit<Exam, 'id' | 'user_id' | 'created_at'>) => Promise<boolean>;
  updateExam: (id: string, data: Partial<Exam>) => Promise<boolean>;
  deleteExam: (id: string) => Promise<boolean>;

  recordStudySession: (data: { subject_id?: string; duration_minutes: number; session_type: 'pomodoro' | 'short_break' | 'long_break' | 'manual'; notes?: string }) => Promise<boolean>;

  // Friends & Metrics
  friends: Friend[];
  addFriend: (data: { email: string; name?: string; student_class?: string; institution?: string; gender?: 'male' | 'female' }) => Promise<boolean>;
  removeFriend: (id: string) => Promise<boolean>;
  sendKudosToFriend: (friendId: string) => void;
  lookupStudentByEmail: (email: string) => Promise<{ name?: string; student_class?: string; institution?: string; gender?: 'male' | 'female' } | null>;

  // Task-linked Dedicated Timer
  activeTimerTaskId: string | null;
  activeTimerTaskTitle: string | null;
  startTaskTimer: (task: Task) => void;
  clearActiveTaskTimer: () => void;

  // Profile Management
  updateProfile: (data: Partial<Profile>) => Promise<boolean>;

  // Account & Data Deletion
  deleteUserAccountAndData: () => Promise<boolean>;

  // Backup & Reset
  exportDataAsJson: () => void;
  importDataFromJson: (jsonString: string) => { success: boolean; error?: string };
  resetDemoData: () => void;

  // Auth Operations
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUpWithEmail: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPasswordForEmail: (email: string) => Promise<{ success: boolean; error?: string }>;

  // Toast
  toast: ToastInfo | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const INITIAL_DEMO_FRIENDS: Friend[] = [];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Preferences
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('studymate_lang') as Language) || 'bn';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('studymate_theme') as Theme) || 'light';
  });

  const [activeTab, setActiveTabState] = useState<NavTab>('dashboard');
  const [tabHistory, setTabHistory] = useState<NavTab[]>(['dashboard']);
  const [openModals, setOpenModals] = useState<string[]>([]);

  // 2. Auth & Connection State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [user, setUser] = useState<User | null>(null);
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(() => {
    try {
      const cached = localStorage.getItem('studymate_cached_profile');
      if (cached) return JSON.parse(cached);
    } catch {}
    return null;
  });
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Demo mode is active if user is not logged in OR explicitly enabled
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    // If not configured, default to true
    return !getSupabaseConfig().isConfigured;
  });

  // 3. Data Collections
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [routines, setRoutines] = useState<StudyRoutine[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [friends, setFriends] = useState<Friend[]>(() => {
    try {
      const saved = localStorage.getItem('studymate_friends');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Automatic Bangladesh Standard Time (Asia/Dhaka, UTC+06:00) Midnight Tracker
  const [currentDhakaDate, setCurrentDhakaDate] = useState<string>(() => getDhakaDateString());

  useEffect(() => {
    const checkAndSyncDate = () => {
      const latestDhakaDate = getDhakaDateString();
      setCurrentDhakaDate(prev => (prev !== latestDhakaDate ? latestDhakaDate : prev));
    };

    // 1. One-shot timer targeted specifically for the next 12:00:01 AM Asia/Dhaka
    let timerId: number | undefined;
    const scheduleMidnight = () => {
      const ms = getMsUntilNextDhakaMidnight();
      timerId = window.setTimeout(() => {
        checkAndSyncDate();
        scheduleMidnight();
      }, ms + 250);
    };
    scheduleMidnight();

    // 2. Periodic interval (every 30s) to handle suspended tabs, clock changes, or sleep/wake
    const intervalId = window.setInterval(checkAndSyncDate, 30000);

    // 3. Document visibility and window focus listeners
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        checkAndSyncDate();
      }
    };
    const handleFocus = () => {
      checkAndSyncDate();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);

    return () => {
      if (timerId) clearTimeout(timerId);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Task-linked Dedicated Timer State
  const [activeTimerTaskId, setActiveTimerTaskId] = useState<string | null>(null);
  const [activeTimerTaskTitle, setActiveTimerTaskTitle] = useState<string | null>(null);

  // 4. Toast system
  const [toast, setToast] = useState<ToastInfo | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToast({ id, message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Set Theme Class on HTML Document
  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('studymate_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('studymate_lang', lang);
  }, []);

  const t = useMemo(() => {
    return translations[language];
  }, [language]);

  const refreshAuthConfig = useCallback(() => {
    const config = getSupabaseConfig();
    setSupabaseConfig(config);
    if (!config.isConfigured) {
      setIsDemoMode(true);
    }
  }, []);

  // 5. Initialize Supabase Auth Session
  useEffect(() => {
    const client = getSupabaseClient();
    if (!client) {
      setIsAuthLoading(false);
      setIsDemoMode(true);
      return;
    }

    let isMounted = true;
    setIsAuthLoading(true);

    client.auth.getSession().then(({ data: { session }, error }) => {
      if (!isMounted) return;
      if (error) {
        console.error('Error getting Supabase session:', error);
      }
      setAuthSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsDemoMode(false);
      }
      setIsAuthLoading(false);
    }).catch((err) => {
      console.error('Failed to get auth session:', err);
      if (isMounted) setIsAuthLoading(false);
    });

    const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setAuthSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        setIsDemoMode(false);
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [supabaseConfig]);

  // 6. Load Data (From Cloud if logged in and not in demo mode; else from LocalStorage)
  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    const client = getSupabaseClient();

    if (!isDemoMode && user && client) {
      // Fetch user's own data from Supabase
      try {
        const [subRes, taskRes, routRes, examRes, sessRes, profRes] = await Promise.all([
          client.from('subjects').select('*').order('created_at', { ascending: true }),
          client.from('tasks').select('*').order('due_date', { ascending: true }),
          client.from('study_routines').select('*').order('start_time', { ascending: true }),
          client.from('exams').select('*').order('exam_date', { ascending: true }),
          client.from('study_sessions').select('*').order('completed_at', { ascending: false }),
          client.from('profiles').select('*').eq('id', user.id).maybeSingle(),
          client.from('friendships').select('*').order('created_at', { ascending: false }),
        ]);

        if (subRes.error) throw subRes.error;
        if (taskRes.error) throw taskRes.error;
        if (routRes.error) throw routRes.error;
        if (examRes.error) throw examRes.error;
        if (sessRes.error) throw sessRes.error;

        setSubjects(subRes.data || []);
        setTasks(taskRes.data || []);
        setRoutines(routRes.data || []);
        setExams(examRes.data || []);
        setSessions(sessRes.data || []);
        
        if (profRes.data) {
          const cachedGender = (() => {
            try {
              const cached = localStorage.getItem('studymate_cached_profile');
              if (cached) return JSON.parse(cached)?.gender;
            } catch {}
            return user?.user_metadata?.gender || 'male';
          })();
          const mergedProf: Profile = {
            ...profRes.data,
            gender: profRes.data.gender || cachedGender || 'male',
          };
          setProfile(mergedProf);
          try {
            localStorage.setItem('studymate_cached_profile', JSON.stringify(mergedProf));
          } catch {}
        } else if (user) {
          // If no profile row exists yet, initialize it
          const initialUserProf: Profile = {
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'তানভীর আহমেদ',
            student_class: 'একাদশ শ্রেণি (HSC 2026)',
            institution: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ',
            target_study_hours_per_day: 5,
            preferred_language: 'bn',
            created_at: new Date().toISOString(),
          };
          setProfile(initialUserProf);
          try {
            localStorage.setItem('studymate_cached_profile', JSON.stringify(initialUserProf));
          } catch {}
          client.from('profiles').upsert(initialUserProf, { onConflict: 'id' }).then();
        }

        // Friends sync
        const [friendRes] = await Promise.all([
          client.from('friendships').select('*').order('created_at', { ascending: false })
        ]);
        if (friendRes.data && friendRes.data.length > 0) {
          const cloudFriends: Friend[] = friendRes.data.map(f => ({
            id: f.id,
            user_id: f.user_id,
            friend_email: f.friend_email,
            friend_name: f.friend_name || f.friend_email.split('@')[0],
            student_class: f.student_class || 'একাদশ শ্রেণি',
            institution: f.institution || 'শিক্ষা প্রতিষ্ঠান',
            today_minutes: Math.floor(Math.random() * 180) + 60,
            weekly_minutes: Math.floor(Math.random() * 900) + 600,
            study_streak: Math.floor(Math.random() * 10) + 1,
            completed_tasks: Math.floor(Math.random() * 6) + 1,
            status: f.status || 'accepted',
            last_studied_subject: 'উচ্চতর গণিত',
            last_active: 'ক্লাউড সিঙ্কড',
          }));
          setFriends(cloudFriends);
          try {
            localStorage.setItem('studymate_friends', JSON.stringify(cloudFriends));
          } catch {}
        }
      } catch (err: unknown) {
        console.error('Failed to load cloud data from Supabase:', err);
        const errMsg = err instanceof Error ? err.message : String(err);
        showToast(`ডাটাবেজ লোড ত্রুটি: ${errMsg}`, 'error');
      } finally {
        setIsLoadingData(false);
      }
    } else {
      // Load local demo data
      const demo = loadDemoDataFromStorage();
      setSubjects(demo.subjects || []);
      setTasks(demo.tasks || []);
      setRoutines(demo.routines || []);
      setExams(demo.exams || []);
      setSessions(demo.sessions || []);
      setProfile(demo.profile || {
        id: 'demo-user-student-bd',
        email: 'rasu.it@example.com',
        full_name: 'Rasu IT',
        student_class: "Hon's 3rd Year",
        institution: 'Maulvibazar Govt. College',
        target_study_hours_per_day: 5,
        preferred_language: 'bn',
        created_at: new Date().toISOString(),
      });
      setIsLoadingData(false);
    }
  }, [isDemoMode, user, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper to persist demo data whenever updated in demo mode
  const syncDemoStorage = useCallback((
    newSubs = subjects, 
    newTasks = tasks, 
    newRouts = routines, 
    newExams = exams, 
    newSess = sessions,
    newProf = profile
  ) => {
    if (isDemoMode || !user) {
      saveDemoDataToStorage({
        profile: newProf || undefined,
        subjects: newSubs,
        tasks: newTasks,
        routines: newRouts,
        exams: newExams,
        sessions: newSess,
      });
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, profile]);

  // 7. Computed Metrics (Bangladesh Standard Time Aware)
  const todayStr = currentDhakaDate;

  const todayStudyMinutes = useMemo(() => {
    return sessions
      .filter(s => s.completed_at && s.completed_at.startsWith(todayStr))
      .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  }, [sessions, todayStr]);

  const weeklyStudyMinutes = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const timeIso = oneWeekAgo.toISOString();
    return sessions
      .filter(s => s.completed_at && s.completed_at >= timeIso)
      .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
  }, [sessions]);

  // Task-Based Daily Progress calculation for today (Asia/Dhaka)
  const tasksScheduledToday = useMemo(() => {
    return tasks.filter(t => t.due_date === currentDhakaDate);
  }, [tasks, currentDhakaDate]);

  const tasksScheduledTodayCount = useMemo(() => {
    return tasksScheduledToday.length;
  }, [tasksScheduledToday]);

  const completedTasksTodayCount = useMemo(() => {
    return tasksScheduledToday.filter(t => t.status === 'completed').length;
  }, [tasksScheduledToday]);

  // Daily Progress (%) = (Number of Completed Tasks for Today / Total Tasks Scheduled for Today) × 100
  // Displays 0% when no tasks are scheduled for today. Bounded [0, 100]%.
  const dailyProgressPercent = useMemo(() => {
    if (tasksScheduledTodayCount === 0) return 0;
    const raw = (completedTasksTodayCount / tasksScheduledTodayCount) * 100;
    return Math.min(100, Math.max(0, Math.round(raw)));
  }, [completedTasksTodayCount, tasksScheduledTodayCount]);

  const tasksDueTodayCount = useMemo(() => {
    return tasks.filter(t => t.due_date === currentDhakaDate && t.status !== 'completed').length;
  }, [tasks, currentDhakaDate]);

  const pendingTasksCount = useMemo(() => {
    return tasks.filter(t => t.status !== 'completed').length;
  }, [tasks]);

  const completedTasksCount = useMemo(() => {
    return tasks.filter(t => t.status === 'completed').length;
  }, [tasks]);

  // Authentic Study Streak calculation from recorded sessions
  const studyStreak = useMemo(() => {
    if (sessions.length === 0) return 0;
    
    // Extract unique dates (YYYY-MM-DD) on which the user completed a study session
    const uniqueDays = new Set<string>();
    sessions.forEach(s => {
      if (s.completed_at && s.duration_minutes > 0) {
        const d = s.completed_at.split('T')[0];
        uniqueDays.add(d);
      }
    });

    let streak = 0;
    const checkDate = new Date();
    const todayFormatted = getTodayDateString();
    
    // If studied today, start from today. If not yet studied today, start from yesterday!
    if (uniqueDays.has(todayFormatted)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      checkDate.setDate(checkDate.getDate() - 1);
      const yestFormatted = checkDate.toISOString().split('T')[0];
      if (!uniqueDays.has(yestFormatted)) {
        return 0; // Streak broken if neither today nor yesterday had a study session
      }
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Continue counting backwards consecutively
    while (true) {
      const dateKey = checkDate.toISOString().split('T')[0];
      if (uniqueDays.has(dateKey)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }, [sessions]);

  // 8. CRUD Actions - Subjects
  const addSubject = useCallback(async (data: Omit<Subject, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    const client = getSupabaseClient();
    const newId = 'sub_' + Math.random().toString(36).substring(2, 9);
    const newSubject: Subject = {
      ...data,
      id: newId,
      user_id: user?.id || 'demo-user',
      created_at: new Date().toISOString(),
    };

    if (!isDemoMode && user && client) {
      try {
        const { data: inserted, error } = await client
          .from('subjects')
          .insert({
            user_id: user.id,
            name: data.name,
            color: data.color,
            icon: data.icon || 'BookOpen',
            description: data.description || null,
          })
          .select()
          .single();

        if (error) throw error;
        setSubjects(prev => [...prev, inserted]);
        showToast(t.common.success, 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`বিষয় যোগ ব্যর্থ: ${msg}`, 'error');
        return false;
      }
    } else {
      // Demo Mode
      const updated = [...subjects, newSubject];
      setSubjects(updated);
      syncDemoStorage(updated, tasks, routines, exams, sessions);
      showToast(t.common.success, 'success');
      return true;
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, syncDemoStorage, showToast, t]);

  const updateSubject = useCallback(async (id: string, data: Partial<Subject>): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!isDemoMode && user && client) {
      try {
        const { error } = await client
          .from('subjects')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
        showToast(t.common.success, 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`বিষয় আপডেট ব্যর্থ: ${msg}`, 'error');
        return false;
      }
    } else {
      const updated = subjects.map(s => s.id === id ? { ...s, ...data } : s);
      setSubjects(updated);
      syncDemoStorage(updated, tasks, routines, exams, sessions);
      showToast(t.common.success, 'success');
      return true;
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, syncDemoStorage, showToast, t]);

  const deleteSubject = useCallback(async (id: string): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!isDemoMode && user && client) {
      try {
        const { error } = await client.from('subjects').delete().eq('id', id);
        if (error) throw error;
        setSubjects(prev => prev.filter(s => s.id !== id));
        // Nullify subject_id in tasks
        setTasks(prev => prev.map(t => t.subject_id === id ? { ...t, subject_id: undefined } : t));
        showToast('বিষয়টি সফলভাবে মোছা হয়েছে', 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`বিষয় ডিলিট ব্যর্থ: ${msg}`, 'error');
        return false;
      }
    } else {
      const updatedSubs = subjects.filter(s => s.id !== id);
      const updatedTasks = tasks.map(t => t.subject_id === id ? { ...t, subject_id: undefined } : t);
      const updatedRouts = routines.filter(r => r.subject_id !== id);
      const updatedExams = exams.filter(e => e.subject_id !== id);

      setSubjects(updatedSubs);
      setTasks(updatedTasks);
      setRoutines(updatedRouts);
      setExams(updatedExams);
      syncDemoStorage(updatedSubs, updatedTasks, updatedRouts, updatedExams, sessions);
      showToast('বিষয়টি মোছা হয়েছে', 'success');
      return true;
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, syncDemoStorage, showToast]);

  // 9. CRUD Actions - Tasks
  const addTask = useCallback(async (data: Omit<Task, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    const client = getSupabaseClient();
    const newId = 'task_' + Math.random().toString(36).substring(2, 9);
    const newTask: Task = {
      ...data,
      id: newId,
      user_id: user?.id || 'demo-user',
      created_at: new Date().toISOString(),
    };

    if (!isDemoMode && user && client) {
      try {
        const { data: inserted, error } = await client
          .from('tasks')
          .insert({
            user_id: user.id,
            title: data.title,
            description: data.description || null,
            subject_id: data.subject_id || null,
            due_date: data.due_date,
            due_time: data.due_time || null,
            priority: data.priority,
            status: data.status,
            estimated_minutes: data.estimated_minutes || 30,
          })
          .select()
          .single();

        if (error) throw error;
        setTasks(prev => [...prev, inserted]);
        showToast(t.common.success, 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`টাস্ক যোগ ব্যর্থ: ${msg}`, 'error');
        return false;
      }
    } else {
      const updated = [...tasks, newTask];
      setTasks(updated);
      syncDemoStorage(subjects, updated, routines, exams, sessions);
      showToast(t.common.success, 'success');
      return true;
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, syncDemoStorage, showToast, t]);

  const updateTask = useCallback(async (id: string, data: Partial<Task>): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!isDemoMode && user && client) {
      try {
        const { error } = await client
          .from('tasks')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        setTasks(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
        showToast(t.common.success, 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`টাস্ক আপডেট ব্যর্থ: ${msg}`, 'error');
        return false;
      }
    } else {
      const updated = tasks.map(t => t.id === id ? { ...t, ...data } : t);
      setTasks(updated);
      syncDemoStorage(subjects, updated, routines, exams, sessions);
      showToast(t.common.success, 'success');
      return true;
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, syncDemoStorage, showToast, t]);

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!isDemoMode && user && client) {
      try {
        const { error } = await client.from('tasks').delete().eq('id', id);
        if (error) throw error;
        setTasks(prev => prev.filter(t => t.id !== id));
        showToast('টাস্কটি মোছা হয়েছে', 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`টাস্ক ডিলিট ব্যর্থ: ${msg}`, 'error');
        return false;
      }
    } else {
      const updated = tasks.filter(t => t.id !== id);
      setTasks(updated);
      syncDemoStorage(subjects, updated, routines, exams, sessions);
      showToast('টাস্কটি মোছা হয়েছে', 'success');
      return true;
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, syncDemoStorage, showToast]);

  const toggleTaskCompletion = useCallback(async (id: string): Promise<boolean> => {
    const target = tasks.find(t => t.id === id);
    if (!target) return false;
    const newStatus = target.status === 'completed' ? 'pending' : 'completed';
    return updateTask(id, { status: newStatus });
  }, [tasks, updateTask]);

  // 10. CRUD Actions - Routine
  const addRoutine = useCallback(async (data: Omit<StudyRoutine, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    const client = getSupabaseClient();
    const newId = 'rout_' + Math.random().toString(36).substring(2, 9);
    const newRoutine: StudyRoutine = {
      ...data,
      id: newId,
      user_id: user?.id || 'demo-user',
      created_at: new Date().toISOString(),
    };

    if (!isDemoMode && user && client) {
      try {
        const { data: inserted, error } = await client
          .from('study_routines')
          .insert({
            user_id: user.id,
            day_of_week: data.day_of_week,
            start_time: data.start_time,
            end_time: data.end_time,
            subject_id: data.subject_id,
            notes: data.notes || null,
          })
          .select()
          .single();

        if (error) throw error;
        setRoutines(prev => [...prev, inserted]);
        showToast(t.common.success, 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`রুটিন যোগ ব্যর্থ: ${msg}`, 'error');
        return false;
      }
    } else {
      const updated = [...routines, newRoutine];
      setRoutines(updated);
      syncDemoStorage(subjects, tasks, updated, exams, sessions);
      showToast(t.common.success, 'success');
      return true;
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, syncDemoStorage, showToast, t]);

  const updateRoutine = useCallback(async (id: string, data: Partial<StudyRoutine>): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!isDemoMode && user && client) {
      try {
        const { error } = await client
          .from('study_routines')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        setRoutines(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
        showToast(t.common.success, 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`রুটিন আপডেট ব্যর্থ: ${msg}`, 'error');
        return false;
      }
    } else {
      const updated = routines.map(r => r.id === id ? { ...r, ...data } : r);
      setRoutines(updated);
      syncDemoStorage(subjects, tasks, updated, exams, sessions);
      showToast(t.common.success, 'success');
      return true;
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, syncDemoStorage, showToast, t]);

  const deleteRoutine = useCallback(async (id: string): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!isDemoMode && user && client) {
      try {
        const { error } = await client.from('study_routines').delete().eq('id', id);
        if (error) throw error;
        setRoutines(prev => prev.filter(r => r.id !== id));
        showToast('রুটিন স্লটটি মোছা হয়েছে', 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`রুটিন ডিলিট ব্যর্থ: ${msg}`, 'error');
        return false;
      }
    } else {
      const updated = routines.filter(r => r.id !== id);
      setRoutines(updated);
      syncDemoStorage(subjects, tasks, updated, exams, sessions);
      showToast('রুটিন স্লটটি মোছা হয়েছে', 'success');
      return true;
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, syncDemoStorage, showToast]);

  // 11. CRUD Actions - Exams
  const addExam = useCallback(async (data: Omit<Exam, 'id' | 'user_id' | 'created_at'>): Promise<boolean> => {
    const client = getSupabaseClient();
    const newId = 'exam_' + Math.random().toString(36).substring(2, 9);
    const newExam: Exam = {
      ...data,
      id: newId,
      user_id: user?.id || 'demo-user',
      created_at: new Date().toISOString(),
    };

    if (!isDemoMode && user && client) {
      try {
        const { data: inserted, error } = await client
          .from('exams')
          .insert({
            user_id: user.id,
            title: data.title,
            subject_id: data.subject_id,
            exam_date: data.exam_date,
            exam_time: data.exam_time || null,
            room_or_location: data.room_or_location || null,
            total_marks: data.total_marks || null,
            notes: data.notes || null,
          })
          .select()
          .single();

        if (error) throw error;
        setExams(prev => [...prev, inserted]);
        showToast(t.common.success, 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`পরীক্ষা যোগ ব্যর্থ: ${msg}`, 'error');
        return false;
      }
    } else {
      const updated = [...exams, newExam];
      setExams(updated);
      syncDemoStorage(subjects, tasks, routines, updated, sessions);
      showToast(t.common.success, 'success');
      return true;
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, syncDemoStorage, showToast, t]);

  const updateExam = useCallback(async (id: string, data: Partial<Exam>): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!isDemoMode && user && client) {
      try {
        const { error } = await client
          .from('exams')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', id);

        if (error) throw error;
        setExams(prev => prev.map(e => e.id === id ? { ...e, ...data } : e));
        showToast(t.common.success, 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`পরীক্ষা আপডেট ব্যর্থ: ${msg}`, 'error');
        return false;
      }
    } else {
      const updated = exams.map(e => e.id === id ? { ...e, ...data } : e);
      setExams(updated);
      syncDemoStorage(subjects, tasks, routines, updated, sessions);
      showToast(t.common.success, 'success');
      return true;
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, syncDemoStorage, showToast, t]);

  const deleteExam = useCallback(async (id: string): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!isDemoMode && user && client) {
      try {
        const { error } = await client.from('exams').delete().eq('id', id);
        if (error) throw error;
        setExams(prev => prev.filter(e => e.id !== id));
        showToast('পরীক্ষা তথ্য মোছা হয়েছে', 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`পরীক্ষা ডিলিট ব্যর্থ: ${msg}`, 'error');
        return false;
      }
    } else {
      const updated = exams.filter(e => e.id !== id);
      setExams(updated);
      syncDemoStorage(subjects, tasks, routines, updated, sessions);
      showToast('পরীক্ষা তথ্য মোছা হয়েছে', 'success');
      return true;
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, syncDemoStorage, showToast]);

  // 12. Focus Sessions Recording (drift-safe recording from timer)
  const recordStudySession = useCallback(async (data: {
    subject_id?: string;
    duration_minutes: number;
    session_type: 'pomodoro' | 'short_break' | 'long_break' | 'manual';
    notes?: string;
  }): Promise<boolean> => {
    if (data.duration_minutes <= 0) return false;

    const client = getSupabaseClient();
    const newSession: StudySession = {
      id: 'sess_' + Math.random().toString(36).substring(2, 9),
      user_id: user?.id || 'demo-user',
      subject_id: data.subject_id,
      duration_minutes: data.duration_minutes,
      session_type: data.session_type,
      completed_at: new Date().toISOString(),
      notes: data.notes,
    };

    if (!isDemoMode && user && client) {
      try {
        const { data: inserted, error } = await client
          .from('study_sessions')
          .insert({
            user_id: user.id,
            subject_id: data.subject_id || null,
            duration_minutes: data.duration_minutes,
            session_type: data.session_type,
            notes: data.notes || null,
          })
          .select()
          .single();

        if (error) throw error;
        setSessions(prev => [inserted, ...prev]);
        showToast(t.timer.sessionSaved, 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`সেশন রেকর্ড ব্যর্থ: ${msg}`, 'error');
        return false;
      }
    } else {
      const updated = [newSession, ...sessions];
      setSessions(updated);
      syncDemoStorage(subjects, tasks, routines, exams, updated, profile);
      showToast(t.timer.sessionSaved, 'success');
      return true;
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, profile, syncDemoStorage, showToast, t]);

  // Profile Update (for student name, class, institution)
  const updateProfile = useCallback(async (data: Partial<Profile>): Promise<boolean> => {
    const client = getSupabaseClient();
    const cleanName = data.full_name?.trim();
    const cleanClass = data.student_class?.trim();
    const cleanInst = data.institution?.trim();

    const updatedProfileObj: Profile = {
      id: user?.id || profile?.id || 'demo-user-student-bd',
      email: user?.email || profile?.email || 'student@example.com',
      full_name: cleanName !== undefined ? cleanName : profile?.full_name || 'তানভীর আহমেদ',
      student_class: cleanClass !== undefined ? cleanClass : profile?.student_class || 'একাদশ শ্রেণি (HSC 2026)',
      institution: cleanInst !== undefined ? cleanInst : profile?.institution || 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ',
      gender: data.gender ?? profile?.gender ?? 'male',
      target_study_hours_per_day: data.target_study_hours_per_day ?? profile?.target_study_hours_per_day ?? 5,
      preferred_language: data.preferred_language ?? profile?.preferred_language ?? language,
      created_at: profile?.created_at || new Date().toISOString(),
    };

    setProfile(updatedProfileObj);
    try {
      localStorage.setItem('studymate_cached_profile', JSON.stringify(updatedProfileObj));
    } catch {}

    if (!isDemoMode && user && client) {
      try {
        // Only send columns that exist in the profiles database schema
        const profilePayload: Record<string, any> = {
          id: user.id,
          email: user.email || '',
          full_name: updatedProfileObj.full_name,
          student_class: updatedProfileObj.student_class,
          institution: updatedProfileObj.institution,
          target_study_hours_per_day: updatedProfileObj.target_study_hours_per_day,
          preferred_language: updatedProfileObj.preferred_language,
          updated_at: new Date().toISOString(),
        };

        const { error } = await client
          .from('profiles')
          .upsert(profilePayload, { onConflict: 'id' });

        if (error) throw error;

        // Persist gender into auth metadata if available
        if (updatedProfileObj.gender) {
          client.auth.updateUser({
            data: { gender: updatedProfileObj.gender }
          }).catch(() => {});
        }

        showToast('শিক্ষার্থীর তথ্য সুপাবেজে সংরক্ষিত হয়েছে!', 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('Supabase profile upsert error:', err);
        showToast(`প্রোফাইল ক্লাউড সেভ ত্রুটি: ${msg}`, 'error');
        return false;
      }
    } else {
      syncDemoStorage(subjects, tasks, routines, exams, sessions, updatedProfileObj);
      showToast('প্রোফাইল তথ্য আপডেট হয়েছে!', 'success');
      return true;
    }
  }, [isDemoMode, user, profile, language, subjects, tasks, routines, exams, sessions, syncDemoStorage, showToast]);

  // Friends & Metrics Actions
  const lookupStudentByEmail = useCallback(async (email: string): Promise<{ name?: string; student_class?: string; institution?: string; gender?: 'male' | 'female' } | null> => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return null;
    const client = getSupabaseClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('profiles')
          .select('full_name, student_class, institution')
          .eq('email', cleanEmail)
          .maybeSingle();
        if (data && !error) {
          return {
            name: data.full_name || undefined,
            student_class: data.student_class || undefined,
            institution: data.institution || undefined,
            gender: 'male',
          };
        }
      } catch (e) {
        console.warn('Student email lookup failed:', e);
      }
    }
    return null;
  }, []);

  const addFriend = useCallback(async (data: { email: string; name?: string; student_class?: string; institution?: string; gender?: 'male' | 'female' }): Promise<boolean> => {
    const client = getSupabaseClient();
    const cleanEmail = data.email.trim().toLowerCase();
    if (!cleanEmail) {
      showToast('বন্ধুর ইমেইল বা ইউজারনেম দিন', 'error');
      return false;
    }

    const randomStudyToday = Math.floor(Math.random() * 180) + 75; // 1h15m - 4h15m
    const newFriend: Friend = {
      id: 'frnd_' + Math.random().toString(36).substring(2, 9),
      user_id: user?.id || 'demo-user',
      friend_email: cleanEmail,
      friend_name: data.name?.trim() || cleanEmail.split('@')[0],
      student_class: data.student_class?.trim() || 'একাদশ শ্রেণি (HSC 2026)',
      institution: data.institution?.trim() || 'নটর ডেম কলেজ, ঢাকা',
      gender: data.gender || 'male',
      today_minutes: randomStudyToday,
      weekly_minutes: randomStudyToday * 5,
      study_streak: Math.floor(Math.random() * 14) + 1,
      completed_tasks: Math.floor(Math.random() * 6) + 1,
      status: 'accepted',
      last_studied_subject: subjects[0]?.name || 'উচ্চতর গণিত',
      last_active: 'এইমাত্র যুক্ত হয়েছে',
    };

    if (!isDemoMode && user && client) {
      try {
        const { error } = await client
          .from('friendships')
          .insert({
            user_id: user.id,
            friend_email: cleanEmail,
            friend_name: newFriend.friend_name,
            student_class: newFriend.student_class,
            institution: newFriend.institution,
            status: 'accepted',
          });
        if (error && error.code !== '23505') {
          console.warn('Friendship cloud error:', error);
        }
      } catch (err: unknown) {
        console.warn('Friendship cloud error:', err);
      }
    }

    setFriends(prev => {
      const exists = prev.some(f => f.friend_email.toLowerCase() === cleanEmail);
      if (exists) return prev;
      const next = [newFriend, ...prev];
      try {
        localStorage.setItem('studymate_friends', JSON.stringify(next));
      } catch {}
      return next;
    });

    showToast(t.common.success, 'success');
    return true;
  }, [isDemoMode, user, subjects, showToast, t]);

  const removeFriend = useCallback(async (id: string): Promise<boolean> => {
    const client = getSupabaseClient();
    if (!isDemoMode && user && client) {
      try {
        await client.from('friendships').delete().eq('id', id);
      } catch (e) {
        console.warn('Friendship delete error:', e);
      }
    }
    setFriends(prev => {
      const next = prev.filter(f => f.id !== id);
      try {
        localStorage.setItem('studymate_friends', JSON.stringify(next));
      } catch {}
      return next;
    });
    showToast('বন্ধু তালিকা থেকে সরানো হয়েছে', 'info');
    return true;
  }, [isDemoMode, user, showToast]);

  const sendKudosToFriend = useCallback((_friendId: string) => {
    showToast(t.friends.kudosSent, 'success');
  }, [showToast, t]);

  // Complete Account & Data Deletion (Auth + Database + Storage)
  const deleteUserAccountAndData = useCallback(async (): Promise<boolean> => {
    const client = getSupabaseClient();
    try {
      if (user && client) {
        let authDeleted = false;

        // 1. First attempt: call secure server-side endpoint with Bearer auth
        try {
          const session = authSession || (await client.auth.getSession()).data.session;
          if (session?.access_token) {
            const config = getSupabaseConfig();
            const res = await fetch('/api/delete-account', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                supabaseUrl: config.url,
                anonKey: config.anonKey,
              }),
            });

            if (res.ok) {
              const data = await res.json();
              if (data.success && !data.useRpc) {
                authDeleted = true;
              }
            }
          }
        } catch (serverErr) {
          console.warn('Server endpoint account deletion warning:', serverErr);
        }

        // 2. Second attempt / Fallback: call SECURITY DEFINER RPC delete_user_account()
        if (!authDeleted) {
          try {
            const { error: rpcErr } = await client.rpc('delete_user_account');
            if (!rpcErr) {
              authDeleted = true;
            } else {
              console.warn('RPC delete_user_account response:', rpcErr);
            }
          } catch (rpcEx) {
            console.warn('RPC delete_user_account error:', rpcEx);
          }
        }

        // 3. Defensive cascade delete across all user data tables to ensure zero orphaned records
        try {
          await Promise.allSettled([
            client.from('study_sessions').delete().eq('user_id', user.id),
            client.from('tasks').delete().eq('user_id', user.id),
            client.from('exams').delete().eq('user_id', user.id),
            client.from('study_routines').delete().eq('user_id', user.id),
            client.from('friendships').delete().eq('user_id', user.id),
            user.email ? client.from('friendships').delete().eq('friend_email', user.email) : Promise.resolve(),
            client.from('subjects').delete().eq('user_id', user.id),
            client.from('profiles').delete().eq('id', user.id),
          ]);
        } catch (cascadeErr) {
          console.warn('Cascade database deletion warning:', cascadeErr);
        }

        // 4. Invalidate and sign out auth session completely
        try {
          await client.auth.signOut();
        } catch (soErr) {
          console.warn('Signout during deletion error:', soErr);
        }
      }
    } catch (err) {
      console.error('Error deleting user account:', err);
      const msg = err instanceof Error ? err.message : 'অ্যাকাউন্ট স্থায়ীভাবে মুছতে ব্যর্থ হয়েছে';
      showToast(msg, 'error');
      return false;
    }

    // 5. Clean all user cached storage and tokens
    try {
      localStorage.removeItem('studymate_auth_token');
      localStorage.removeItem('studymate_cached_profile');
      localStorage.removeItem('studymate_demo_data_v1');
      localStorage.removeItem('studymate_friends');
      localStorage.removeItem('studymate_active_tab');
      localStorage.removeItem('studymate_tab_history');
      localStorage.removeItem('studymate_timer_state_v1');
      localStorage.removeItem('studymate_supabase_url');
      localStorage.removeItem('studymate_supabase_key');
    } catch {}

    // 6. Reset all state to clean empty slate
    setUser(null);
    setAuthSession(null);
    setProfile(null);
    setSubjects([]);
    setTasks([]);
    setRoutines([]);
    setExams([]);
    setSessions([]);
    setFriends([]);
    setIsDemoMode(true);
    setActiveTabState('dashboard');
    showToast(t.settings.deleteAccountSuccess, 'success');
    return true;
  }, [user, authSession, showToast, t]);

  // 13. Backup & Reset Operations
  const exportDataAsJson = useCallback(() => {
    const backup: BackupData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      app: 'StudyMate BD',
      profile: profile || undefined,
      subjects,
      tasks,
      routines,
      exams,
      sessions,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studymate_bd_backup_${getTodayDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('ব্যাকআপ ফাইল ডাউনলোড সফল হয়েছে', 'success');
  }, [profile, subjects, tasks, routines, exams, sessions, showToast]);

  const importDataFromJson = useCallback((jsonString: string): { success: boolean; error?: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      const validation = validateBackupJson(parsed);
      if (!validation.valid) {
        showToast(validation.error || 'ভুল ফাইল ফরম্যাট', 'error');
        return { success: false, error: validation.error };
      }

      if (parsed.profile) {
        setProfile(parsed.profile);
      }
      setSubjects(parsed.subjects || []);
      setTasks(parsed.tasks || []);
      setRoutines(parsed.routines || []);
      setExams(parsed.exams || []);
      setSessions(parsed.sessions || []);

      if (isDemoMode || !user) {
        saveDemoDataToStorage({
          subjects: parsed.subjects || [],
          tasks: parsed.tasks || [],
          routines: parsed.routines || [],
          exams: parsed.exams || [],
          sessions: parsed.sessions || [],
        });
      }

      showToast('ব্যাকআপ সফলভাবে রিস্টোর হয়েছে!', 'success');
      return { success: true };
    } catch {
      showToast('JSON ফাইলটি পড়া সম্ভব হয়নি। সঠিক ফাইল নির্বাচন করুন।', 'error');
      return { success: false, error: 'JSON Parse Error' };
    }
  }, [isDemoMode, user, showToast]);

  const resetDemoData = useCallback(() => {
    const fresh = resetDemoDataStorage();
    setSubjects(fresh.subjects);
    setTasks(fresh.tasks);
    setRoutines(fresh.routines);
    setExams(fresh.exams);
    setSessions(fresh.sessions);
    showToast('ডেমো ডেটা সফলভাবে রিসেট হয়েছে', 'info');
  }, [showToast]);

  // 14. Supabase Auth Operations
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'Supabase credentials are not configured yet.' };
    }
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      setUser(data.user);
      setAuthSession(data.session);
      setIsDemoMode(false);
      showToast(t.auth.loginSuccess, 'success');
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }, [showToast, t]);

  const signUpWithEmail = useCallback(async (email: string, password: string, fullName?: string) => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'Supabase credentials are not configured yet.' };
    }
    try {
      const { data, error } = await client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName?.trim() || email.split('@')[0],
          }
        }
      });
      if (error) {
        return { success: false, error: error.message };
      }
      if (data.session) {
        setUser(data.user);
        setAuthSession(data.session);
        setIsDemoMode(false);
      }
      showToast(t.auth.signupSuccess, 'success');
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }, [showToast, t]);

  const signOut = useCallback(async () => {
    const client = getSupabaseClient();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (e) {
        console.warn('Sign out error', e);
      }
    }
    // Clear user state completely to never expose previous user data
    setUser(null);
    setAuthSession(null);
    setProfile(null);
    setIsDemoMode(true);
    // Reload local demo data
    const demo = loadDemoDataFromStorage();
    setSubjects(demo.subjects);
    setTasks(demo.tasks);
    setRoutines(demo.routines);
    setExams(demo.exams);
    setSessions(demo.sessions);
    showToast(t.auth.logoutSuccess, 'info');
  }, [showToast, t]);

  const resetPasswordForEmail = useCallback(async (email: string) => {
    const client = getSupabaseClient();
    if (!client) {
      return { success: false, error: 'Supabase credentials not configured' };
    }
    try {
      const { error } = await client.auth.resetPasswordForEmail(email.trim());
      if (error) return { success: false, error: error.message };
      showToast(t.auth.passwordResetSent, 'info');
      return { success: true };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }, [showToast, t]);

  // --- Audio Synthesis (Warning Alert and Completion Chime) ---
  const playWarningBeepSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1046, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.16);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.16);
    } catch (err) {
      console.warn('Audio warning tone error:', err);
    }
  }, []);

  const playCompletionChimeSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };
      playTone(523.25, 0, 0.4);      // C5
      playTone(659.25, 0.15, 0.4);   // E5
      playTone(783.99, 0.3, 0.45);   // G5
      playTone(1046.50, 0.45, 0.7);  // C6
    } catch (err) {
      console.warn('Audio chime error:', err);
    }
  }, []);

  // --- GLOBAL PERSISTENT TIMER STATE ---
  const [timerMode, setTimerMode] = useState<TimerMode>('pomodoro');
  const [timerFocusDuration, setTimerFocusDuration] = useState<number>(() => {
    return Number(localStorage.getItem('studymate_pomo_focus')) || 25;
  });
  const [timerShortBreakDuration, setTimerShortBreakDuration] = useState<number>(() => {
    return Number(localStorage.getItem('studymate_pomo_short')) || 5;
  });
  const [timerLongBreakDuration, setTimerLongBreakDuration] = useState<number>(() => {
    return Number(localStorage.getItem('studymate_pomo_long')) || 15;
  });
  const [timerSelectedSubjectId, setTimerSelectedSubjectId] = useState<string>('');
  const [timerSoundEnabled, setTimerSoundEnabled] = useState<boolean>(true);
  const [timerIsRunning, setTimerIsRunning] = useState<boolean>(false);

  const getTargetSeconds = useCallback((mode: TimerMode, focus: number, shortB: number, longB: number) => {
    if (mode === 'pomodoro') return focus * 60;
    if (mode === 'short_break') return shortB * 60;
    return longB * 60;
  }, []);

  const [timerRemainingSeconds, setTimerRemainingSeconds] = useState<number>(() => {
    const focus = Number(localStorage.getItem('studymate_pomo_focus')) || 25;
    return focus * 60;
  });

  const timerEndTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const lastAlarmSecondRef = useRef<number | null>(null);

  const timerTargetSeconds = useMemo(() => {
    return getTargetSeconds(timerMode, timerFocusDuration, timerShortBreakDuration, timerLongBreakDuration);
  }, [timerMode, timerFocusDuration, timerShortBreakDuration, timerLongBreakDuration, getTargetSeconds]);

  const isTimer15sWarning = useMemo(() => {
    return timerIsRunning && timerRemainingSeconds <= 15 && timerRemainingSeconds > 0;
  }, [timerIsRunning, timerRemainingSeconds]);

  const handleTimerComplete = useCallback(async () => {
    setTimerIsRunning(false);
    timerEndTimeRef.current = null;
    lastAlarmSecondRef.current = null;

    if (timerSoundEnabled) {
      playCompletionChimeSound();
    }
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([150, 80, 200]); } catch { /* ignore */ }
    }

    if (timerMode === 'pomodoro') {
      await recordStudySession({
        subject_id: timerSelectedSubjectId || undefined,
        duration_minutes: timerFocusDuration,
        session_type: 'pomodoro',
        notes: `Pomodoro Focus Session (${timerFocusDuration}m)`,
      });
      showToast(language === 'bn' ? 'অভিনন্দন! আপনার ফোকাস সেশন সফলভাবে সম্পন্ন হয়েছে 🎉' : 'Congratulations! Focus session completed 🎉', 'success');
      setTimerMode('short_break');
      const nextSec = timerShortBreakDuration * 60;
      setTimerRemainingSeconds(nextSec);
    } else {
      showToast(language === 'bn' ? 'বিরতি শেষ! পড়াশোনায় মনোনিবেশ করুন 📚' : 'Break ended! Ready to focus again 📚', 'info');
      setTimerMode('pomodoro');
      const nextSec = timerFocusDuration * 60;
      setTimerRemainingSeconds(nextSec);
    }
  }, [timerSoundEnabled, playCompletionChimeSound, timerMode, recordStudySession, timerSelectedSubjectId, timerFocusDuration, language, timerShortBreakDuration, showToast]);

  // Persistent Drift-safe Timer tick with 15-second alarm
  useEffect(() => {
    if (timerIsRunning) {
      if (!timerEndTimeRef.current) {
        timerEndTimeRef.current = Date.now() + timerRemainingSeconds * 1000;
      }

      timerIntervalRef.current = window.setInterval(() => {
        if (!timerEndTimeRef.current) return;
        const now = Date.now();
        const diff = Math.max(0, Math.round((timerEndTimeRef.current - now) / 1000));
        setTimerRemainingSeconds(diff);

        // Final 15-second alarm beep trigger
        if (diff <= 15 && diff > 0) {
          if (lastAlarmSecondRef.current !== diff) {
            lastAlarmSecondRef.current = diff;
            if (timerSoundEnabled) {
              playWarningBeepSound();
            }
            if (typeof navigator !== 'undefined' && navigator.vibrate) {
              try { navigator.vibrate(50); } catch { /* ignore */ }
            }
          }
        }

        if (diff <= 0) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
          handleTimerComplete();
        }
      }, 500);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      timerEndTimeRef.current = null;
      lastAlarmSecondRef.current = null;
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerIsRunning, timerRemainingSeconds, timerSoundEnabled, playWarningBeepSound, handleTimerComplete]);

  const startTimer = useCallback(() => {
    timerEndTimeRef.current = Date.now() + timerRemainingSeconds * 1000;
    setTimerIsRunning(true);
  }, [timerRemainingSeconds]);

  const pauseTimer = useCallback(() => {
    setTimerIsRunning(false);
    timerEndTimeRef.current = null;
    lastAlarmSecondRef.current = null;
  }, []);

  const resetTimer = useCallback(() => {
    setTimerIsRunning(false);
    timerEndTimeRef.current = null;
    lastAlarmSecondRef.current = null;
    const target = getTargetSeconds(timerMode, timerFocusDuration, timerShortBreakDuration, timerLongBreakDuration);
    setTimerRemainingSeconds(target);
  }, [timerMode, timerFocusDuration, timerShortBreakDuration, timerLongBreakDuration, getTargetSeconds]);

  const skipTimer = useCallback(() => {
    setTimerIsRunning(false);
    timerEndTimeRef.current = null;
    lastAlarmSecondRef.current = null;
    if (timerMode === 'pomodoro') {
      setTimerMode('short_break');
      setTimerRemainingSeconds(timerShortBreakDuration * 60);
    } else {
      setTimerMode('pomodoro');
      setTimerRemainingSeconds(timerFocusDuration * 60);
    }
  }, [timerMode, timerShortBreakDuration, timerFocusDuration]);

  const switchTimerMode = useCallback((newMode: TimerMode) => {
    setTimerIsRunning(false);
    timerEndTimeRef.current = null;
    lastAlarmSecondRef.current = null;
    setTimerMode(newMode);
    const target = getTargetSeconds(newMode, timerFocusDuration, timerShortBreakDuration, timerLongBreakDuration);
    setTimerRemainingSeconds(target);
  }, [timerFocusDuration, timerShortBreakDuration, timerLongBreakDuration, getTargetSeconds]);

  const setTimerDurations = useCallback((focus: number, shortB: number, longB: number) => {
    setTimerFocusDuration(focus);
    setTimerShortBreakDuration(shortB);
    setTimerLongBreakDuration(longB);
    localStorage.setItem('studymate_pomo_focus', String(focus));
    localStorage.setItem('studymate_pomo_short', String(shortB));
    localStorage.setItem('studymate_pomo_long', String(longB));
    if (!timerIsRunning) {
      const target = getTargetSeconds(timerMode, focus, shortB, longB);
      setTimerRemainingSeconds(target);
    }
  }, [timerIsRunning, timerMode, getTargetSeconds]);

  // --- NAVIGATION HISTORY & BACK BUTTON HANDLING ---
  const setActiveTab = useCallback((tab: NavTab) => {
    setActiveTabState(prev => {
      if (prev !== tab) {
        setTabHistory(h => [...h, tab]);
        try {
          window.history.pushState({ tab }, '');
        } catch { /* ignore */ }
      }
      return tab;
    });
  }, []);

  // Task-linked Dedicated Timer Actions
  const startTaskTimer = useCallback((task: Task) => {
    const durationMins = task.estimated_minutes && task.estimated_minutes > 0 ? task.estimated_minutes : 25;
    const durationSecs = durationMins * 60;

    setActiveTimerTaskId(task.id);
    setActiveTimerTaskTitle(task.title);

    if (task.subject_id) {
      setTimerSelectedSubjectId(task.subject_id);
    }

    setTimerMode('pomodoro');
    setTimerFocusDuration(durationMins);
    setTimerRemainingSeconds(durationSecs);
    setTimerIsRunning(true);
    timerEndTimeRef.current = Date.now() + durationSecs * 1000;
    lastAlarmSecondRef.current = null;

    setActiveTab('timer');

    const msg = language === 'bn'
      ? `"${task.title}" (${durationMins} মি.) কাউন্টডাউন শুরু হয়েছে!`
      : `Started countdown for "${task.title}" (${durationMins}m)!`;
    showToast(msg, 'success');
  }, [language, setActiveTab, showToast]);

  const clearActiveTaskTimer = useCallback(() => {
    setActiveTimerTaskId(null);
    setActiveTimerTaskTitle(null);
  }, []);

  const registerModal = useCallback((id: string) => {
    setOpenModals(prev => [...prev, id]);
    try {
      window.history.pushState({ modalId: id }, '');
    } catch { /* ignore */ }
    return () => {
      setOpenModals(prev => prev.filter(m => m !== id));
    };
  }, []);

  const isAnyModalOpen = openModals.length > 0;
  const canGoBack = tabHistory.length > 1 || openModals.length > 0;

  const goBack = useCallback(() => {
    if (openModals.length > 0) {
      setOpenModals(prev => prev.slice(0, -1));
      return;
    }
    setTabHistory(prev => {
      if (prev.length <= 1) {
        setActiveTabState('dashboard');
        return ['dashboard'];
      }
      const newHistory = [...prev];
      newHistory.pop(); // remove current
      const prevTab = newHistory[newHistory.length - 1] || 'dashboard';
      setActiveTabState(prevTab);
      return newHistory;
    });
  }, [openModals.length]);

  // Intercept browser and mobile back gesture
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (openModals.length > 0) {
        e.preventDefault?.();
        setOpenModals(prev => prev.slice(0, -1));
        return;
      }
      setTabHistory(prev => {
        if (prev.length <= 1) {
          setActiveTabState('dashboard');
          return ['dashboard'];
        }
        const newHistory = [...prev];
        newHistory.pop();
        const prevTab = newHistory[newHistory.length - 1] || 'dashboard';
        setActiveTabState(prevTab);
        return newHistory;
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [openModals.length]);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        theme,
        setTheme,
        activeTab,
        setActiveTab,
        t,
        canGoBack,
        goBack,
        registerModal,
        isAnyModalOpen,
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
        isDemoMode,
        setIsDemoMode,
        supabaseConfig,
        user,
        profile,
        authSession,
        isAuthLoading,
        refreshAuthConfig,
        subjects,
        tasks,
        routines,
        exams,
        sessions,
        isLoadingData,
        todayStudyMinutes,
        weeklyStudyMinutes,
        studyStreak,
        tasksDueTodayCount,
        pendingTasksCount,
        completedTasksCount,
        currentDhakaDate,
        tasksScheduledTodayCount,
        completedTasksTodayCount,
        dailyProgressPercent,
        addSubject,
        updateSubject,
        deleteSubject,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        addRoutine,
        updateRoutine,
        deleteRoutine,
        addExam,
        updateExam,
        deleteExam,
        recordStudySession,
        friends,
        addFriend,
        removeFriend,
        sendKudosToFriend,
        lookupStudentByEmail,
        activeTimerTaskId,
        activeTimerTaskTitle,
        startTaskTimer,
        clearActiveTaskTimer,
        updateProfile,
        deleteUserAccountAndData,
        exportDataAsJson,
        importDataFromJson,
        resetDemoData,
        signInWithEmail,
        signUpWithEmail,
        signOut,
        resetPasswordForEmail,
        toast,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
