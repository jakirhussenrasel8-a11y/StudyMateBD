import React, { useState, useRef, useEffect } from 'react';
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
  Trash2, 
  AlertTriangle, 
  ArrowLeft,
  User,
  School,
  Building2,
  Check,
  Sparkles
} from 'lucide-react';
import { StudentAvatar } from '../common/StudentAvatar';

export const SettingsView: React.FC = () => {
  const { 
    language, 
    setLanguage, 
    theme, 
    setTheme, 
    user, 
    profile,
    updateProfile,
    deleteUserAccountAndData,
    signOut, 
    isDemoMode, 
    exportDataAsJson, 
    importDataFromJson, 
    resetDemoData, 
    showToast, 
    t,
    goBack,
    registerModal 
  } = useApp();

  // Profile fields state
  const [studentName, setStudentName] = useState(profile?.full_name || 'Rasu IT');
  const [studentClass, setStudentClass] = useState(profile?.student_class || "Hon's 3rd Year");
  const [institution, setInstitution] = useState(profile?.institution || 'Maulvibazar Govt. College');
  const [studentGender, setStudentGender] = useState<'male' | 'female'>(profile?.gender || 'male');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    if (profile) {
      if (profile.full_name) setStudentName(profile.full_name);
      if (profile.student_class) setStudentClass(profile.student_class);
      if (profile.institution) setInstitution(profile.institution);
      if (profile.gender) setStudentGender(profile.gender);
    }
  }, [profile]);

  // Confirmation Modals State
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (showResetConfirm) {
      return registerModal('reset-confirm-modal');
    }
  }, [showResetConfirm, registerModal]);

  useEffect(() => {
    if (showDeleteConfirm) {
      return registerModal('delete-account-modal');
    }
  }, [showDeleteConfirm, registerModal]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      await updateProfile({
        full_name: studentName.trim(),
        student_class: studentClass.trim(),
        institution: institution.trim(),
        gender: studentGender,
      });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteUserAccountAndData();
      setShowDeleteConfirm(false);
    } catch (e) {
      console.error(e);
      showToast('অ্যাকাউন্ট মুছতে ত্রুটি হয়েছে', 'error');
    } finally {
      setIsDeleting(false);
    }
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-8 animate-in fade-in max-w-4xl mx-auto">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-slate-200 border border-[#E8E5ED] dark:border-charcoal-700 flex items-center justify-center hover:bg-[#F2EDF8] transition cursor-pointer active:scale-95 shadow-xs"
            title="ফিরে যান"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">
              {t.settings.title}
            </h1>
            <p className="text-xs text-charcoal-500 dark:text-slate-400">
              {t.settings.subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* 1. Student Profile & Gender Avatar (Boy / Girl) */}
      <div className="bg-white dark:bg-charcoal-900 rounded-[28px] p-5 sm:p-6 border border-[#E8E5ED] dark:border-charcoal-800 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <StudentAvatar gender={studentGender} size="lg" />
            <div>
              <h3 className="font-black text-base text-charcoal-900 dark:text-white">
                {t.dashboard.studentCardTitle || 'শিক্ষার্থীর প্রোফাইল'}
              </h3>
              <p className="text-xs text-charcoal-500 dark:text-slate-400">
                ছেলে বা মেয়ে অবতার নির্বাচন করুন এবং নাম-প্রতিষ্ঠান পরিবর্তন করুন
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-black bg-lavender-100 dark:bg-charcoal-800 text-charcoal-800 dark:text-lavender-200 border border-lavender-200">
            {studentGender === 'male' ? 'ছাত্র ♂' : 'ছাত্রী ♀'}
          </span>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 pt-1">
          {/* Gender Selector Buttons */}
          <div>
            <label className="block text-xs font-black text-charcoal-800 dark:text-slate-200 mb-2">
              {t.dashboard.studentGender || 'শিক্ষার্থীর লিঙ্গ (আইকন নির্বাচন)'}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStudentGender('male')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                  studentGender === 'male'
                    ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/40 ring-2 ring-sky-300'
                    : 'border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800/60 hover:border-slate-300'
                }`}
              >
                <StudentAvatar gender="male" size="md" />
                <div>
                  <p className="text-xs font-black text-charcoal-900 dark:text-white">
                    {t.dashboard.boy || 'ছাত্র (ছেলে)'}
                  </p>
                  <span className="text-[11px] text-charcoal-500 dark:text-slate-400">
                    ছেলে আইকন ও স্টাইল
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStudentGender('female')}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                  studentGender === 'female'
                    ? 'border-rose-400 bg-rose-50 dark:bg-rose-950/40 ring-2 ring-rose-300'
                    : 'border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800/60 hover:border-slate-300'
                }`}
              >
                <StudentAvatar gender="female" size="md" />
                <div>
                  <p className="text-xs font-black text-charcoal-900 dark:text-white">
                    {t.dashboard.girl || 'ছাত্রী (মেয়ে)'}
                  </p>
                  <span className="text-[11px] text-charcoal-500 dark:text-slate-400">
                    মেয়ে আইকন ও স্টাইল
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Student Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-charcoal-800 dark:text-slate-200 mb-1">
                {t.dashboard.studentName}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="যেমন: Rasu IT"
                  className="w-full pl-10 pr-3 py-2 text-xs font-semibold rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-lavender-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-charcoal-800 dark:text-slate-200 mb-1">
                {t.dashboard.studentClass}
              </label>
              <div className="relative">
                <School className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  placeholder="যেমন: Hon's 3rd Year"
                  className="w-full pl-10 pr-3 py-2 text-xs font-semibold rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-lavender-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-charcoal-800 dark:text-slate-200 mb-1">
                {t.dashboard.studentInstitution}
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="যেমন: Maulvibazar Govt. College"
                  className="w-full pl-10 pr-3 py-2 text-xs font-semibold rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-lavender-400"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="px-6 py-2.5 bg-charcoal-900 dark:bg-white text-white dark:text-charcoal-900 rounded-full text-xs font-black transition shadow-xs cursor-pointer disabled:opacity-50 active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSavingProfile ? t.common.loading : t.common.save}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Language & Theme Preferences */}
      <div className="bg-white dark:bg-charcoal-900 rounded-[28px] p-5 sm:p-6 border border-[#E8E5ED] dark:border-charcoal-800 shadow-xs space-y-4">
        <h3 className="font-black text-base text-charcoal-900 dark:text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-lavender-600 dark:text-lavender-400" />
          <span>{t.settings.languageSection} ও থিম</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-charcoal-600 dark:text-slate-400 mb-1.5">
              {t.settings.languageSelect}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('bn')}
                className={`py-2 px-3 rounded-2xl text-xs font-black transition cursor-pointer ${
                  language === 'bn'
                    ? 'bg-lavender-400 text-charcoal-900 shadow-xs'
                    : 'bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-700 dark:text-slate-300 hover:bg-[#F2EDF8]'
                }`}
              >
                বাংলা (Bengali)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-2 px-3 rounded-2xl text-xs font-black transition cursor-pointer ${
                  language === 'en'
                    ? 'bg-lavender-400 text-charcoal-900 shadow-xs'
                    : 'bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-700 dark:text-slate-300 hover:bg-[#F2EDF8]'
                }`}
              >
                English
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-600 dark:text-slate-400 mb-1.5">
              অ্যাপের থিম
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-2xl text-xs font-black transition cursor-pointer ${
                  theme === 'light'
                    ? 'bg-lavender-400 text-charcoal-900 shadow-xs'
                    : 'bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-700 dark:text-slate-300 hover:bg-[#F2EDF8]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{t.settings.themeLight}</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-2xl text-xs font-black transition cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-lavender-400 text-charcoal-900 shadow-xs'
                    : 'bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-700 dark:text-slate-300 hover:bg-[#F2EDF8]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>{t.settings.themeDark}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Data Backup, Export & Import */}
      <div className="bg-white dark:bg-charcoal-900 rounded-[28px] p-5 sm:p-6 border border-[#E8E5ED] dark:border-charcoal-800 shadow-xs space-y-4">
        <h3 className="font-black text-base text-charcoal-900 dark:text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-sky-500" />
          <span>{t.settings.backupSection}</span>
        </h3>
        <p className="text-xs text-charcoal-500 dark:text-slate-400">
          {t.settings.backupDesc}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={exportDataAsJson}
            className="flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 hover:bg-[#F2EDF8] text-xs font-black text-charcoal-900 dark:text-white transition cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-500" />
            <span>{t.settings.exportJson}</span>
          </button>

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
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 hover:bg-[#F2EDF8] text-xs font-black text-charcoal-900 dark:text-white transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-lavender-600" />
              <span>{t.settings.importJson}</span>
            </button>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E8E5ED] dark:border-charcoal-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-charcoal-800 dark:text-slate-200">
              {t.settings.resetDemo}
            </p>
            <p className="text-[11px] text-charcoal-500">
              স্থানীয় ডেটা মুছে ফেলে নতুন পরিচ্ছন্ন শুরু করুন
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3.5 py-1.5 rounded-full border border-charcoal-300 dark:border-charcoal-700 text-charcoal-700 dark:text-slate-300 hover:bg-[#F2EDF8] dark:hover:bg-charcoal-800 text-xs font-bold transition cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট</span>
          </button>
        </div>
      </div>

      {/* 4. Account, Security & Permanent Account Deletion */}
      <div className="bg-white dark:bg-charcoal-900 rounded-[28px] p-5 sm:p-6 border border-[#E8E5ED] dark:border-charcoal-800 shadow-xs space-y-4">
        <h3 className="font-black text-base text-charcoal-900 dark:text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-500" />
          <span>{t.settings.accountSection}</span>
        </h3>

        {user ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#F8F7FA] dark:bg-charcoal-800 border border-[#E8E5ED] dark:border-charcoal-700">
            <div>
              <p className="text-xs text-charcoal-500">{t.settings.userEmail}</p>
              <p className="text-sm font-black text-charcoal-900 dark:text-white mt-0.5">
                {user.email}
              </p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400 text-xs font-black transition cursor-pointer self-start sm:self-auto"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t.settings.logoutBtn}</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-[#F8F7FA] dark:bg-charcoal-800 text-xs text-charcoal-600 dark:text-slate-400 border border-[#E8E5ED] dark:border-charcoal-700">
            বর্তমানে আপনি অফলাইন স্টাডি মোডে আছেন। আপনার তথ্য এই ব্রাউজারে সুরক্ষিত।
          </div>
        )}

        <div className="p-4 rounded-2xl bg-[#F8F7FA] dark:bg-charcoal-800 border border-[#E8E5ED] dark:border-charcoal-700 text-xs text-charcoal-600 dark:text-slate-400 space-y-1.5">
          <p className="font-black text-charcoal-800 dark:text-slate-200">
            {t.settings.deleteAccountGuidance}
          </p>
          <p className="leading-relaxed">
            {t.settings.deleteNotice}
          </p>
        </div>

        {/* Permanent Account Deletion Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-black transition cursor-pointer active:scale-98"
          >
            <Trash2 className="w-4 h-4" />
            <span>{t.settings.deleteAccountBtn || 'অ্যাকাউন্ট ও সমস্ত তথ্য চিরতরে মুছে ফেলুন'}</span>
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal-900/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-charcoal-900 rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-rose-200 dark:border-rose-900 text-center animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-[#E8E5ED] dark:bg-charcoal-700 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="font-black text-base text-charcoal-900 dark:text-white">
              {t.settings.deleteAccountConfirmTitle || 'আপনি কি নিশ্চিতভাবে অ্যাকাউন্ট মুছে ফেলতে চান?'}
            </h3>
            <p className="text-xs text-charcoal-600 dark:text-slate-400 mt-2 leading-relaxed">
              {t.settings.deleteAccountWarning || 'সতর্কতা: অ্যাকাউন্ট মুছে ফেললে আপনার সমস্ত পড়ার সেশন, বিষয়, টাস্ক, রুটিন, পরীক্ষার সময়সূচি এবং বন্ধুদের তালিকা ক্লাউড ডাটাবেজ থেকে সম্পূর্ণ মুছে যাবে। এই কাজটি আর ফিরিয়ে আনা সম্ভব নয়।'}
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-full text-xs font-black text-charcoal-700 dark:text-slate-300 bg-[#F8F7FA] dark:bg-charcoal-800 hover:bg-slate-200 transition cursor-pointer min-h-[44px]"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2.5 rounded-full text-xs font-black text-white bg-rose-600 hover:bg-rose-700 transition shadow-xs cursor-pointer min-h-[44px] flex items-center justify-center active:scale-95 disabled:opacity-50"
              >
                {isDeleting ? t.common.loading : 'মুছে ফেলুন'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal-900/80 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setShowResetConfirm(false)}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-charcoal-900 rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-amber-200 dark:border-amber-900 text-center animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-1.5 bg-[#E8E5ED] dark:bg-charcoal-700 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 mx-auto flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-charcoal-900 dark:text-white">
              {t.settings.resetDemo}?
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-slate-400 mt-1">
              {t.settings.resetConfirm}
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-full text-xs font-black text-charcoal-600 dark:text-slate-400 bg-slate-100 dark:bg-charcoal-800 hover:bg-slate-200 transition cursor-pointer min-h-[44px]"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 px-4 py-2.5 rounded-full text-xs font-black text-white bg-amber-600 hover:bg-amber-500 transition shadow-xs cursor-pointer min-h-[44px] flex items-center justify-center active:scale-95"
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
