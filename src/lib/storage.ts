import { Subject, Task, StudyRoutine, Exam, StudySession, BackupData, Profile } from '../types';
import { getDhakaDateString } from './dateUtils';

const DEMO_STORAGE_KEY = 'studymate_demo_data_v1';

export function getTodayDateString(): string {
  return getDhakaDateString();
}

export function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return getDhakaDateString(d);
}

/**
 * Creates clean, empty fresh data for new students with a unique student ID.
 */
export function generateInitialDemoData() {
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const demoUserId = 'student-' + randomSuffix.toLowerCase();
  const studentCode = 'SM-' + randomSuffix;

  const subjects: Subject[] = [];
  const tasks: Task[] = [];
  const routines: StudyRoutine[] = [];
  const exams: Exam[] = [];
  const sessions: StudySession[] = [];

  const profile: Profile = {
    id: demoUserId,
    email: '',
    student_code: studentCode,
    full_name: 'নতুন শিক্ষার্থী',
    student_class: '',
    institution: '',
    gender: 'male',
    target_study_hours_per_day: 4,
    preferred_language: 'bn',
    created_at: new Date().toISOString(),
  };

  return {
    profile,
    subjects,
    tasks,
    routines,
    exams,
    sessions,
  };
}

export function loadDemoDataFromStorage() {
  try {
    const raw = localStorage.getItem(DEMO_STORAGE_KEY);
    if (!raw) {
      const initial = generateInitialDemoData();
      saveDemoDataToStorage(initial);
      return initial;
    }
    const parsed = JSON.parse(raw);
    
    // Purge legacy demo data (like fake subjects or sample names) so new users always have a fresh slate
    if (parsed.profile?.full_name === 'Rasu IT' || parsed.profile?.full_name === 'তানভীর আহমেদ') {
      const fresh = generateInitialDemoData();
      saveDemoDataToStorage(fresh);
      return fresh;
    }

    if (!parsed.subjects || !parsed.tasks) {
      const initial = generateInitialDemoData();
      saveDemoDataToStorage(initial);
      return initial;
    }

    if (!parsed.profile) {
      const initial = generateInitialDemoData();
      parsed.profile = initial.profile;
      saveDemoDataToStorage(parsed);
    } else if (!parsed.profile.student_code) {
      const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
      parsed.profile.student_code = 'SM-' + randomSuffix;
      saveDemoDataToStorage(parsed);
    }

    return parsed;
  } catch (e) {
    console.error('Failed to load data from localStorage', e);
    return generateInitialDemoData();
  }
}

export function saveDemoDataToStorage(data: {
  profile?: Profile;
  subjects: Subject[];
  tasks: Task[];
  routines: StudyRoutine[];
  exams: Exam[];
  sessions: StudySession[];
}) {
  try {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save demo data to localStorage', e);
  }
}

export function resetDemoDataStorage() {
  try {
    const fresh = generateInitialDemoData();
    saveDemoDataToStorage(fresh);
    return fresh;
  } catch (e) {
    console.error('Failed to reset demo data', e);
    return generateInitialDemoData();
  }
}

/**
 * Validates whether an imported object conforms to StudyMate BD backup data.
 */
export function validateBackupJson(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'ফাইলটি সঠিক JSON ফরম্যাটে নেই (Invalid JSON).' };
  }
  if (!Array.isArray(data.subjects) || !Array.isArray(data.tasks)) {
    return { valid: false, error: 'ব্যাকআপ ফাইলে বিষয় বা টাস্কের তালিকা অনুপস্থিত (Missing subjects/tasks).' };
  }
  // Check minimal fields
  if (data.subjects.length > 0 && (!data.subjects[0].id || !data.subjects[0].name)) {
    return { valid: false, error: 'বিষয়ের তথ্য কাঠামো সঠিক নয় (Corrupt subjects format).' };
  }
  if (data.tasks.length > 0 && (!data.tasks[0].id || !data.tasks[0].title)) {
    return { valid: false, error: 'টাস্কের তথ্য কাঠামো সঠিক নয় (Corrupt tasks format).' };
  }
  return { valid: true };
}
