import React, { useEffect } from 'react';
import { X, ShieldCheck, Lock, UserCheck, EyeOff, Trash2, CheckCircle2, HeartHandshake } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal-900/80 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl max-h-[90vh] bg-white dark:bg-charcoal-900 rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-[#E8E5ED] dark:border-charcoal-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-12 h-1.5 bg-[#E8E5ED] dark:bg-charcoal-700 rounded-full mx-auto mt-3 mb-1 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E5ED] dark:border-charcoal-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-charcoal-900 dark:text-white">
                প্রাইভেসি ও পলিসি (Privacy Policy)
              </h2>
              <p className="text-xs text-charcoal-500 dark:text-slate-400">
                StudyMate BD-তে আপনার ব্যক্তিগত তথ্যের সর্বোচ্চ গোপনীয়তা ও সুরক্ষা
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-500 hover:text-charcoal-900 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
            title="বন্ধ করুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="px-6 py-5 overflow-y-auto space-y-6 text-xs text-charcoal-700 dark:text-slate-300 leading-relaxed">
          {/* Trust Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/70 dark:border-emerald-900/60 text-center">
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <div className="font-black text-[11px] text-emerald-900 dark:text-emerald-300">১০০% এনক্রিপ্টেড</div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400/80">নিরাপদ RLS ক্লাউড</div>
            </div>
            <div className="p-3 rounded-2xl bg-lavender-50 dark:bg-lavender-950/40 border border-lavender-200/70 dark:border-lavender-900/60 text-center">
              <EyeOff className="w-4 h-4 text-lavender-600 dark:text-lavender-400 mx-auto mb-1" />
              <div className="font-black text-[11px] text-lavender-900 dark:text-lavender-300">তথ্য সুরক্ষা</div>
              <div className="text-[10px] text-lavender-700 dark:text-lavender-400/80">সর্বোচ্চ গোপনীয়তা</div>
            </div>
            <div className="p-3 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/70 dark:border-sky-900/60 text-center">
              <UserCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 mx-auto mb-1" />
              <div className="font-black text-[11px] text-sky-900 dark:text-sky-300">আইডি ভিত্তিক</div>
              <div className="text-[10px] text-sky-700 dark:text-sky-400/80">ইমেইল প্রদর্শন বন্ধ</div>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200/70 dark:border-rose-900/60 text-center">
              <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400 mx-auto mb-1" />
              <div className="font-black text-[11px] text-rose-900 dark:text-rose-300">পূর্ণ নিয়ন্ত্রণ</div>
              <div className="text-[10px] text-rose-700 dark:text-rose-400/80">১০০% স্থায়ী ডিলিট</div>
            </div>
          </div>

          {/* Section 1: Introduction */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-charcoal-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>১. ভূমিকা ও উদ্দেশ্য</span>
            </h3>
            <p>
              StudyMate BD বাংলাদেশের শিক্ষার্থীদের দৈনিক পড়াশোনা সুশৃঙ্খল করা, পমোডোরো ফোকাস টাইম পর্যবেক্ষণ এবং সহপাঠীদের সাথে সুস্থ প্রতিযোগিতার মাধ্যমে নিয়মিত অধ্যয়নের অভ্যাস গড়ে তোলার লক্ষ্যে তৈরি। শিক্ষার্থীদের তথ্যের গোপনীয়তা ও সুরক্ষা রক্ষা করা আমাদের প্রধান অঙ্গীকার।
            </p>
          </div>

          {/* Section 2: Data Collected */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-charcoal-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>২. আমরা যে তথ্যগুলো সংরক্ষণ করি</span>
            </h3>
            <ul className="list-disc list-inside space-y-1.5 pl-1 text-charcoal-600 dark:text-slate-400">
              <li><strong className="text-charcoal-800 dark:text-slate-200">প্রোফাইল তথ্য:</strong> আপনার নাম, লিঙ্গ (ছেলে/মেয়ে অবতার), শ্রেণি/বিভাগ, শিক্ষাপ্রতিষ্ঠান এবং স্বয়ংক্রিয়ভাবে তৈরি স্টুডেন্ট আইডি (Student Code)।</li>
              <li><strong className="text-charcoal-800 dark:text-slate-200">পড়াশোনার রেকর্ড:</strong> বিষয় তালিকা, অ্যাসাইনমেন্ট ও টাস্কের অবস্থা, পরীক্ষার তারিখ এবং পড়ার সাপ্তাহিক রুটিন।</li>
              <li><strong className="text-charcoal-800 dark:text-slate-200">ফোকাস ও পমোডোরো সেশন:</strong> দৈনিক ও সাপ্তাহিক পড়ার মোট সময় (মিনিট), পড়ার ধারাবাহিকতা (Streak) ও শীর্ষ বিষয়ের পরিসংখ্যান।</li>
              <li><strong className="text-charcoal-800 dark:text-slate-200">সহপাঠী সংযুক্তি:</strong> আপনার অনুমোদিত বন্ধুদের তালিকা এবং পড়াশোনার অগ্রগতিতে পাঠানো সাধুবাদ (Kudos) বার্তা।</li>
            </ul>
          </div>

          {/* Section 3: Peer Visibility & Student Code */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-charcoal-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>৩. সহপাঠীদের সাথে দৃশ্যমানতা ও গোপনীয়তা</span>
            </h3>
            <p>
              শিক্ষার্থীদের ব্যক্তিগত নিরাপত্তা নিশ্চিত করতে StudyMate BD-তে কোনো সার্বজনীন ডিরেক্টরি রাখা হয়নি। 
            </p>
            <div className="p-3.5 rounded-2xl bg-[#F8F7FA] dark:bg-charcoal-800/80 border border-[#E8E5ED] dark:border-charcoal-700/80 space-y-1.5">
              <p>• <strong>স্টুডেন্ট আইডি দিয়ে সংযোগ:</strong> সরাসরি কারো ইমেইল অ্যাড্রেস না চেয়ে স্টুডেন্ট কোড দিয়ে সংযোগ তৈরি করা হয়।</p>
              <p>• <strong>শুধুমাত্র বন্ধুদের সাথে শেয়ার:</strong> আপনার অনুমতি ছাড়া অন্য কেউ আপনার পড়ার সময় দেখতে পারবে না। আবেদন গ্রহণ করলেই কেবল সেই বন্ধু আপনার আজকের পড়ার সময় ও পড়ার স্ট্রিক দেখতে পারবে।</p>
              <p>• <strong>ব্যক্তিগত নোট সম্পূর্ণ গোপন:</strong> আপনার কোনো কাজের বিস্তারিত নোট, পরীক্ষার ব্যক্তিগত প্রস্তুতি বা সিলেবাসের বিবরণ বন্ধুদের স্ক্রিনে প্রদর্শিত হয় না।</p>
            </div>
          </div>

          {/* Section 4: Cloud Security & RLS */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-charcoal-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>৪. প্রযুক্তিগত নিরাপত্তা ও Row-Level Security (RLS)</span>
            </h3>
            <p>
              আমাদের ডাটাবেজে ইন্ডাস্ট্রি-স্ট্যান্ডার্ড PostgreSQL Row-Level Security (RLS) প্রযুক্তি বাস্তবায়িত রয়েছে। এর ফলে প্রতিটি শিক্ষার্থী কেবলমাত্র তার নিজস্ব সংরক্ষিত ডেটা রিড ও রাইট করতে পারে। একজন শিক্ষার্থী অন্য কোনো শিক্ষার্থীর সংরক্ষিত ডেটা দেখতে বা পরিবর্তন করতে প্রযুক্তিগতভাবেই অক্ষম।
            </p>
          </div>

          {/* Section 5: Total Account Deletion */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-charcoal-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>৫. সম্পূর্ণ ডেটা মুছে ফেলার অধিকার (১০০% Erasure)</span>
            </h3>
            <p>
              আপনার অ্যাকাউন্ট ও তথ্যের ওপর আপনার সম্পূর্ণ মালিকানা রয়েছে। সেটিংস মেনুর "স্থায়ীভাবে অ্যাকাউন্ট ও সমস্ত তথ্য মুছে ফেলুন" বোতামে ক্লিক করলে আপনার প্রোফাইল, সমস্ত বিষয়ের তালিকা, টাস্ক, রুটিন, পরীক্ষার সময়সূচি, পড়ার সেশন হিস্ট্রি, ফ্রেন্ড রিকোয়েস্ট এবং সাধুবাদ বার্তার ১০০% ডেটা ডাটাবেজ থেকে তাৎক্ষণিকভাবে চিরতরে বিলুপ্ত করা হয়। কোনো প্রকার ব্যাকআপ বা অবশিষ্টাংশ রাখা হয় না।
            </p>
          </div>

          {/* Section 6: No Unauthorized Data Sale */}
          <div className="space-y-2">
            <h3 className="text-sm font-black text-charcoal-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>৬. ব্যক্তিগত তথ্য বিক্রি বা অপব্যবহার নিষিদ্ধ</span>
            </h3>
            <p>
              আমরা শিক্ষার্থীদের কোনো ব্যক্তিগত তথ্য কোনো ডাটা ব্রোকার বা অননুমোদিত তৃতীয় পক্ষের কাছে বিক্রি বা ভাড়া দিই না। আপনার পড়াশোনার রেকর্ড সম্পূর্ণ নিরাপদ।
            </p>
          </div>

          {/* Footer note */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 flex items-start gap-3">
            <HeartHandshake className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 dark:text-emerald-200">
              <span className="font-bold">আমাদের প্রতিশ্রুতি:</span> শিক্ষার্থীদের নিরাপদ, বিভ্রান্তিমুক্ত এবং সম্পূর্ণ গোপনীয় পরিবেশে পড়াশোনার সঙ্গী হিসেবে আমরা নিরবচ্ছিন্ন সেবা প্রদানে বদ্ধপরিকর।
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#E8E5ED] dark:border-charcoal-800 bg-[#F8F7FA] dark:bg-charcoal-900/80 flex items-center justify-between">
          <div className="text-[11px] text-charcoal-500 dark:text-slate-400">
            সর্বশেষ হালনাগাদ: নভেম্বর ২০২৬
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-xs cursor-pointer active:scale-95 min-h-[40px]"
          >
            বুঝেছি ও সম্মত আছি
          </button>
        </div>
      </div>
    </div>
  );
};
