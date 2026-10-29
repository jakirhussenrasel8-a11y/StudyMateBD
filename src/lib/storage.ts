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
 * Creates realistic, relatable sample data for Bangladeshi students.
 */
export function generateInitialDemoData() {
  const demoUserId = 'demo-user-student-bd';
  const today = getTodayDateString();

  const subjects: Subject[] = [
    {
      id: 'sub-1',
      user_id: demoUserId,
      name: 'উচ্চতর গণিত (Higher Math)',
      color: '#10b981', // emerald
      icon: 'Calculator',
      description: 'ক্যালকুলাস ও ত্রিকোণমিতি অনুশীলন',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
    {
      id: 'sub-2',
      user_id: demoUserId,
      name: 'পদার্থবিজ্ঞান (Physics)',
      color: '#3b82f6', // blue
      icon: 'Atom',
      description: 'বলবিদ্যা, তড়িৎ ও আধুনিক পদার্থবিজ্ঞান',
      created_at: new Date(Date.now() - 28 * 86400000).toISOString(),
    },
    {
      id: 'sub-3',
      user_id: demoUserId,
      name: 'রসায়ন (Chemistry)',
      color: '#f59e0b', // amber
      icon: 'FlaskConical',
      description: 'জৈব রসায়ন ও পর্যায় সারণি',
      created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    },
    {
      id: 'sub-4',
      user_id: demoUserId,
      name: 'ইংরেজি (English 1st & 2nd)',
      color: '#8b5cf6', // purple
      icon: 'BookOpen',
      description: 'Grammar, Reading comprehension & Composition',
      created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    },
    {
      id: 'sub-5',
      user_id: demoUserId,
      name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)',
      color: '#06b6d4', // cyan
      icon: 'Laptop',
      description: 'সি প্রোগ্রামিং, এইচটিএমএল ও ডাটাবেজ',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
  ];

  const tasks: Task[] = [];

  // Routine for weekdays (0 = Saturday, 1 = Sunday ... 6 = Friday)
  const routines: StudyRoutine[] = [];
  const exams: Exam[] = [];
  const sessions: StudySession[] = [];

  const profile: Profile = {
    id: demoUserId,
    email: 'student@example.com',
    full_name: 'Rasu IT',
    student_class: "Hon's 3rd Year",
    institution: 'Maulvibazar Govt. College',
    gender: 'male',
    target_study_hours_per_day: 5,
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
    if (!parsed.subjects || !parsed.tasks) {
      const initial = generateInitialDemoData();
      saveDemoDataToStorage(initial);
      return initial;
    }
    if (!parsed.profile) {
      parsed.profile = {
        id: 'demo-user-student-bd',
        email: 'student@example.com',
        full_name: 'Rasu IT',
        student_class: "Hon's 3rd Year",
        institution: 'Maulvibazar Govt. College',
        target_study_hours_per_day: 5,
        preferred_language: 'bn',
        created_at: new Date().toISOString(),
      };
    } else if (parsed.profile.id === 'demo-user-student-bd' && (parsed.profile.full_name === 'তানভীর আহমেদ' || !parsed.profile.full_name)) {
      parsed.profile.full_name = 'Rasu IT';
      parsed.profile.student_class = "Hon's 3rd Year";
      parsed.profile.institution = 'Maulvibazar Govt. College';
      saveDemoDataToStorage(parsed);
    }
    return parsed;
  } catch (e) {
    console.error('Failed to load demo data from localStorage', e);
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
