import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Friend } from '../../types';
import { 
  Users, 
  UserPlus, 
  Flame, 
  Clock, 
  CheckCircle2, 
  BookOpen, 
  Trophy, 
  Sparkles, 
  Copy, 
  Check, 
  Trash2, 
  ArrowLeft, 
  School, 
  GraduationCap, 
  Search, 
  X,
  Heart,
  TrendingUp,
  Award
} from 'lucide-react';

export const FriendsView: React.FC = () => {
  const { 
    friends, 
    addFriend, 
    removeFriend, 
    sendKudosToFriend, 
    user, 
    profile, 
    todayStudyMinutes, 
    studyStreak, 
    completedTasksCount,
    language,
    t, 
    goBack, 
    canGoBack, 
    registerModal,
    showToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'today' | 'weekly'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [removeConfirmFriend, setRemoveConfirmFriend] = useState<Friend | null>(null);

  // Form State
  const [friendEmail, setFriendEmail] = useState('');
  const [friendName, setFriendName] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [institution, setInstitution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAddModalOpen) {
      const unregister = registerModal('add-friend-modal');
      return unregister;
    }
  }, [isAddModalOpen, registerModal]);

  useEffect(() => {
    if (removeConfirmFriend) {
      const unregister = registerModal('remove-friend-modal');
      return unregister;
    }
  }, [removeConfirmFriend, registerModal]);

  // Unique friend code based on email or id
  const myFriendCode = useMemo(() => {
    if (user?.email) return user.email;
    if (profile?.email) return profile.email;
    return 'student-' + (profile?.id || '2026').substring(0, 8);
  }, [user, profile]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(myFriendCode);
    setCopiedCode(true);
    showToast(t.friends.codeCopied, 'success');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleAddFriendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendEmail.trim()) {
      showToast(t.common.requiredField, 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await addFriend({
        email: friendEmail.trim(),
        name: friendName.trim() || undefined,
        student_class: studentClass.trim() || undefined,
        institution: institution.trim() || undefined,
      });

      if (ok) {
        setIsAddModalOpen(false);
        setFriendEmail('');
        setFriendName('');
        setStudentClass('');
        setInstitution('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmRemove = async () => {
    if (!removeConfirmFriend) return;
    await removeFriend(removeConfirmFriend.id);
    setRemoveConfirmFriend(null);
  };

  // Filtered and sorted friends list
  const filteredFriends = useMemo(() => {
    let list = [...friends];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f => 
        f.friend_name.toLowerCase().includes(q) || 
        f.friend_email.toLowerCase().includes(q) ||
        (f.institution && f.institution.toLowerCase().includes(q))
      );
    }

    if (activeTab === 'today') {
      list.sort((a, b) => b.today_minutes - a.today_minutes);
    } else if (activeTab === 'weekly') {
      list.sort((a, b) => b.weekly_minutes - a.weekly_minutes);
    }

    return list;
  }, [friends, searchQuery, activeTab]);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-24 md:pb-8 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-charcoal-800 border border-[#E8E5ED] dark:border-charcoal-700 flex items-center justify-center text-charcoal-900 dark:text-white shadow-xs hover:bg-[#F2EDF8] dark:hover:bg-charcoal-700 transition cursor-pointer active:scale-95"
            title="পূর্ববর্তী পৃষ্ঠায় ফিরে যান"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-charcoal-900 dark:text-white" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{t.friends.title}</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-lavender-100 text-charcoal-900 dark:bg-lavender-950 dark:text-lavender-300">
                {friends.length} জন
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 dark:text-slate-400 mt-0.5">
              {t.friends.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-2 bg-charcoal-900 hover:bg-black text-white dark:bg-white dark:text-charcoal-900 px-5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t.friends.addFriend}</span>
        </button>
      </div>

      {/* Student Share Card & Your Stats Highlight */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Your Profile & Metrics Card */}
        <div className="md:col-span-2 bg-white dark:bg-charcoal-900 rounded-[28px] p-5 sm:p-6 border border-[#E8E5ED] dark:border-charcoal-800 shadow-xs relative overflow-hidden">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-[#C5A7E2] text-charcoal-900 font-black text-xl flex items-center justify-center shadow-xs">
                {(profile?.full_name || 'তা')[0]}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-black text-charcoal-900 dark:text-white">
                    {profile?.full_name || 'তানভীর আহমেদ'}
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-mint-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                    আপনি (You)
                  </span>
                </div>
                <div className="text-xs text-charcoal-500 dark:text-slate-400 font-semibold mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{profile?.student_class || 'একাদশ শ্রেণি (HSC 2026)'}</span>
                  <span>•</span>
                  <span>{profile?.institution || 'ঢাকা রেসিডেনসিয়াল মডেল কলেজ'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Your Stats Grid */}
          <div className="grid grid-cols-3 gap-2.5 pt-3 border-t border-[#E8E5ED] dark:border-charcoal-800 text-center">
            <div className="p-2.5 rounded-2xl bg-[#F8F7FA] dark:bg-charcoal-800/80">
              <div className="text-[10px] font-black uppercase text-charcoal-400 dark:text-slate-400">
                আজকের পড়া
              </div>
              <div className="text-base font-black text-charcoal-900 dark:text-white mt-0.5">
                {(todayStudyMinutes / 60).toFixed(1)}ঘ
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#F8F7FA] dark:bg-charcoal-800/80">
              <div className="text-[10px] font-black uppercase text-charcoal-400 dark:text-slate-400 flex items-center justify-center gap-1">
                <Flame className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>স্ট্রিক</span>
              </div>
              <div className="text-base font-black text-charcoal-900 dark:text-white mt-0.5">
                {studyStreak} দিন
              </div>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#F8F7FA] dark:bg-charcoal-800/80">
              <div className="text-[10px] font-black uppercase text-charcoal-400 dark:text-slate-400">
                টাস্ক সম্পন্ন
              </div>
              <div className="text-base font-black text-charcoal-900 dark:text-white mt-0.5">
                {completedTasksCount} টি
              </div>
            </div>
          </div>
        </div>

        {/* Share Friend Code Card */}
        <div className="bg-[#F2EDF8] dark:bg-charcoal-900 rounded-[28px] p-5 border border-lavender-200/80 dark:border-charcoal-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black text-charcoal-900 dark:text-white mb-1.5">
              <Sparkles className="w-4 h-4 text-lavender-600 dark:text-lavender-400" />
              <span>{t.friends.myIdCard}</span>
            </div>
            <p className="text-xs text-charcoal-600 dark:text-slate-400">
              বন্ধুদের এই কোড বা ইমেইল দিলে তারা আপনাকে স্টাডি পার্টনার হিসেবে যুক্ত করতে পারবে।
            </p>
          </div>

          <div className="mt-4">
            <div className="p-2.5 rounded-2xl bg-white dark:bg-charcoal-800 border border-lavender-200 dark:border-charcoal-700 flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-charcoal-800 dark:text-slate-200 truncate select-all">
                {myFriendCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-3 py-1.5 rounded-xl bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 text-xs font-black flex items-center gap-1 transition cursor-pointer active:scale-95 shrink-0"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? t.friends.codeCopied : t.friends.copyCode}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Tab Selectors */}
      <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-4 sm:p-5 border border-[#E8E5ED] dark:border-charcoal-800 shadow-xs space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tab Selector Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: t.friends.tabs.all, icon: Users },
              { id: 'today', label: t.friends.tabs.todayLeaderboard, icon: Trophy },
              { id: 'weekly', label: t.friends.tabs.weeklyLeaderboard, icon: Award },
            ].map(({ id, label, icon: Icon }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-black shrink-0 transition cursor-pointer ${
                    isActive
                      ? 'bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 shadow-xs'
                      : 'bg-[#F2EDF8] dark:bg-charcoal-800 text-charcoal-700 dark:text-slate-300 hover:bg-lavender-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="বন্ধু বা প্রতিষ্ঠান খুঁজুন..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 focus:outline-hidden focus:ring-2 focus:ring-lavender-400"
            />
          </div>
        </div>
      </div>

      {/* Friends Cards Grid */}
      {filteredFriends.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFriends.map((friend, idx) => {
            const todayHours = (friend.today_minutes / 60).toFixed(1);
            const weeklyHours = (friend.weekly_minutes / 60).toFixed(1);

            return (
              <div
                key={friend.id}
                className="bg-white dark:bg-charcoal-900 rounded-[28px] p-5 border border-[#E8E5ED] dark:border-charcoal-800 shadow-xs hover:border-lavender-300 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Avatar, Info, and Rank if leaderboard */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#CFE4E0] to-[#C5A7E2] text-charcoal-900 font-black text-lg flex items-center justify-center shrink-0 shadow-2xs">
                        {friend.friend_name[0] || 'ব'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-charcoal-900 dark:text-white truncate">
                            {friend.friend_name}
                          </h4>
                          {activeTab !== 'all' && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                              #{idx + 1}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-charcoal-500 dark:text-slate-400 truncate mt-0.5">
                          {friend.student_class} {friend.institution ? `• ${friend.institution}` : ''}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setRemoveConfirmFriend(friend)}
                      title={t.friends.removeFriend}
                      className="p-1.5 text-charcoal-300 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Friends Metrics Bar */}
                  <div className="grid grid-cols-4 gap-2 py-3 border-y border-[#E8E5ED] dark:border-charcoal-800/80 text-center my-3">
                    <div className="p-2 rounded-2xl bg-[#F8F7FA] dark:bg-charcoal-800/70">
                      <div className="text-[9px] font-black uppercase tracking-wider text-charcoal-400 dark:text-slate-400">
                        আজকে
                      </div>
                      <div className="text-xs font-black text-charcoal-900 dark:text-white mt-0.5">
                        {todayHours}ঘ
                      </div>
                    </div>
                    <div className="p-2 rounded-2xl bg-[#F8F7FA] dark:bg-charcoal-800/70">
                      <div className="text-[9px] font-black uppercase tracking-wider text-charcoal-400 dark:text-slate-400">
                        সপ্তাহ
                      </div>
                      <div className="text-xs font-black text-charcoal-900 dark:text-white mt-0.5">
                        {weeklyHours}ঘ
                      </div>
                    </div>
                    <div className="p-2 rounded-2xl bg-[#F8F7FA] dark:bg-charcoal-800/70">
                      <div className="text-[9px] font-black uppercase tracking-wider text-charcoal-400 dark:text-slate-400 flex items-center justify-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                        <span>স্ট্রিক</span>
                      </div>
                      <div className="text-xs font-black text-charcoal-900 dark:text-white mt-0.5">
                        {friend.study_streak}দিন
                      </div>
                    </div>
                    <div className="p-2 rounded-2xl bg-[#F8F7FA] dark:bg-charcoal-800/70">
                      <div className="text-[9px] font-black uppercase tracking-wider text-charcoal-400 dark:text-slate-400">
                        টাস্ক
                      </div>
                      <div className="text-xs font-black text-charcoal-900 dark:text-white mt-0.5">
                        {friend.completed_tasks}টি
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer with Recent Subject & Kudos Button */}
                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <div className="flex items-center gap-1.5 text-charcoal-500 dark:text-slate-400 truncate">
                    <BookOpen className="w-3.5 h-3.5 text-lavender-500 shrink-0" />
                    <span className="truncate">{friend.last_studied_subject || 'পড়াশোনা চলছে'}</span>
                  </div>

                  <button
                    onClick={() => sendKudosToFriend(friend.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FFE49A] hover:bg-amber-300 text-charcoal-900 transition shadow-2xs cursor-pointer active:scale-95 shrink-0"
                    title="সাধুবাদ জানান ও উৎসাহ দিন"
                  >
                    <span>👏</span>
                    <span>{t.friends.sendKudos}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-10 text-center border border-dashed border-[#E8E5ED] dark:border-charcoal-800 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-[#F2EDF8] dark:bg-charcoal-800 text-lavender-600 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="font-black text-base text-charcoal-900 dark:text-white">
            {t.friends.noFriends}
          </h3>
          <p className="text-xs text-charcoal-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {t.friends.noFriendsDesc}
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-5 inline-flex items-center gap-2 bg-charcoal-900 hover:bg-black text-white dark:bg-white dark:text-charcoal-900 px-5 py-2.5 rounded-full font-black text-xs transition shadow-md cursor-pointer active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t.friends.addFriend}</span>
          </button>
        </div>
      )}

      {/* Add Friend Modal */}
      {isAddModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsAddModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-charcoal-900 rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-[#E8E5ED] dark:border-charcoal-800 p-6 relative max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1.5 bg-[#E8E5ED] dark:bg-charcoal-700 rounded-full mx-auto mb-4 sm:hidden shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-[#E8E5ED] dark:border-charcoal-800 mb-4 shrink-0">
              <h3 className="text-base sm:text-lg font-black text-charcoal-900 dark:text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-lavender-400" />
                {t.friends.addFriend}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-charcoal-400 hover:text-charcoal-700 dark:hover:text-slate-200 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddFriendSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-slate-300 mb-1">
                  {t.friends.friendEmailOrCode} *
                </label>
                <input
                  type="text"
                  required
                  value={friendEmail}
                  onChange={(e) => setFriendEmail(e.target.value)}
                  placeholder="যেমন: classmate@gmail.com"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 focus:outline-hidden focus:ring-2 focus:ring-lavender-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal-700 dark:text-slate-300 mb-1">
                  {t.friends.friendName}
                </label>
                <input
                  type="text"
                  value={friendName}
                  onChange={(e) => setFriendName(e.target.value)}
                  placeholder="যেমন: আফিফা জাহান"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 focus:outline-hidden focus:ring-2 focus:ring-lavender-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-charcoal-700 dark:text-slate-300 mb-1">
                    {t.friends.studentClass}
                  </label>
                  <input
                    type="text"
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    placeholder="যেমন: একাদশ শ্রেণি"
                    className="w-full px-3.5 py-2 text-sm rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal-700 dark:text-slate-300 mb-1">
                    {t.friends.institution}
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    placeholder="যেমন: নটর ডেম কলেজ"
                    className="w-full px-3.5 py-2 text-sm rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
                  />
                </div>
              </div>

              <p className="text-[11px] text-charcoal-400 dark:text-slate-500 italic">
                {t.friends.connectNotice}
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E8E5ED] dark:border-charcoal-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-charcoal-600 dark:text-slate-400 hover:bg-[#F2EDF8] transition cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-full text-xs font-black text-white bg-charcoal-900 hover:bg-black dark:bg-white dark:text-charcoal-900 transition shadow-md cursor-pointer active:scale-95"
                >
                  {isSubmitting ? t.common.loading : t.friends.addFriend}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Remove Confirmation Modal */}
      {removeConfirmFriend && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setRemoveConfirmFriend(null)}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-charcoal-900 rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-[#E8E5ED] dark:border-charcoal-800 text-center animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-black text-base text-charcoal-900 dark:text-white">
              {t.friends.removeFriend}?
            </h3>
            <p className="text-xs text-charcoal-500 dark:text-slate-400 mt-1">
              "{removeConfirmFriend.friend_name}" {t.friends.confirmRemove}
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setRemoveConfirmFriend(null)}
                className="flex-1 px-4 py-2.5 rounded-full text-xs font-bold text-charcoal-600 dark:text-slate-400 bg-slate-100 dark:bg-charcoal-800 hover:bg-slate-200 transition cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmRemove}
                className="flex-1 px-4 py-2.5 rounded-full text-xs font-black text-white bg-rose-600 hover:bg-rose-500 transition shadow-xs cursor-pointer active:scale-95"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
