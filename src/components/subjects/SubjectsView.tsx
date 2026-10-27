import React, { useState, useMemo } from 'react';
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
  Palette 
} from 'lucide-react';

const PRESET_COLORS = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
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
    t 
  } = useApp();

  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [deleteConfirmSubject, setDeleteConfirmSubject] = useState<Subject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {t.subjects.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.subjects.subtitle}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="self-start sm:self-auto flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition cursor-pointer"
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

                {/* Subject Statistics Footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                    <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                    <span>{stats.taskCount} টি টাস্ক</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 justify-end">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {hours > 0 ? `${hours}ঘ ` : ''}{mins}মি পড়া
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-800 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
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
            className="mt-5 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.subjects.addSubject}</span>
          </button>
        </div>
      )}

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingSubject ? t.subjects.editSubject : t.subjects.addSubject}
            </h3>

            {formError && (
              <p className="text-xs text-rose-500 mb-3 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg">
                {formError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.subjects.subjectName} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.subjects.subjectNamePlaceholder}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t.subjects.color}</span>
                </label>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                        color === c ? 'scale-125 ring-2 ring-offset-2 ring-emerald-500' : 'hover:scale-110'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.subjects.description}
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="যেমন: ১ম পত্র অধ্যায় ১-৪ রিভিশন ও বোর্ড প্রশ্ন সলভ"
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
      {deleteConfirmSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.subjects.deleteSubject}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              "{deleteConfirmSubject.name}" {t.subjects.confirmDelete}
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmSubject(null)}
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
