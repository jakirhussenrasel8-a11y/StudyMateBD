import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Subject, 
  Task, 
  StudyRoutine, 
  Exam, 
  StudySession, 
  Profile, 
  Language, 
  Theme, 
  NavTab, 
  BackupData 
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

  // Profile Management
  updateProfile: (data: Partial<Profile>) => Promise<boolean>;

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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Preferences
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('studymate_lang') as Language) || 'bn';
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    return (localStorage.getItem('studymate_theme') as Theme) || 'light';
  });

  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // 2. Auth & Connection State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSupabaseConfig());
  const [user, setUser] = useState<User | null>(null);
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
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
  const [isLoadingData, setIsLoadingData] = useState(false);

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
          setProfile(profRes.data);
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
        email: 'student@example.com',
        full_name: 'তানভীর আহমেদ',
        student_class: 'একাদশ শ্রেণি (HSC 2026)',
        institution: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ',
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

  // 7. Computed Metrics
  const todayStr = getTodayDateString();

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

  const tasksDueTodayCount = useMemo(() => {
    return tasks.filter(t => t.due_date === todayStr && t.status !== 'completed').length;
  }, [tasks, todayStr]);

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
    if (!isDemoMode && user && client) {
      try {
        const { error } = await client
          .from('profiles')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);

        if (error) throw error;
        setProfile(prev => prev ? { ...prev, ...data } : null);
        showToast('প্রোফাইল তথ্য আপডেট হয়েছে!', 'success');
        return true;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        showToast(`প্রোফাইল আপডেট ব্যর্থ: ${msg}`, 'error');
        return false;
      }
    } else {
      // Demo mode
      setProfile(prev => {
        const updated: Profile = prev ? { ...prev, ...data } : {
          id: 'demo-user-student-bd',
          email: 'student@example.com',
          full_name: data.full_name || 'তানভীর আহমেদ',
          student_class: data.student_class || 'একাদশ শ্রেণি (HSC 2026)',
          institution: data.institution || 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ',
          target_study_hours_per_day: 5,
          preferred_language: 'bn',
          created_at: new Date().toISOString(),
          ...data,
        };
        syncDemoStorage(subjects, tasks, routines, exams, sessions, updated);
        return updated;
      });
      showToast('প্রোফাইল তথ্য আপডেট হয়েছে!', 'success');
      return true;
    }
  }, [isDemoMode, user, subjects, tasks, routines, exams, sessions, syncDemoStorage, showToast]);

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
        updateProfile,
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
