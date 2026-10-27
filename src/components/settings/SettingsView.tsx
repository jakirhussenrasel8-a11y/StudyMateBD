import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Settings, 
  Globe, 
  Sun, 
  Moon, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Shield, 
  LogOut, 
  Copy, 
  Check, 
  ExternalLink, 
  AlertTriangle, 
  Code2, 
  HelpCircle,
  ChevronDown,
  ChevronUp 
} from 'lucide-react';
import { 
  saveUserSupabaseConfig, 
  clearUserSupabaseConfig, 
  testSupabaseConnection 
} from '../../lib/supabase';

export const SettingsView: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    theme, 
    setTheme, 
    supabaseConfig, 
    refreshAuthConfig, 
    user, 
    signOut, 
    isDemoMode, 
    exportDataAsJson, 
    importDataFromJson, 
    resetDemoData, 
    showToast, 
    t 
  } = useApp();

  // Custom Supabase inputs for mobile users
  const [supabaseUrl, setSupabaseUrl] = useState(supabaseConfig.url || '');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(supabaseConfig.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Schema guide accordion
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Reset confirmation modal
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // File import ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveSupabaseConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setTestResult(null);

    if (!supabaseUrl.trim().startsWith('https://')) {
      showToast('Supabase URL অবশ্যই https:// দিয়ে শুরু হতে হবে', 'error');
      return;
    }
    if (supabaseAnonKey.trim().length < 20) {
      showToast('সঠিক Anon/Publishable Key দিন', 'error');
      return;
    }

    const saved = saveUserSupabaseConfig(supabaseUrl, supabaseAnonKey);
    if (saved) {
      refreshAuthConfig();
      setIsTesting(true);
      const test = await testSupabaseConnection();
      setIsTesting(false);
      setTestResult(test);
      if (test.success) {
        showToast('সুপাবেজ সংযোগ সফল হয়েছে!', 'success');
      } else {
        showToast(test.message, 'error');
      }
    }
  };

  const handleClearConfig = () => {
    clearUserSupabaseConfig();
    setSupabaseUrl('');
    setSupabaseAnonKey('');
    setTestResult(null);
    refreshAuthConfig();
    showToast('সুপাবেজ কনফিগারেশন মুছে ফেলা হয়েছে। এখন লোকাল ডেমো মোড সক্রিয়।', 'info');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        importDataFromJson(content);
      }
    };
    reader.readAsText(file);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const sqlSchemaText = `-- StudyMate BD SQL Schema (Run in Supabase SQL Editor)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  student_class TEXT,
  institution TEXT,
  target_study_hours_per_day NUMERIC DEFAULT 4.0,
  preferred_language TEXT DEFAULT 'bn',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#10b981',
  icon TEXT DEFAULT 'BookOpen',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  due_time TIME,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'pending',
  estimated_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.study_routines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  exam_date DATE NOT NULL,
  exam_time TIME,
  room_or_location TEXT,
  total_marks NUMERIC,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
  duration_minutes INTEGER NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'pomodoro',
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  notes TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;

-- Basic user ownership policies (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "user_profiles_policy" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "user_subjects_policy" ON public.subjects FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_tasks_policy" ON public.tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_routines_policy" ON public.study_routines FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_exams_policy" ON public.exams FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "user_sessions_policy" ON public.study_sessions FOR ALL USING (auth.uid() = user_id);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchemaText);
    setCopiedSql(true);
    showToast('SQL কোড ক্লিপবোর্ডে কপি হয়েছে!', 'success');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-24 md:pb-8 animate-in fade-in">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
          {t.settings.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {t.settings.subtitle}
        </p>
      </div>

      {/* 1. Language & Appearance */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-emerald-500" />
          <span>{t.settings.languageSection} & {t.settings.themeSection}</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Language Switch */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              {t.settings.languageSelect}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  language === 'bn'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                বাংলা (Bengali)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                English
              </button>
            </div>
          </div>

          {/* Theme Switch */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
              থিম নির্বাচন (Theme)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  theme === 'light'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{t.settings.themeLight}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{t.settings.themeDark}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Supabase Free Database Configuration */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              <span>{t.settings.cloudSection}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.settings.cloudDesc}
            </p>
          </div>

          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
            supabaseConfig.isConfigured
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
          }`}>
            {supabaseConfig.isConfigured ? 'সুপাবেজ সক্রিয়' : 'ডেমো মোড'}
          </span>
        </div>

        {/* Input Form for Mobile Users */}
        <form onSubmit={handleSaveSupabaseConfig} className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.settings.supabaseUrl}
            </label>
            <input
              type="url"
              required
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              placeholder="https://xyzabcdefg.supabase.co"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.settings.supabaseAnonKey} (Safe for public browser use)
            </label>
            <input
              type="text"
              required
              value={supabaseAnonKey}
              onChange={(e) => setSupabaseAnonKey(e.target.value)}
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono text-[11px]"
            />
          </div>

          {/* Test connection alert */}
          {testResult && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border border-rose-200'
            }`}>
              <Shield className="w-4 h-4 shrink-0" />
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-2">
            {supabaseConfig.source === 'user' && (
              <button
                type="button"
                onClick={handleClearConfig}
                className="text-xs text-rose-600 hover:underline cursor-pointer"
              >
                ক্রেডেনশিয়াল মুছুন
              </button>
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="submit"
                disabled={isTesting}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isTesting ? 'সংযোগ পরীক্ষা হচ্ছে...' : t.settings.saveCredentials}
              </button>
            </div>
          </div>
        </form>

        {/* Collapsible Supabase Setup Guide for Beginners */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setShowSqlGuide(!showSqlGuide)}
            className="w-full flex items-center justify-between py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-500" />
              <span>{t.settings.showSqlGuide}</span>
            </div>
            {showSqlGuide ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSqlGuide && (
            <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-xs space-y-3">
              <div className="space-y-1.5 text-slate-700 dark:text-slate-300 leading-relaxed">
                <p className="font-bold text-slate-900 dark:text-white">📱 মোবাইল থেকে ৫ মিনিটে Supabase ফ্রি ডেটাবেস সেটআপের ধাপ:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Supabase.com এ যান এবং ফ্রিতে সাইন আপ করুন।</li>
                  <li>"New Project" এ ক্লিক করে প্রজেক্টের নাম (যেমন: StudyMate BD) ও একটি ডাটাবেজ পাসওয়ার্ড দিন।</li>
                  <li>প্রজেক্ট তৈরি হলে বাম পাশের মেনু থেকে <strong>SQL Editor</strong> এ চাপ দিন।</li>
                  <li>নিচের বাটনে চাপ দিয়ে সম্পূর্ণ SQL কোডটি কপি করুন এবং Supabase SQL Editor এ পেস্ট করে <strong>Run</strong> করুন।</li>
                  <li>তারপর Supabase এর <strong>Project Settings &rarr; API</strong> এ গিয়ে Project URL এবং anon public key কপি করে উপরের বক্সে পেস্ট করুন।</li>
                </ol>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-500">PostgreSQL Schema + RLS Security</span>
                <button
                  type="button"
                  onClick={copySqlToClipboard}
                  className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? t.common.copied : t.common.copySql}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 3. Data Backup, Export & Import */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-500" />
          <span>{t.settings.backupSection}</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t.settings.backupDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Export JSON */}
          <button
            type="button"
            onClick={exportDataAsJson}
            className="flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>{t.settings.exportJson}</span>
          </button>

          {/* Import JSON */}
          <div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-blue-500" />
              <span>{t.settings.importJson}</span>
            </button>
          </div>
        </div>

        {/* Reset Local Demo Data */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {t.settings.resetDemo}
            </p>
            <p className="text-[11px] text-slate-500">
              ডেমো ডেটা রিসেট করলে ক্লাউডের ডেটায় কোনো প্রভাব পড়বে না
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট</span>
          </button>
        </div>
      </div>

      {/* 4. Account & Security Policy */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>{t.settings.accountSection}</span>
        </h3>

        {user ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs text-slate-500">{t.settings.userEmail}</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                {user.email}
              </p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400 text-xs font-bold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.settings.logoutBtn}</span>
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-600 dark:text-slate-400">
            বর্তমানে আপনি লোকাল ডেমো মোডে আছেন। সাইন ইন করতে উপরের ব্যানারে ক্লিক করুন।
          </div>
        )}

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {t.settings.deleteAccountGuidance}
          </p>
          <p className="leading-relaxed">
            {t.settings.deleteNotice}
          </p>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.settings.resetDemo}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.settings.resetConfirm}
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 transition shadow-xs cursor-pointer"
              >
                রিসেট সম্পন্ন করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
