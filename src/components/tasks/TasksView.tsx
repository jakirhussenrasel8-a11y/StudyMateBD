import React, { useState, useMemo, useEffect } from 'react';
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
  ArrowUpDown,
  ArrowLeft,
  Play 
} from 'lucide-react';
import { getTodayDateString } from '../../lib/storage';
import { formatTime12h } from '../../lib/timeFormat';

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
    language,
    startTaskTimer,
    activeTimerTaskId,
    timerIsRunning,
    t,
    goBack,
    canGoBack,
    registerModal 
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

  useEffect(() => {
    if (isModalOpen) {
      const unregister = registerModal('task-modal');
      return unregister;
    }
  }, [isModalOpen, registerModal]);

  useEffect(() => {
    if (deleteConfirmTask) {
      const unregister = registerModal('delete-task-modal');
      return unregister;
    }
  }, [deleteConfirmTask, registerModal]);

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
    high: { text: t.tasks.priorityHigh, color: 'bg-[#FFE49A] text-charcoal-900 border border-[#FFE49A]' },
    medium: { text: t.tasks.priorityMedium, color: 'bg-lavender-100 text-charcoal-900 dark:bg-charcoal-800 dark:text-lavender-200 border border-lavender-200' },
    low: { text: t.tasks.priorityLow, color: 'bg-[#E6F4F1] text-charcoal-900 dark:bg-charcoal-800 dark:text-pastelMint-200 border border-pastelMint-200' },
  };

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
              {t.tasks.title}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 dark:text-slate-400 mt-0.5">
              {t.tasks.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="self-start sm:self-auto flex items-center gap-2 bg-charcoal-900 hover:bg-black text-white dark:bg-white dark:text-charcoal-900 px-5 py-2.5 rounded-full font-black text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{t.tasks.addTask}</span>
        </button>
      </div>

      {/* Filter and Search Bar with Pastel Styling */}
      <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-5 border border-[#E8E5ED] dark:border-charcoal-800 shadow-xs space-y-3.5">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.tasks.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 text-sm font-semibold rounded-2xl border border-[#E8E5ED] dark:border-charcoal-700 bg-[#F8F7FA] dark:bg-charcoal-800 text-charcoal-900 dark:text-white placeholder:text-charcoal-400 focus:outline-hidden focus:ring-2 focus:ring-lavender-400"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
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
                className={`px-3.5 py-1.5 rounded-full font-black shrink-0 transition cursor-pointer ${
                  isActive
                    ? 'bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900 shadow-xs'
                    : 'bg-[#F2EDF8] dark:bg-charcoal-800 text-charcoal-700 dark:text-slate-300 hover:bg-lavender-200'
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
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
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
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
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
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
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
                        ? 'bg-rose-500 border-rose-500 text-white' 
                        : 'border-slate-300 dark:border-slate-600 hover:border-rose-500'
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
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 dark:bg-pink-950/70 dark:text-pink-300">
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
                        {task.due_time && <span>({formatTime12h(task.due_time, language)})</span>}
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
                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {/* Dedicated Countdown Start Button */}
                  {!isCompleted && (
                    <button
                      onClick={() => startTaskTimer(task)}
                      title={language === 'bn' ? 'এই টাস্কের কাউন্টডাউন টাইমার শুরু করুন' : 'Start countdown timer for this task'}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition shadow-xs cursor-pointer active:scale-95 ${
                        activeTimerTaskId === task.id && timerIsRunning
                          ? 'bg-amber-300 text-charcoal-900 border border-amber-400 animate-pulse'
                          : 'bg-lavender-400 hover:bg-lavender-500 text-charcoal-900 border border-lavender-300'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-charcoal-900" />
                      <span>
                        {activeTimerTaskId === task.id && timerIsRunning
                          ? (language === 'bn' ? 'চলছে...' : 'Running...')
                          : (language === 'bn' ? 'শুরু' : 'Start')}
                      </span>
                      {task.estimated_minutes ? (
                        <span className="text-[10px] font-bold opacity-80">
                          ({task.estimated_minutes}মি)
                        </span>
                      ) : null}
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenEdit(task)}
                    title={t.common.edit}
                    className="p-1.5 text-slate-400 hover:text-charcoal-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-10 text-center border border-dashed border-rose-200 dark:border-rose-900/40 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto mb-4">
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
            className="mt-5 inline-flex items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition shadow-md shadow-rose-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.tasks.addTask}</span>
          </button>
        </div>
      )}

      {/* Add / Edit Task Modal (Mobile Bottom-Sheet on small screens) */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-rose-100/60 dark:border-slate-800 p-5 sm:p-6 relative max-h-[92vh] flex flex-col animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Mobile Sheet Drag Indicator */}
            <div className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-3 sm:hidden shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                {editingTask ? t.tasks.editTask : t.tasks.addTask}
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
                  {t.tasks.taskTitle} *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t.tasks.taskTitlePlaceholder}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[44px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {t.tasks.subject}
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[44px]"
                >
                  <option value="">{t.tasks.noSubject}</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.tasks.dueDate} *
                  </label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.tasks.dueTime}
                  </label>
                  <input
                    type="time"
                    value={dueTime}
                    onChange={(e) => setDueTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[44px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.tasks.priority}
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[44px]"
                  >
                    <option value="high">{t.tasks.priorityHigh}</option>
                    <option value="medium">{t.tasks.priorityMedium}</option>
                    <option value="low">{t.tasks.priorityLow}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.tasks.status}
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 min-h-[44px]"
                  >
                    <option value="pending">{t.tasks.statusPending}</option>
                    <option value="in_progress">{t.tasks.statusInProgress}</option>
                    <option value="completed">{t.tasks.statusCompleted}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.tasks.estimatedMinutes} (কাউন্টডাউন)
                  </label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={estimatedMinutes}
                    onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-lavender-400 min-h-[44px]"
                  />
                  {/* Quick Countdown Format Pills */}
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    {[15, 25, 30, 45, 60, 90].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => setEstimatedMinutes(mins)}
                        className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition cursor-pointer ${
                          estimatedMinutes === mins
                            ? 'bg-charcoal-900 text-white dark:bg-white dark:text-charcoal-900'
                            : 'bg-[#F2EDF8] text-charcoal-700 dark:bg-charcoal-800 dark:text-slate-300 hover:bg-lavender-200'
                        }`}
                      >
                        {mins}মি
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বিবরণ বা নোট (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="যেমন: ৩য় অধ্যায়ের বোর্ড প্রশ্ন সলভ করা ও উত্তর মিলিয়ে দেখা"
                  className="w-full px-3.5 py-2 text-base sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
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

      {/* Delete Confirmation Modal (Mobile Bottom-Sheet on small screens) */}
      {deleteConfirmTask && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setDeleteConfirmTask(null)}
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
              {t.tasks.deleteTask}?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              "{deleteConfirmTask.title}" {t.subjects.confirmDelete}
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setDeleteConfirmTask(null)}
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
