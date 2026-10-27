import { Subject, Task, StudyRoutine, Exam, StudySession, BackupData, Profile } from '../types';

const DEMO_STORAGE_KEY = 'studymate_demo_data_v1';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

  const tasks: Task[] = [
    {
      id: 'task-1',
      user_id: demoUserId,
      title: 'উচ্চতর গণিত: অন্তরীকরণ (Differentiation) ৯.১ ও ৯.২ ম্যাথ সমাধান',
      description: 'বোর্ড প্রশ্ন ২০২৪ ও টেস্ট পেপারের গুরুত্বপূর্ণ ম্যাথ প্র্যাকটিস',
      subject_id: 'sub-1',
      due_date: today,
      due_time: '18:00',
      priority: 'high',
      status: 'pending',
      estimated_minutes: 60,
      created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'task-2',
      user_id: demoUserId,
      title: 'পদার্থবিজ্ঞান: ভেক্টর গুণন ও নদী-নৌকার ম্যাথ রিভিশন',
      description: 'সৃজনশীল প্রশ্নের সূত্রগুলো নোট খাতায় আলাদা করা',
      subject_id: 'sub-2',
      due_date: today,
      due_time: '21:30',
      priority: 'medium',
      status: 'in_progress',
      estimated_minutes: 45,
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'task-3',
      user_id: demoUserId,
      title: 'রসায়ন: জৈব যৌগের নামকরণ ও সমাণুতা নোট তৈরি',
      description: 'অ্যালকেন, অ্যালকিন ও অ্যালকাইন এর রূপান্তর চার্ট আঁকা',
      subject_id: 'sub-3',
      due_date: getDateOffset(2),
      due_time: '19:00',
      priority: 'high',
      status: 'pending',
      estimated_minutes: 50,
      created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'task-4',
      user_id: demoUserId,
      title: 'English: Complete ' + 'Right Form of Verbs exercise (Board 2023)',
      description: 'Solve 5 board exercises and check with answer key',
      subject_id: 'sub-4',
      due_date: getDateOffset(-1), // overdue
      due_time: '16:00',
      priority: 'medium',
      status: 'pending',
      estimated_minutes: 30,
      created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'task-5',
      user_id: demoUserId,
      title: 'ICT: C Programming লুপ ও কন্ডিশনাল স্টেটমেন্ট প্র্যাকটিস',
      description: 'for loop & while loop এর কোড ড্রাই-রান করা',
      subject_id: 'sub-5',
      due_date: getDateOffset(4),
      due_time: '20:00',
      priority: 'low',
      status: 'pending',
      estimated_minutes: 40,
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'task-6',
      user_id: demoUserId,
      title: 'উচ্চতর গণিত: ত্রিকোণমিতি ৭.১ সূত্র রিভিশন',
      description: 'সাইন এবং কস যোগফল-গুণফল রূপান্তর সূত্র মুখস্থ করা',
      subject_id: 'sub-1',
      due_date: today,
      due_time: '11:00',
      priority: 'high',
      status: 'completed',
      estimated_minutes: 30,
      created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  // Routine for weekdays (0 = Saturday, 1 = Sunday ... 6 = Friday)
  const routines: StudyRoutine[] = [
    {
      id: 'rout-1',
      user_id: demoUserId,
      day_of_week: 0, // Saturday
      start_time: '07:00',
      end_time: '08:30',
      subject_id: 'sub-1',
      notes: 'সকালের ফ্রেশ মাইন্ডে গণিত অনুশীলন',
      created_at: new Date().toISOString(),
    },
    {
      id: 'rout-2',
      user_id: demoUserId,
      day_of_week: 0, // Saturday
      start_time: '19:00',
      end_time: '21:00',
      subject_id: 'sub-2',
      notes: 'পদার্থবিজ্ঞান থিওরি ও সৃজনশীল সমাধান',
      created_at: new Date().toISOString(),
    },
    {
      id: 'rout-3',
      user_id: demoUserId,
      day_of_week: 1, // Sunday
      start_time: '07:00',
      end_time: '08:30',
      subject_id: 'sub-3',
      notes: 'রসায়ন রিঅ্যাকশন প্র্যাকটিস',
      created_at: new Date().toISOString(),
    },
    {
      id: 'rout-4',
      user_id: demoUserId,
      day_of_week: 1, // Sunday
      start_time: '20:00',
      end_time: '21:30',
      subject_id: 'sub-4',
      notes: 'English vocabulary & reading',
      created_at: new Date().toISOString(),
    },
    {
      id: 'rout-5',
      user_id: demoUserId,
      day_of_week: 2, // Monday
      start_time: '18:30',
      end_time: '20:30',
      subject_id: 'sub-1',
      notes: 'গণিত টেস্ট পেপার সলভ',
      created_at: new Date().toISOString(),
    },
    {
      id: 'rout-6',
      user_id: demoUserId,
      day_of_week: 3, // Tuesday
      start_time: '19:00',
      end_time: '21:00',
      subject_id: 'sub-5',
      notes: 'ICT প্রোগ্রামিং ও এইচটিএমএল ল্যাব প্র্যাকটিস',
      created_at: new Date().toISOString(),
    },
    {
      id: 'rout-7',
      user_id: demoUserId,
      day_of_week: 4, // Wednesday
      start_time: '07:00',
      end_time: '08:30',
      subject_id: 'sub-2',
      notes: 'পদার্থবিজ্ঞান সূত্র মুখস্থ ও রিভিশন',
      created_at: new Date().toISOString(),
    },
    {
      id: 'rout-8',
      user_id: demoUserId,
      day_of_week: 5, // Thursday
      start_time: '18:00',
      end_time: '20:00',
      subject_id: 'sub-3',
      notes: 'রসায়ন বিগত বছরের মডেল টেস্ট',
      created_at: new Date().toISOString(),
    },
    {
      id: 'rout-9',
      user_id: demoUserId,
      day_of_week: 6, // Friday
      start_time: '09:00',
      end_time: '11:00',
      subject_id: 'sub-4',
      notes: 'সাপ্তাহিক রিভিশন ও মডেল টেস্ট মূল্যায়ন',
      created_at: new Date().toISOString(),
    },
  ];

  const exams: Exam[] = [
    {
      id: 'exam-1',
      user_id: demoUserId,
      title: 'উচ্চতর গণিত প্রি-টেস্ট পরীক্ষা',
      subject_id: 'sub-1',
      exam_date: getDateOffset(5),
      exam_time: '10:00',
      room_or_location: 'রুম নং ২০৪, প্রধান ভবন',
      total_marks: 100,
      notes: 'ক্যালকুলাস ও জ্যামিতি অধ্যায় ভালোভাবে পড়ে যেতে হবে। ক্যালকুলেটর সাথে রাখতে হবে।',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    },
    {
      id: 'exam-2',
      user_id: demoUserId,
      title: 'পদার্থবিজ্ঞান ১ম পত্র সেমিস্টার ফাইনাল',
      subject_id: 'sub-2',
      exam_date: getDateOffset(12),
      exam_time: '10:00',
      room_or_location: 'বিজ্ঞান ভবন হল',
      total_marks: 75,
      notes: '১ম থেকে ৭ম অধ্যায় পর্যন্ত সম্পূর্ণ সিলেবাস।',
      created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    },
    {
      id: 'exam-3',
      user_id: demoUserId,
      title: 'ইংরেজি ১ম পত্র ক্লাস টেস্ট',
      subject_id: 'sub-4',
      exam_date: getDateOffset(-3), // past exam
      exam_time: '11:30',
      room_or_location: 'রুম ১০২',
      total_marks: 30,
      notes: 'Flowchart & Theme writing focus.',
      created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    },
  ];

  // Past 7 days realistic study sessions
  const sessions: StudySession[] = [
    // Today
    {
      id: 'sess-today-1',
      user_id: demoUserId,
      subject_id: 'sub-1',
      duration_minutes: 25,
      session_type: 'pomodoro',
      completed_at: new Date(Date.now() - 2 * 3600000).toISOString(),
      notes: 'অন্তরীকরণ রিভিশন',
    },
    {
      id: 'sess-today-2',
      user_id: demoUserId,
      subject_id: 'sub-1',
      duration_minutes: 25,
      session_type: 'pomodoro',
      completed_at: new Date(Date.now() - 1 * 3600000).toISOString(),
      notes: 'ত্রিকোণমিতি ম্যাথ',
    },
    // Yesterday
    {
      id: 'sess-yest-1',
      user_id: demoUserId,
      subject_id: 'sub-2',
      duration_minutes: 30,
      session_type: 'pomodoro',
      completed_at: new Date(Date.now() - 26 * 3600000).toISOString(),
      notes: 'পদার্থবিজ্ঞান ভেক্টর',
    },
    {
      id: 'sess-yest-2',
      user_id: demoUserId,
      subject_id: 'sub-3',
      duration_minutes: 25,
      session_type: 'pomodoro',
      completed_at: new Date(Date.now() - 24 * 3600000).toISOString(),
      notes: 'রসায়ন সংকরায়ন',
    },
    // 2 days ago
    {
      id: 'sess-2days-1',
      user_id: demoUserId,
      subject_id: 'sub-4',
      duration_minutes: 35,
      session_type: 'pomodoro',
      completed_at: new Date(Date.now() - 50 * 3600000).toISOString(),
      notes: 'English Reading passage',
    },
    // 3 days ago
    {
      id: 'sess-3days-1',
      user_id: demoUserId,
      subject_id: 'sub-5',
      duration_minutes: 40,
      session_type: 'pomodoro',
      completed_at: new Date(Date.now() - 74 * 3600000).toISOString(),
      notes: 'C Programming',
    },
    // 4 days ago
    {
      id: 'sess-4days-1',
      user_id: demoUserId,
      subject_id: 'sub-1',
      duration_minutes: 50,
      session_type: 'pomodoro',
      completed_at: new Date(Date.now() - 98 * 3600000).toISOString(),
      notes: 'উচ্চতর গণিত সমাকলন',
    },
  ];

  const profile: Profile = {
    id: demoUserId,
    email: 'student@example.com',
    full_name: 'তানভীর আহমেদ',
    student_class: 'একাদশ শ্রেণি (HSC 2026)',
    institution: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ',
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
        full_name: 'তানভীর আহমেদ',
        student_class: 'একাদশ শ্রেণি (HSC 2026)',
        institution: 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ',
        target_study_hours_per_day: 5,
        preferred_language: 'bn',
        created_at: new Date().toISOString(),
      };
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
