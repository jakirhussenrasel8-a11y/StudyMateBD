import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { StudyRoutine, DayOfWeek } from '../../types';
import { 
  CalendarDays, 
  Plus, 
  Clock, 
  AlertTriangle, 
  Edit2, 
  Trash2, 
  X, 
  BookOpen,
  ArrowLeft 
} from 'lucide-react';
import { formatTime12h } from '../../lib/timeFormat';

interface RoutineViewProps {
  onOpenCreate: () => void;
}

export const RoutineView: React.FC<RoutineViewProps> = ({ onOpenCreate }) => {
  const { 
    routines, 
    subjects, 
    addRoutine, 
    updateRoutine, 
    deleteRoutine, 
    t,
    goBack,
    canGoBack,
    registerModal 
  } = useApp();

  // Selected Day Filter (0 = Saturday, 1 = Sunday ... 6 = Friday)
  // Default to today's day of week
  const initialDayIndex = useMemo(() => {
    const jsDay = new Date().getDay();
    return (jsDay === 6 ? 0 : jsDay + 1) as DayOfWeek;
  }, []);

  const [activeDay, setActiveDay] = useState<DayOfWeek>(initialDayIndex);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<StudyRoutine | null>(null);
  const [deleteConfirmRoutine, setDeleteConfirmRoutine] = useState<StudyRoutine | null>(null);

  useEffect(() => {
    if (isModalOpen) {
      const unregister = registerModal('routine-modal');
      return unregister;
    }
  }, [isModalOpen, registerModal]);

  useEffect(() => {
    if (deleteConfirmRoutine) {
      const unregister = registerModal('delete-routine-modal');
      return unregister;
    }
  }, [deleteConfirmRoutine, registerModal]);

  // Form Fields
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(activeDay);
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('19:30');
  const [subjectId, setSubjectId] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [collisionWarning, setCollisionWarning] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjectMap = useMemo(() => {
    const map = new Map<string, typeof subjects[0]>();
    subjects.forEach(s => map.set(s.id, s));
    return map;
  }, [subjects]);

  // Check collision/overlap between two time ranges (HH:mm)
  const checkOverlap = (
    day: DayOfWeek, 
    start: string, 
    end: string, 
    excludeId?: string
  ): boolean => {
    const startMins = timeToMinutes(start);
    const endMins = timeToMinutes(end);
    if (endMins <= startMins) return false;

    return routines.some(r => {
      if (r.id === excludeId) return false;
      if (r.day_of_week !== day) return false;

      const rStart = timeToMinutes(r.start_time);
      const rEnd = timeToMinutes(r.end_time);

      // Overlap condition: max(start, rStart) < min(end, rEnd)
      return Math.max(startMins, rStart) < Math.min(endMins, rEnd);
    });
  };

  const timeToMinutes = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Re-check collision when form inputs change
  const handleTimeChange = (start: string, end: string, day: DayOfWeek) => {
    setStartTime(start);
    setEndTime(end);
    setDayOfWeek(day);

    if (start && end && start >= end) {
      setFormError('শেষের সময় অবশ্যই শুরুর সময়ের চেয়ে বেশি হতে হবে।');
      setCollisionWarning('');
      return;
    } else {
      setFormError('');
    }

    if (start && end && start < end) {
      const hasOverlap = checkOverlap(day, start, end, editingRoutine?.id);
      if (hasOverlap) {
        setCollisionWarning(t.routine.collisionWarning);
      } else {
        setCollisionWarning('');
      }
    }
  };

  const handleOpenCreate = () => {
    setEditingRoutine(null);
    setDayOfWeek(activeDay);
    setStartTime('18:00');
    setEndTime('19:30');
    setSubjectId(subjects[0]?.id || '');
    setNotes('');
    setFormError('');
    setCollisionWarning('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (routine: StudyRoutine) => {
    setEditingRoutine(routine);
    setDayOfWeek(routine.day_of_week);
    setStartTime(routine.start_time);
    setEndTime(routine.end_time);
    setSubjectId(routine.subject_id);
    setNotes(routine.notes || '');
    setFormError('');
    setCollisionWarning('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectId) {
      setFormError('অনুগ্রহ করে একটি বিষয় নির্বাচন করুন।');
      return;
    }
    if (startTime >= endTime) {
      setFormError('শেষের সময় অবশ্যই শুরুর সময়ের পরে হতে হবে।');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingRoutine) {
        const ok = await updateRoutine(editingRoutine.id, {
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          subject_id: subjectId,
          notes: notes.trim() || undefined,
        });
        if (ok) setIsModalOpen(false);
      } else {
        const ok = await addRoutine({
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          subject_id: subjectId,
          notes: notes.trim() || undefined,
        });
        if (ok) setIsModalOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmRoutine) return;
    setIsSubmitting(true);
    try {
      await deleteRoutine(deleteConfirmRoutine.id);
      setDeleteConfirmRoutine(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group routines by active day
  const activeDayRoutines = useMemo(() => {
    return routines
      .filter(r => r.day_of_week === activeDay)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  }, [routines, activeDay]);

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in max-w-5xl mx-auto">
      {/* Header and Add Button with Back button */}
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
              {t.routine.title}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 dark:text-slate-400 mt-0.5">
              {t.routine.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="self-start sm:self-auto flex items-center gap-2 bg-charcoal-900 hover:bg-black text-white dark:bg-white dark:text-charcoal-900 px-5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.routine.addSession}</span>
        </button>
      </div>

      {/* Weekday Switcher Bar (Bangladeshi 7 days) */}
      <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-2.5 border border-[#E8E5ED] dark:border-charcoal-800 shadow-xs">
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {t.routine.shortDayNames.map((dayName, idx) => {
            const isSelected = activeDay === idx;
            const slotCount = routines.filter(r => r.day_of_week === idx).length;
            const isToday = initialDayIndex === idx;

            return (
              <button
                key={idx}
                onClick={() => setActiveDay(idx as DayOfWeek)}
                className={`flex flex-col items-center justify-center py-2.5 sm:py-3 rounded-2xl transition cursor-pointer select-none active:scale-95 ${
                  isSelected
                    ? 'bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 font-black shadow-xs'
                    : 'hover:bg-[#F2EDF8] dark:hover:bg-charcoal-800 text-charcoal-700 dark:text-slate-300'
                }`}
              >
                <span className="text-xs sm:text-sm font-extrabold">{dayName}</span>
                <div className="flex items-center gap-1 mt-1">
                  {slotCount > 0 && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-lavender-400 text-charcoal-900' : 'bg-[#F2EDF8] dark:bg-charcoal-800 text-charcoal-600 dark:text-slate-400'
                    }`}>
                      {slotCount}
                    </span>
                  )}
                  {isToday && (
                    <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-rose-500'}`} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Routine Slots List for the Active Day */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">
            {t.routine.dayNames[activeDay]} এর পড়ার সময়সূচি
          </h3>
          <span className="text-xs text-slate-500">
            মোট {activeDayRoutines.length} টি সেশন
          </span>
        </div>

        {activeDayRoutines.length > 0 ? (
          <div className="space-y-3">
            {activeDayRoutines.map((routine, idx) => {
              const subject = subjectMap.get(routine.subject_id);
              // Calculate duration in minutes
              const durationMins = timeToMinutes(routine.end_time) - timeToMinutes(routine.start_time);
              const hours = Math.floor(durationMins / 60);
              const mins = durationMins % 60;

              return (
                <div
                  key={routine.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-2xs hover:shadow-md transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    {/* Time Badge with 12h format */}
                    <div className="flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-center min-w-[85px] sm:min-w-[105px]">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatTime12h(routine.start_time, 'bn')}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">থেকে</span>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {formatTime12h(routine.end_time, 'bn')}
                      </span>
                    </div>

                    {/* Subject info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: subject?.color || '#10b981' }} 
                        />
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                          {subject?.name || 'বিষয় নির্ধারিত নেই'}
                        </h4>
                      </div>

                      {routine.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                          {routine.notes}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>
                            {hours > 0 ? `${hours} ঘণ্টা ` : ''}{mins} মিনিট
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleOpenEdit(routine)}
                      title={t.common.edit}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmRoutine(routine)}
                      title={t.common.delete}
                      className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-rose-200 dark:border-rose-900/40 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <CalendarDays className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.routine.noRoutineForDay}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {t.routine.dayNames[activeDay]} এর জন্য একটি নতুন পড়ার স্লট ঠিক করুন
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-rose-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.routine.addSession}</span>
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Routine Modal (Mobile Bottom-Sheet) */}
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
                {editingRoutine ? t.routine.editSession : t.routine.addSession}
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

            {collisionWarning && (
              <div className="my-2 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2 shrink-0">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <p>{collisionWarning}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="overflow-y-auto pr-1 pt-3 space-y-3.5 flex-1 touch-manipulation">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.routine.dayOfWeek} *
                </label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => handleTimeChange(startTime, endTime, Number(e.target.value) as DayOfWeek)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[44px]"
                >
                  {t.routine.dayNames.map((name, idx) => (
                    <option key={idx} value={idx}>{name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বিষয় *
                </label>
                <select
                  required
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[44px]"
                >
                  <option value="">-- বিষয় নির্বাচন করুন --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.routine.startTime} *
                  </label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => handleTimeChange(e.target.value, endTime, dayOfWeek)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.routine.endTime} *
                  </label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => handleTimeChange(startTime, e.target.value, dayOfWeek)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.routine.notes} (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="যেমন: ৩য় অধ্যায় রিভিশন ও সৃজনশীল প্র্যাকটিস"
                  className="w-full px-3.5 py-2 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[44px]"
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
                  className="flex-1 sm:flex-initial px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl shadow-md shadow-rose-500/20 transition disabled:opacity-50 cursor-pointer min-h-[44px] flex items-center justify-center active:scale-98"
                >
                  {isSubmitting ? t.common.loading : t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Mobile Bottom-Sheet) */}
      {deleteConfirmRoutine && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDeleteConfirmRoutine(null)}
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
              {t.routine.deleteSession}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              আপনি কি নিশ্চিতভাবে এই রুটিন স্লটটি মুছে ফেলতে চান?
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmRoutine(null)}
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
    </div>
  );
};
