export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Saturday, 1 = Sunday ... 6 = Friday (BD typical week) or standard 0=Sunday
export type TimerMode = 'pomodoro' | 'short_break' | 'long_break';
export type Language = 'bn' | 'en';
export type Theme = 'light' | 'dark';

export interface Subject {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  subject_id?: string;
  due_date: string; // YYYY-MM-DD
  due_time?: string; // HH:mm
  priority: Priority;
  status: TaskStatus;
  estimated_minutes?: number;
  created_at: string;
  updated_at?: string;
}

export interface StudyRoutine {
  id: string;
  user_id: string;
  day_of_week: DayOfWeek;
  start_time: string; // HH:mm
  end_time: string;   // HH:mm
  subject_id: string;
  notes?: string;
  created_at: string;
}

export interface Exam {
  id: string;
  user_id: string;
  title: string;
  subject_id: string;
  exam_date: string; // YYYY-MM-DD
  exam_time?: string; // HH:mm
  room_or_location?: string;
  total_marks?: number;
  notes?: string;
  created_at: string;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject_id?: string;
  duration_minutes: number;
  session_type: 'pomodoro' | 'short_break' | 'long_break' | 'manual';
  completed_at: string; // ISO string
  notes?: string;
}

export type Gender = 'male' | 'female';

export interface Profile {
  id: string;
  email: string;
  student_code?: string;  // Unique Student ID e.g. SM-A1B2C3
  full_name?: string;
  student_class?: string; // Class / Grade (e.g. HSC 1st Year, Class 10, Honors 2nd Year)
  institution?: string;   // School / College / University / Coaching
  gender?: Gender;
  target_study_hours_per_day?: number;
  preferred_language?: Language;
  created_at: string;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id?: string;
  friend_code?: string;
  friend_email?: string;
  friend_name: string;
  gender?: Gender;
  student_class?: string;
  institution?: string;
  today_minutes: number;
  weekly_minutes: number;
  study_streak: number;
  completed_tasks: number;
  status: 'accepted' | 'pending';
  last_studied_subject?: string;
  last_active?: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_code?: string;
  receiver_code?: string;
  sender_name: string;
  sender_email?: string;
  sender_class?: string;
  sender_institution?: string;
  sender_gender?: Gender;
  receiver_name?: string;
  receiver_email?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  direction: 'incoming' | 'outgoing';
}

export type CheerType = 'applause' | 'fire' | 'target' | 'star' | 'heart';

export interface FriendCheer {
  id: string;
  sender_id: string;
  receiver_id: string;
  sender_name: string;
  sender_gender?: Gender;
  cheer_type: CheerType;
  message?: string;
  is_read: boolean;
  created_at: string;
}

export interface FriendLiveStats {
  user_id: string;
  friendship_id: string;
  full_name: string;
  email: string;
  gender?: Gender;
  student_class?: string;
  institution?: string;
  today_study_minutes: number;
  weekly_study_minutes: number;
  study_streak: number;
  completed_tasks_count: number;
  top_subject_name?: string;
  top_subject_color?: string;
  last_active?: string;
}

export interface BackupData {
  version: string;
  exported_at: string;
  app: string;
  profile?: Profile;
  subjects: Subject[];
  tasks: Task[];
  routines: StudyRoutine[];
  exams: Exam[];
  sessions: StudySession[];
  friends?: Friend[];
}

export type NavTab = 
  | 'dashboard'
  | 'subjects'
  | 'tasks'
  | 'routine'
  | 'exams'
  | 'timer'
  | 'analytics'
  | 'friends'
  | 'settings';
