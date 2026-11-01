import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, X, Share } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'header' | 'card' | 'badge';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  className = '',
  variant = 'header' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'card') {
      return (
        <button
          onClick={install}
          className={`flex items-center justify-between p-4 rounded-2xl bg-lavender-50 hover:bg-lavender-100 dark:bg-lavender-950/40 dark:hover:bg-lavender-950/60 border border-lavender-200 dark:border-lavender-800/80 transition cursor-pointer group active:scale-98 ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-lavender-200 dark:bg-lavender-900 text-charcoal-900 dark:text-lavender-200 flex items-center justify-center shrink-0">
              <Smartphone className="w-5 h-5 text-lavender-700 dark:text-lavender-300" />
            </div>
            <div className="text-left">
              <div className="text-xs font-black text-charcoal-900 dark:text-white">
                ফোনে বা কম্পিউটারে অ্যাপ ইনস্টল করুন
              </div>
              <div className="text-[11px] text-charcoal-500 dark:text-slate-400">
                অফলাইন সাপোর্ট ও দ্রুত এক ক্লিকে ব্যবহারের জন্য
              </div>
            </div>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 text-xs font-black shrink-0">
            ইনস্টল
          </div>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lavender-100 hover:bg-lavender-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 text-charcoal-900 dark:text-lavender-200 text-xs font-black transition cursor-pointer active:scale-95 border border-lavender-200 dark:border-charcoal-700 ${className}`}
        title="অ্যাপ ইনস্টল করুন"
      >
        <Download className="w-3.5 h-3.5 text-lavender-600 dark:text-lavender-400" />
        <span className="hidden sm:inline">অ্যাপ ইনস্টল</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        {variant === 'card' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center justify-between p-4 rounded-2xl bg-lavender-50 hover:bg-lavender-100 dark:bg-lavender-950/40 border border-lavender-200 dark:border-lavender-800/80 transition cursor-pointer group active:scale-98 ${className}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-lavender-200 dark:bg-lavender-900 text-charcoal-900 dark:text-lavender-200 flex items-center justify-center shrink-0">
                <Smartphone className="w-5 h-5 text-lavender-700 dark:text-lavender-300" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-charcoal-900 dark:text-white">
                  iPhone / iPad-এ ইনস্টল করুন
                </div>
                <div className="text-[11px] text-charcoal-500 dark:text-slate-400">
                  হোম স্ক্রিনে সরাসরি অ্যাপের মতো যুক্ত করুন
                </div>
              </div>
            </div>
            <div className="px-3 py-1.5 rounded-full bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 text-xs font-black shrink-0">
              নির্দেশনা
            </div>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lavender-100 hover:bg-lavender-200 dark:bg-charcoal-800 text-charcoal-900 dark:text-lavender-200 text-xs font-black transition cursor-pointer border border-lavender-200 dark:border-charcoal-700 ${className}`}
            title="iOS-এ ইনস্টল করুন"
          >
            <Smartphone className="w-3.5 h-3.5 text-lavender-600 dark:text-lavender-400" />
            <span className="hidden sm:inline">iOS ইনস্টল</span>
          </button>
        )}

        {showIOSGuide && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal-900/80 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            onClick={() => setShowIOSGuide(false)}
          >
            <div 
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-charcoal-900 p-6 shadow-2xl border border-[#E8E5ED] dark:border-charcoal-800 text-center animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-2xl bg-lavender-100 dark:bg-lavender-950/80 text-lavender-600 dark:text-lavender-300 mx-auto flex items-center justify-center mb-3">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-base font-black text-charcoal-900 dark:text-white">
                iPhone / iPad-এ ইনস্টল করার নিয়ম
              </h3>
              <div className="mt-4 text-xs text-charcoal-600 dark:text-slate-300 space-y-3 text-left bg-[#F8F7FA] dark:bg-charcoal-800 p-4 rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-lavender-200 dark:bg-lavender-900 text-charcoal-900 dark:text-lavender-200 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    ১
                  </div>
                  <div>
                    সাফারি (Safari) ব্রাউজারের নিচের টুলবারে <Share className="w-3.5 h-3.5 inline text-sky-600 mx-0.5" /> <strong>Share</strong> বোতামে ট্যাপ করুন।
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-lavender-200 dark:bg-lavender-900 text-charcoal-900 dark:text-lavender-200 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    ২
                  </div>
                  <div>
                    মেনু থেকে নিচে স্ক্রল করে <strong>'Add to Home Screen'</strong> অপশনটি বেছে নিন।
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-lavender-200 dark:bg-lavender-900 text-charcoal-900 dark:text-lavender-200 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                    ৩
                  </div>
                  <div>
                    উপরে ডানপাশে <strong>'Add'</strong> বোতামে চাপলেই অ্যাপটি আপনার ফোনে ইনস্টল হয়ে যাবে!
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-full bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 py-2.5 text-xs font-black transition cursor-pointer min-h-[42px]"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
