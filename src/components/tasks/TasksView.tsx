import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, Priority, TaskStatus } from '../../types';
import { 
  CheckSquare, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertCircle, 
  Check, 
  Edit2, 
  Trash2, 
  X,
  ArrowUpDown 
} from 'lucide-react';
import { getTodayDateString } from '../../lib/storage';

interface TasksViewProps {
  onOpenCreate: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onOpenCreate }) => {
  const { 
    tasks, 
    subjects, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskCompletion, 
    t 
  } = useApp();

  const todayStr = getTodayDateString();

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'today' | 'pending' | 'completed' | 'overdue'>('all');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'due_date' | 'priority' | 'created_at'>('due_date');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [dueDate, setDueDate] = useState(todayStr);
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [status, setStatus] = useState<TaskStatus>('pending');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(30);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Subject quick map
  const subjectMap = useMemo(() => {
    const map = new Map<string, typeof subjects[0]>();
    subjects.forEach(s => map.set(s.id, s));
    return map;
  }, [subjects]);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setSubjectId(subjects[0]?.id || '');
    setDueDate(todayStr);
    setDueTime('20:00');
    setPriority('medium');
    setStatus('pending');
    setEstimatedMinutes(30);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setSubjectId(task.subject_id || '');
    setDueDate(task.due_date);
    setDueTime(task.due_time || '');
    setPriority(task.priority);
    setStatus(task.status);
    setEstimatedMinutes(task.estimated_minutes || 30);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError(t.common.requiredField);
      return;
    }
    if (!dueDate) {
      setFormError('জমার তারিখ নির্বাচন করুন');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      if (editingTask) {
        const ok = await updateTask(editingTask.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          subject_id: subjectId || undefined,
          due_date: dueDate,
          due_time: dueTime || undefined,
          priority,
          status,
          estimated_minutes: estimatedMinutes,
        });
        if (ok) setIsModalOpen(false);
      } else {
        const ok = await addTask({
          title: title.trim(),
          description: description.trim() || undefined,
          subject_id: subjectId || undefined,
          due_date: dueDate,
          due_time: dueTime || undefined,
          priority,
          status,
          estimated_minutes: estimatedMinutes,
        });
        if (ok) setIsModalOpen(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmTask) return;
    setIsSubmitting(true);
    try {
      await deleteTask(deleteConfirmTask.id);
      setDeleteConfirmTask(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered & Sorted Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q) ?? false;
        if (!matchTitle && !matchDesc) return false;
      }

      // Subject
      if (selectedSubjectId !== 'all' && task.subject_id !== selectedSubjectId) {
        return false;
      }

      // Priority
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      // Status
      if (statusFilter === 'today') {
        return task.due_date === todayStr && task.status !== 'completed';
      }
      if (statusFilter === 'pending') {
        return task.status !== 'completed';
      }
      if (statusFilter === 'completed') {
        return task.status === 'completed';
      }
      if (statusFilter === 'overdue') {
        return task.due_date < todayStr && task.status !== 'completed';
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'due_date') {
        return a.due_date.localeCompare(b.due_date);
      }
      if (sortBy === 'priority') {
        const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
      return b.created_at.localeCompare(a.created_at);
    });
  }, [tasks, searchQuery, selectedSubjectId, selectedPriority, statusFilter, sortBy, todayStr]);

  const priorityLabels = {
    high: { text: t.tasks.priorityHigh, color: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
    medium: { text: t.tasks.priorityMedium, color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    low: { text: t.tasks.priorityLow, color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 animate-in fade-in">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {t.tasks.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {t.tasks.subtitle}
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="self-start sm:self-auto flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{t.tasks.addTask}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.tasks.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: t.tasks.filterAll },
            { id: 'today', label: t.tasks.filterToday },
            { id: 'pending', label: t.tasks.filterPending },
            { id: 'overdue', label: t.tasks.filterOverdue },
            { id: 'completed', label: t.tasks.filterCompleted },
          ].map(({ id, label }) => {
            const isActive = statusFilter === id;
            return (
              <button
                key={id}
                onClick={() => setStatusFilter(id as any)}
                className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Dropdowns for Subject, Priority, Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Subject Filter */}
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">সব বিষয় (All Subjects)</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">সব গুরুত্ব (All Priorities)</option>
            <option value="high">{t.tasks.priorityHigh}</option>
            <option value="medium">{t.tasks.priorityMedium}</option>
            <option value="low">{t.tasks.priorityLow}</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="due_date">জমার তারিখ অনুসারে (By Deadline)</option>
            <option value="priority">গুরুত্ব অনুসারে (By Priority)</option>
            <option value="created_at">তৈরির সময় অনুসারে (By Created)</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => {
            const subject = task.subject_id ? subjectMap.get(task.subject_id) : undefined;
            const isCompleted = task.status === 'completed';
            const isOverdue = task.due_date < todayStr && !isCompleted;
            const isToday = task.due_date === todayStr && !isCompleted;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCompleted 
                    ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60' 
                    : isOverdue 
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 shadow-2xs' 
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Completion Checkbox */}
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    title={isCompleted ? t.tasks.markPending : t.tasks.markComplete}
                    className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition cursor-pointer shrink-0 ${
                      isCompleted 
                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                        : 'border-slate-300 dark:border-slate-600 hover:border-emerald-500'
                    }`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {task.title}
                      </h4>

                      {/* Badges */}
                      {isOverdue && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          {t.tasks.overdueBadge}
                        </span>
                      )}

                      {isToday && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          {t.tasks.dueTodayBadge}
                        </span>
                      )}

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityLabels[task.priority].color}`}>
                        {priorityLabels[task.priority].text}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata line */}
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      {subject && (
                        <span 
                          className="font-semibold flex items-center gap-1"
                          style={{ color: subject.color }}
                        >
                          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: subject.color }} />
                          {subject.name}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{task.due_date}</span>
                        {task.due_time && <span>({task.due_time})</span>}
                      </span>

                      {task.estimated_minutes && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>~{task.estimated_minutes} {t.dashboard.minutes}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                  <button
                    onClick={() => handleOpenEdit(task)}
                    title={t.common.edit}
                    className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmTask(task)}
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-slate-300 dark:border-slate-800 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {t.tasks.noTasksFound}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            নতুন পড়ার কাজ যুক্ত করতে নিচের বাটনে চাপ দিন
          </p>
          <button
            onClick={handleOpenCreate}
            className="mt-5 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.tasks.addTask}</span>
          </button>
        </div>
      )}

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in overflow-y-auto">
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
              {editingTask ? t.tasks.editTask : t.tasks.addTask}
            </h3>

            {formError && (
              <p className="text-xs text-rose-500 mb-3 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg">
                {formError}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.tasks.taskTitle} *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.tasks.taskTitlePlaceholder}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.tasks.subject}
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">{t.tasks.noSubject}</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.tasks.dueDate} *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.tasks.dueTime}
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.tasks.priority}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="high">{t.tasks.priorityHigh}</option>
                    <option value="medium">{t.tasks.priorityMedium}</option>
                    <option value="low">{t.tasks.priorityLow}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.tasks.status}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="pending">{t.tasks.statusPending}</option>
                    <option value="in_progress">{t.tasks.statusInProgress}</option>
                    <option value="completed">{t.tasks.statusCompleted}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {t.tasks.estimatedMinutes}
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  বিবরণ বা নোট (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="যেমন: ৩য় অধ্যায়ের বোর্ড প্রশ্ন সলভ করা ও উত্তর মিলিয়ে দেখা"
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
      {deleteConfirmTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div 
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {t.tasks.deleteTask}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              "{deleteConfirmTask.title}" {t.subjects.confirmDelete}
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmTask(null)}
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
