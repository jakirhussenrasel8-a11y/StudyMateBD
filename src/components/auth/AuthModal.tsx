import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  LogIn, 
  UserPlus, 
  KeyRound, 
  AlertCircle, 
  GraduationCap, 
  HelpCircle,
  Sparkles 
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

type AuthTab = 'login' | 'signup' | 'forgot';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onOpenSettings }) => {
  const { 
    t, 
    signInWithEmail, 
    signUpWithEmail, 
    resetPasswordForEmail, 
    supabaseConfig, 
    setIsDemoMode 
  } = useApp();

  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!supabaseConfig.isConfigured) {
      setErrorMessage(
        'সুপাবেজ ক্রেডেনশিয়াল এখনো সেট করা হয়নি। অনুগ্রহ করে সেটিংসে গিয়ে Supabase Project URL এবং Anon Key দিন।'
      );
      return;
    }

    if (!email.trim() || (!password.trim() && authTab !== 'forgot')) {
      setErrorMessage('অনুগ্রহ করে ইমেইল এবং পাসওয়ার্ড সঠিকভাবে পূরণ করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      if (authTab === 'login') {
        const result = await signInWithEmail(email, password);
        if (result.success) {
          onClose();
        } else {
          setErrorMessage(result.error || 'লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।');
        }
      } else if (authTab === 'signup') {
        if (password.length < 6) {
          setErrorMessage('পাসওয়ার্ড ন্যূনতম ৬ অক্ষরের হতে হবে।');
          setIsSubmitting(false);
          return;
        }
        const result = await signUpWithEmail(email, password, fullName);
        if (result.success) {
          setSuccessMessage(t.auth.signupSuccess);
          setTimeout(() => {
            onClose();
          }, 1500);
        } else {
          setErrorMessage(result.error || 'সাইন আপ ব্যর্থ হয়েছে।');
        }
      } else if (authTab === 'forgot') {
        const result = await resetPasswordForEmail(email);
        if (result.success) {
          setSuccessMessage(t.auth.passwordResetSent);
        } else {
          setErrorMessage(result.error || 'রিসেট লিংক পাঠানো সম্ভব হয়নি।');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContinueDemo = () => {
    setIsDemoMode(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 text-center border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-950/20">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 mx-auto flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {authTab === 'login' && t.auth.login}
            {authTab === 'signup' && t.auth.signup}
            {authTab === 'forgot' && t.auth.forgotPassword}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {authTab === 'login' && 'আপনার ক্লাউড অ্যাকাউন্টে প্রবেশ করে সব ডিভাইস থেকে পড়ার ডেটা সিঙ্ক করুন'}
            {authTab === 'signup' && 'বিনামূল্যে অ্যাকাউন্ট খুলে সব ডেটা নিরাপদে ক্লাউডে সংরক্ষণ করুন'}
            {authTab === 'forgot' && 'আপনার ইমেইল দিন, আমরা পাসওয়ার্ড রিসেট লিংক পাঠাব'}
          </p>
        </div>

        {/* Credentials Missing Notice */}
        {!supabaseConfig.isConfigured && (
          <div className="m-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="font-semibold">Supabase ক্লাউড ডেটাবেস এখনো সেটআপ করা হয়নি</p>
              <p className="mt-0.5 text-[11px] text-amber-700 dark:text-amber-300/80">
                আপনি নিশ্চিন্তে নিচের <span className="font-bold underline">ডেমো মোড</span> চালিয়ে যেতে পারেন, অথবা বিনামূল্যে ক্লাউড চালু করতে সেটিংসে যান।
              </p>
              <button
                type="button"
                onClick={() => { onClose(); onOpenSettings(); }}
                className="mt-1.5 text-xs font-bold text-amber-900 dark:text-amber-200 underline cursor-pointer"
              >
                সেটিংস থেকে Supabase যুক্ত করুন &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <p>{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
            <p>{successMessage}</p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {authTab === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                আপনার নাম (Full Name)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="যেমন: সাকিব আল হাসান"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t.auth.email} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {authTab !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {t.auth.password} *
                </label>
                {authTab === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setAuthTab('forgot'); setErrorMessage(''); }}
                    className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {t.auth.forgotPassword}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>{t.common.loading}</span>
            ) : authTab === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>{t.auth.login}</span>
              </>
            ) : authTab === 'signup' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>{t.auth.signup}</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>{t.auth.resetPassword}</span>
              </>
            )}
          </button>

          {/* Toggle between Login / Sign Up */}
          <div className="text-center pt-2">
            {authTab === 'login' ? (
              <button
                type="button"
                onClick={() => { setAuthTab('signup'); setErrorMessage(''); }}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium cursor-pointer"
              >
                {t.auth.dontHaveAccount}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setAuthTab('login'); setErrorMessage(''); }}
                className="text-xs text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium cursor-pointer"
              >
                {t.auth.alreadyHaveAccount}
              </button>
            )}
          </div>
        </form>

        {/* Demo Mode Button */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={handleContinueDemo}
            className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 transition shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
          >
            <span>📱</span>
            <span>{t.auth.demoMode}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
