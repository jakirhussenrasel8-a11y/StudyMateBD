import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Exam } from '../../types';
import { 
  Award, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Edit2, 
  Trash2, 
  X, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { getTodayDateString } from '../../lib/storage';

interface ExamsViewProps {
  onOpenCreate: () => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({ onOpenCreate }) => {
  const { 
    exams, 
    subjects, 
    addExam, 
    updateExam, 
    deleteExam, 
    t 
  } = useApp();

  const todayStr = getTodayDateString();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [deleteConfirmExam, setDeleteConfirmExam] = useState<Exam | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [examDate, setExamDate] = useState(todayStr);
  const [examTime, setExamTime] = useState('10:00');
  const [roomLocation, setRoomLocation] = useState('');
  const [totalMarks, setTotalMarks] = useState<number | ''>(100);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subjectMap = useMemo(() => {
    const map = new Map<string, typeof subjects[0]>();
    subjects.forEach(s => map.set(s.id, s));
    return map;
  }, [subjects]);

  const handleOpenCreate = () => {
    setEditingExam(null);
    setTitle('');
    setSubjectId(subjects[0]?.id || '');
    setExamDate(todayStr);
    setExamTime('10:00');
    setRoomLocation('');
    setTotalMarks(100);
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setSubjectId(exam.subject_id);
    setExamDate(exam.exam_date);
    setExamTime(exam.exam_time || '');
    setRoomLocation(exam.room_or_location || '');
    setTotalMarks(exam.total_marks ?? '');
    setNotes(exam.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('পরীক্ষার নাম পূরণ করা আবশ্যক।');
      return;
    }
    if (!subjectId) {
      setFormError('অনুগ্রহ করে পরীক্ষার বিষয় নির্বাচন করুন।');
      return;
    }
    if (!examDate) {
      setFormError('পরীক্ষার তারিখ নির্বাচন করুন।');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingExam) {
        const ok = await updateExam(editingExam.id, {
          title: title.trim(),
          subject_id: subjectId,
          exam_date: examDate,
          exam_time: examTime || undefined,
          room_or_location: roomLocation.trim() || undefined,
          total_marks: totalMarks === '' ? undefined : Number(totalMarks),
          notes: notes.trim() || undefined,
        });
        if (ok) setIsModalOpen(false);
      } else {
        const ok = await addExam({
          title: title.trim(),
          subject_id: subjectId,
          exam_date: examDate,
          exam_time: examTime || undefined,
          room_or_location: roomLocation.trim() || undefined,
          total_marks: totalMarks === '' ? undefined : Number(totalMarks),
          notes: notes.trim() || undefined,
        });
        if (ok) setIsModalOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmExam) return;
    setIsSubmitting(true);
    try {
      await deleteExam(deleteConfirmExam.id);
      setDeleteConfirmExam(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Accurate calendar day difference calculation
  const getDaysDiff = (targetDateStr: string) => {
    const today = new Date(todayStr + 'T00:00:00');
    const target = new Date(targetDateStr + 'T00:00:00');
    const diffTime = target.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  };

  // Separate upcoming exams from past exams
  const { upcomingExams, pastExams } = useMemo(() => {
    const upcoming: Exam[] = [];
    const past: Exam[] = [];

    exams.forEach(exam => {
      const days = getDaysDiff(exam.exam_date);
      if (days >= 0) {
        upcoming.push(exam);
      } else {
        past.push(exam);
      }
    });

    upcoming.sort((a, b) => a.exam_date.localeCompare(b.exam_date));
    past.sort((a, b) => b.exam_date.localeCompare(a.exam_date));

    return { upcomingExams: upcoming, pastExams: past };
  }, [exams, todayStr]);

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {t.exams.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.exams.subtitle}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="self-start sm:self-auto flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.exams.addExam}</span>
        </button>
      </div>

      {/* Upcoming Exams Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {t.exams.upcomingExams} ({upcomingExams.length})
          </h3>
        </div>

        {upcomingExams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingExams.map((exam) => {
              const daysDiff = getDaysDiff(exam.exam_date);
              const isToday = daysDiff === 0;
              const subject = subjectMap.get(exam.subject_id);

              return (
                <div
                  key={exam.id}
                  className={`rounded-2xl border p-5 shadow-2xs transition flex flex-col justify-between relative overflow-hidden ${
                    isToday
                      ? 'bg-gradient-to-br from-rose-50 to-amber-50/40 dark:from-rose-950/40 dark:to-slate-900 border-rose-300 dark:border-rose-900/60 ring-2 ring-rose-500/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div>
                    {/* Top row: Subject color dot & Actions */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: subject?.color || '#10b981' }}
                        />
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          {subject?.name || 'সাধারণ বিষয়'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(exam)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmExam(exam)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 dark:text-white line-clamp-1">
                      {exam.title}
                    </h4>

                    {exam.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {exam.notes}
                      </p>
                    )}
                  </div>

                  {/* Countdown Highlight & Info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{exam.exam_date}</span>
                        {exam.exam_time && <span>({exam.exam_time})</span>}
                      </div>
                      {exam.room_or_location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="line-clamp-1">{exam.room_or_location}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      {isToday ? (
                        <div className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 animate-pulse">
                          {t.exams.examToday}
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs">
                          <span className="text-base">{daysDiff}</span> {t.exams.daysLeft}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-dashed border-slate-300 dark:border-slate-800 max-w-lg mx-auto">
            <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
              {t.exams.noExams}
            </p>
            <button
              onClick={handleOpenCreate}
              className="mt-3 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              + পরীক্ষার তারিখ যুক্ত করুন
            </button>
          </div>
        )}
      </div>

      {/* Past Exams Section */}
      {pastExams.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-sm text-slate-500 dark:text-slate-400">
              {t.exams.pastExams} ({pastExams.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 opacity-60 hover:opacity-100 transition">
            {pastExams.map((exam) => {
              const subject = subjectMap.get(exam.subject_id);
              return (
                <div
                  key={exam.id}
                  className="bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {exam.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {subject?.name} • সম্পন্ন: {exam.exam_date}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] font-semibold text-slate-400 mr-2">
                      {t.exams.passed}
                    </span>
                    <button
                      onClick={() => setDeleteConfirmExam(exam)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add / Edit Exam Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingExam ? t.exams.editExam : t.exams.addExam}
            </h3>

            {formError && (
              <p className="text-xs text-rose-500 mb-3 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg">
                {formError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.exams.examTitle} *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.exams.examTitlePlaceholder}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বিষয় *
                </label>
                <select
                  required
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- বিষয় নির্বাচন করুন --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.exams.examDate} *
                  </label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.exams.examTime}
                  </label>
                  <input
                    type="time"
                    value={examTime}
                    onChange={(e) => setExamTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.exams.roomLocation}
                  </label>
                  <input
                    type="text"
                    value={roomLocation}
                    onChange={(e) => setRoomLocation(e.target.value)}
                    placeholder="রুম ২০৪"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.exams.totalMarks}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="100"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.exams.notes}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="সিলেবাস, গুরুত্বপূর্ণ অধ্যায় ও অন্যান্য তথ্য..."
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? t.common.loading : t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.exams.deleteExam}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              "{deleteConfirmExam.title}" পরীক্ষার তথ্য মুছে ফেলতে চান?
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmExam(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition cursor-pointer"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 transition shadow-xs cursor-pointer"
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
