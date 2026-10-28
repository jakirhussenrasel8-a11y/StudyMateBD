import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Subject } from '../../types';
import { 
  BookOpen, 
  Plus, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckSquare, 
  Clock, 
  X,
  Palette,
  ArrowLeft,
  History,
  Calendar,
  Play,
  Sparkles 
} from 'lucide-react';

const PRESET_COLORS = [
  '#C5A7E2', // lavender
  '#CFE4E0', // mint
  '#FFE49A', // soft yellow
  '#80B9F0', // sky blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
];

interface SubjectsViewProps {
  onOpenCreate: () => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({ onOpenCreate }) => {
  const { 
    subjects, 
    tasks, 
    sessions, 
    addSubject, 
    updateSubject, 
    deleteSubject, 
    recordStudySession,
    setActiveTab,
    setTimerSelectedSubjectId,
    startTimer,
    language,
    t,
    goBack,
    canGoBack,
    registerModal 
  } = useApp();

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteConfirmSubject, setDeleteConfirmSubject] = useState<Subject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historySubject, setHistorySubject] = useState<Subject | null>(null);
  const [manualDuration, setManualDuration] = useState<number>(30);
  const [manualNotes, setManualNotes] = useState<string>('');
  const [isLoggingManual, setIsLoggingManual] = useState<boolean>(false);

  useEffect(() => {
    if (isModalOpen) {
      const unregister = registerModal('subject-modal');
      return unregister;
    }
  }, [isModalOpen, registerModal]);

  useEffect(() => {
    if (deleteConfirmSubject) {
      const unregister = registerModal('delete-subject-modal');
      return unregister;
    }
  }, [deleteConfirmSubject, registerModal]);

  useEffect(() => {
    if (historySubject) {
      const unregister = registerModal('history-subject-modal');
      return unregister;
    }
  }, [historySubject, registerModal]);

  // Form State
  const [name, setName] = useState('');
  const [color, setColor] = useState('#10b981');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stats calculation per subject
  const subjectStats = useMemo(() => {
    const map = new Map<string, { taskCount: number; studyMinutes: number }>();
    
    subjects.forEach(sub => {
      const taskCount = tasks.filter(t => t.subject_id === sub.id).length;
      const studyMinutes = sessions
        .filter(s => s.subject_id === sub.id)
        .reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      map.set(sub.id, { taskCount, studyMinutes });
    });

    return map;
  }, [subjects, tasks, sessions]);

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setName(subject.name);
    setColor(subject.color || '#10b981');
    setDescription(subject.description || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setName('');
    setColor(PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)]);
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError(t.common.requiredField);
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingSubject) {
        const ok = await updateSubject(editingSubject.id, {
          name: name.trim(),
          color,
          description: description.trim() || undefined,
        });
        if (ok) setIsModalOpen(false);
      } else {
        const ok = await addSubject({
          name: name.trim(),
          color,
          description: description.trim() || undefined,
        });
        if (ok) setIsModalOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmSubject) return;
    setIsSubmitting(true);
    try {
      await deleteSubject(deleteConfirmSubject.id);
      setDeleteConfirmSubject(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in max-w-5xl mx-auto">
      {/* Top Header with Back button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={goBack}
            className="w-10 h-10 rounded-full bg-white dark:bg-charcoal-800 border border-[#E8E5ED] dark:border-charcoal-700 flex items-center justify-center text-charcoal-900 dark:text-white shadow-xs hover:bg-[#F2EDF8] dark:hover:bg-charcoal-700 transition cursor-pointer active:scale-95 shrink-0"
            title="পূর্ববর্তী পৃষ্ঠায় ফিরে যান"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-charcoal-900 dark:text-white" />
          </button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900 dark:text-white tracking-tight">
              {t.subjects.title}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 dark:text-slate-400 mt-0.5">
              {t.subjects.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="self-start sm:self-auto flex items-center gap-2 bg-charcoal-900 hover:bg-black text-white dark:bg-white dark:text-charcoal-900 px-5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.subjects.addSubject}</span>
        </button>
      </div>

      {/* Subjects Grid */}
      {subjects.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject) => {
            const stats = subjectStats.get(subject.id) || { taskCount: 0, studyMinutes: 0 };
            const hours = Math.floor(stats.studyMinutes / 60);
            const mins = stats.studyMinutes % 60;

            return (
              <div
                key={subject.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-2xs hover:shadow-md transition flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Color accent line on top */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: subject.color }}
                />

                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-xs"
                        style={{ backgroundColor: subject.color }}
                      >
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                          {subject.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {subject.description || 'কোনো বিবরণ দেওয়া নেই'}
                        </p>
                      </div>
                    </div>

                    {/* Actions Menu buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleOpenEdit(subject)}
                        title={t.common.edit}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmSubject(subject)}
                        title={t.common.delete}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Subject Statistics & Interactive History Button */}
                <div className="mt-4 pt-3 border-t border-[#E8E5ED] dark:border-charcoal-800 flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-1.5 text-charcoal-600 dark:text-slate-400">
                    <CheckSquare className="w-3.5 h-3.5 text-charcoal-400" />
                    <span>{stats.taskCount} টি টাস্ক</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHistorySubject(subject)}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F2EDF8] hover:bg-lavender-200 text-charcoal-800 dark:bg-charcoal-800 dark:text-lavender-300 transition cursor-pointer active:scale-95"
                    title="পড়ার সময় ও বিস্তারিত সেশন তালিকা দেখুন"
                  >
                    <History className="w-3.5 h-3.5 text-lavender-600 dark:text-lavender-400" />
                    <span>{hours > 0 ? `${hours}ঘ ` : ''}{mins}মি পড়া</span>
                    <span className="text-[10px] opacity-60">→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-800 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {t.subjects.noSubjects}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            {t.subjects.addFirstSubject}
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-rose-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.subjects.addSubject}</span>
          </button>
        </div>
      )}

      {/* Add / Edit Subject Modal (Mobile Bottom-Sheet) */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-rose-100/60 dark:border-slate-800 p-5 sm:p-6 relative max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sheet Drag Indicator */}
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {editingSubject ? t.subjects.editSubject : t.subjects.addSubject}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer active:scale-90 transition-transform"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <p className="text-xs text-rose-500 my-2 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl shrink-0 font-medium">
                {formError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 pt-3 space-y-3.5 flex-1 touch-manipulation">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.subjects.subjectName} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.subjects.subjectNamePlaceholder}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.subjects.color}</span>
                </label>
                <div className="flex items-center gap-3 flex-wrap py-1">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-8 h-8 rounded-full transition-transform cursor-pointer active:scale-90 ${
                        color === c ? 'scale-125 ring-2 ring-offset-2 ring-rose-500 shadow-sm' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                      aria-label={`Color ${c}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.subjects.description}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="যেমন: ১ম পত্র অধ্যায় ১-৪ রিভিশন ও বোর্ড প্রশ্ন সলভ"
                  className="w-full px-3.5 py-2 text-base sm:text-sm rounded-xl border border-rose-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer min-h-[44px]"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-xs shadow-rose-500/20 transition disabled:opacity-50 cursor-pointer min-h-[44px] flex items-center justify-center active:scale-98"
                >
                  {isSubmitting ? t.common.loading : t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Mobile Bottom-Sheet) */}
      {deleteConfirmSubject && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDeleteConfirmSubject(null)}
        >
          <div 
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl border border-rose-100/60 dark:border-slate-800 text-center animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
              {t.subjects.deleteSubject}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              "{deleteConfirmSubject.name}" {t.subjects.confirmDelete}
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmSubject(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition cursor-pointer min-h-[44px]"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition shadow-xs cursor-pointer min-h-[44px] flex items-center justify-center active:scale-98"
              >
                {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Study History Modal (Mobile Bottom-Sheet Style) */}
      {historySubject && (() => {
        const subjectSessions = sessions
          .filter(s => s.subject_id === historySubject.id)
          .sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
        
        const totalSubjectMinutes = subjectSessions.reduce((acc, s) => acc + (s.duration_minutes || 0), 0);
        const subHours = Math.floor(totalSubjectMinutes / 60);
        const subMins = totalSubjectMinutes % 60;

        const handleAddManualSession = async (e: React.FormEvent) => {
          e.preventDefault();
          if (manualDuration <= 0) return;
          const ok = await recordStudySession({
            subject_id: historySubject.id,
            duration_minutes: manualDuration,
            session_type: 'manual',
            notes: manualNotes.trim() || undefined,
          });
          if (ok) {
            setIsLoggingManual(false);
            setManualNotes('');
          }
        };

        const handleStartSubjectTimer = () => {
          setTimerSelectedSubjectId(historySubject.id);
          setActiveTab('timer');
          startTimer();
          setHistorySubject(null);
        };

        return (
          <div 
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => {
              setHistorySubject(null);
              setIsLoggingManual(false);
            }}
          >
            <div 
              className="w-full max-w-lg bg-white dark:bg-charcoal-900 rounded-t-[32px] sm:rounded-3xl shadow-2xl border border-[#E8E5ED] dark:border-charcoal-800 p-5 sm:p-6 relative max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Sheet Drag Indicator */}
              <div className="w-12 h-1.5 bg-[#E8E5ED] dark:bg-charcoal-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

              {/* Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#E8E5ED] dark:border-charcoal-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs font-bold"
                    style={{ backgroundColor: historySubject.color }}
                  >
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-charcoal-900 dark:text-white line-clamp-1">
                      {historySubject.name}
                    </h3>
                    <p className="text-xs text-charcoal-500 dark:text-slate-400 font-semibold">
                      পড়ার বিস্তারিত ইতিহাস ও সময়
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setHistorySubject(null);
                    setIsLoggingManual(false);
                  }}
                  className="p-2 text-charcoal-400 hover:text-charcoal-700 dark:hover:text-slate-200 rounded-full transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Total Stats Banner */}
              <div className="my-3.5 p-4 rounded-2xl bg-[#F8F7FA] dark:bg-charcoal-800/80 border border-[#E8E5ED] dark:border-charcoal-700 flex items-center justify-between gap-3 shrink-0">
                <div>
                  <div className="text-[11px] font-black uppercase tracking-wider text-charcoal-400 dark:text-slate-400">
                    মোট পঠিত সময়
                  </div>
                  <div className="text-xl font-black text-charcoal-900 dark:text-white mt-0.5">
                    {subHours > 0 ? `${subHours} ঘণ্টা ` : ''}{subMins} মিনিট
                  </div>
                  <div className="text-xs text-charcoal-500 dark:text-slate-400 mt-0.5">
                    মোট {subjectSessions.length} টি সেশন রেকর্ড করা হয়েছে
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    onClick={handleStartSubjectTimer}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-black bg-lavender-400 hover:bg-lavender-500 text-charcoal-900 transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-charcoal-900" />
                    <span>টাইমার শুরু</span>
                  </button>
                  <button
                    onClick={() => setIsLoggingManual(!isLoggingManual)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-charcoal-700 border border-[#E8E5ED] dark:border-charcoal-600 text-charcoal-700 dark:text-slate-200 hover:bg-[#F2EDF8] transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isLoggingManual ? 'ফর্ম লুকান' : 'পড়া যোগ'}</span>
                  </button>
                </div>
              </div>

              {/* Manual Logging Form */}
              {isLoggingManual && (
                <form onSubmit={handleAddManualSession} className="mb-4 p-3.5 rounded-2xl bg-lavender-50/60 dark:bg-lavender-950/20 border border-lavender-200 dark:border-lavender-900/40 space-y-2.5 shrink-0 animate-in fade-in">
                  <div className="text-xs font-black text-charcoal-900 dark:text-lavender-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-lavender-500" />
                    <span>অফলাইন পড়া রেকর্ড করুন (ম্যানুয়াল সেশন)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="5"
                      step="5"
                      value={manualDuration}
                      onChange={(e) => setManualDuration(Math.max(1, Number(e.target.value)))}
                      className="w-24 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
                      placeholder="মিনিট"
                    />
                    <div className="flex items-center gap-1 flex-wrap">
                      {[15, 25, 30, 45, 60, 90].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setManualDuration(m)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition ${
                            manualDuration === m 
                              ? 'bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900' 
                              : 'bg-white dark:bg-charcoal-800 text-charcoal-700 dark:text-slate-300'
                          }`}
                        >
                          {m}মি
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="পড়ার নোট (যেমন: ৩য় অধ্যায়ের প্রশ্ন সমাধান)"
                    className="w-full px-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-charcoal-800 text-charcoal-900 dark:text-white"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsLoggingManual(false)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold text-charcoal-500 hover:text-charcoal-800 cursor-pointer"
                    >
                      বাতিল
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-full text-xs font-black bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 shadow-xs cursor-pointer active:scale-95"
                    >
                      সংরক্ষণ করুন
                    </button>
                  </div>
                </form>
              )}

              {/* Sessions List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-0">
                <div className="text-xs font-black uppercase tracking-wider text-charcoal-400 dark:text-slate-400 mb-2">
                  সেশনের সময় ও তারিখের তালিকা ({subjectSessions.length})
                </div>

                {subjectSessions.length > 0 ? (
                  subjectSessions.map((sess) => {
                    const dateObj = new Date(sess.completed_at);
                    const formattedDate = dateObj.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });
                    const formattedTime = dateObj.toLocaleTimeString(language === 'bn' ? 'bn-BD' : 'en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={sess.id}
                        className="p-3.5 rounded-2xl bg-white dark:bg-charcoal-800 border border-[#E8E5ED] dark:border-charcoal-700 flex items-center justify-between gap-3 shadow-2xs hover:border-lavender-300 transition"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                            sess.session_type === 'pomodoro' 
                              ? 'bg-lavender-100 text-lavender-700 dark:bg-lavender-950 dark:text-lavender-300' 
                              : 'bg-mint-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                          }`}>
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black text-charcoal-900 dark:text-white">
                                {sess.duration_minutes} মিনিট পড়াশোনা
                              </span>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                sess.session_type === 'pomodoro'
                                  ? 'bg-[#F2EDF8] text-lavender-800 dark:bg-lavender-900/60 dark:text-lavender-200'
                                  : 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}>
                                {sess.session_type === 'pomodoro' ? 'পোমোডোরো' : 'ম্যানুয়াল রেকর্ড'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-charcoal-500 dark:text-slate-400">
                              <Calendar className="w-3 h-3" />
                              <span>{formattedDate}</span>
                              <span>•</span>
                              <span>{formattedTime}</span>
                            </div>
                            {sess.notes && (
                              <p className="text-xs text-charcoal-600 dark:text-slate-300 mt-1 line-clamp-1 italic">
                                "{sess.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-10 text-center text-charcoal-400 dark:text-slate-500 border border-dashed border-[#E8E5ED] dark:border-charcoal-700 rounded-2xl p-6">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-bold text-charcoal-700 dark:text-slate-300">
                      এই বিষয়ে এখনো কোনো পড়ার রেকর্ড নেই
                    </p>
                    <p className="text-[11px] text-charcoal-400 dark:text-slate-500 mt-1 max-w-xs mx-auto">
                      পোমোডোরো টাইমার চালিয়ে এই বিষয়টি নির্বাচন করুন অথবা উপরের "+ পড়া যোগ" বাটনে ক্লিক করে অফলাইন পড়া রেকর্ড করুন।
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
