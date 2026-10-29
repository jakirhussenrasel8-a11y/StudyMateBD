import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Task, StudyRoutine, DayOfWeek } from '../../types';
import { 
  Printer, 
  FileDown, 
  X, 
  Calendar, 
  CheckSquare, 
  Sparkles, 
  Clock, 
  User, 
  School, 
  BookOpen, 
  SlidersHorizontal, 
  Layers, 
  FileText, 
  Check, 
  GraduationCap,
  CalendarDays,
  ListTodo,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { formatTime12h } from '../../lib/timeFormat';
import { formatDhakaDateBengali, getDhakaDateString } from '../../lib/dateUtils';
import { useDailyBengaliQuote } from '../../hooks/useDailyBengaliQuote';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialIncludeRoutine?: boolean;
  initialIncludeTasks?: boolean;
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  initialIncludeRoutine = true,
  initialIncludeTasks = true
}) => {
  const { 
    routines, 
    tasks, 
    subjects, 
    profile, 
    currentDhakaDate, 
    registerModal,
    showToast,
    t,
    language 
  } = useApp();

  const { quote: dailyQuote, author: dailyQuoteAuthor } = useDailyBengaliQuote();
  const printDocRef = useRef<HTMLDivElement>(null);

  // Settings / Filters
  const [includeRoutine, setIncludeRoutine] = useState(initialIncludeRoutine);
  const [includeTasks, setIncludeTasks] = useState(initialIncludeTasks);
  const [taskFilter, setTaskFilter] = useState<'pending' | 'today' | 'all' | 'completed'>('pending');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [pdfSuccessMessage, setPdfSuccessMessage] = useState<string | null>(null);

  // Register modal for Android back gesture
  useEffect(() => {
    if (isOpen) {
      const unregister = registerModal('export-pdf-modal');
      return unregister;
    }
  }, [isOpen, registerModal]);

  const todayStr = currentDhakaDate || getDhakaDateString();
  const studentName = profile?.full_name || 'Rasu IT';
  const studentClass = profile?.student_class || "Hon's 3rd Year";
  const studentInstitution = profile?.institution || 'Maulvibazar Govt. College';

  const subjectMap = useMemo(() => {
    const map = new Map<string, typeof subjects[0]>();
    subjects.forEach(s => map.set(s.id, s));
    return map;
  }, [subjects]);

  const dayNamesBn = [
    "শনিবার (Saturday)",
    "রবিবার (Sunday)",
    "সোমবার (Monday)",
    "মঙ্গলবার (Tuesday)",
    "বুধবার (Wednesday)",
    "বৃহস্পতিবার (Thursday)",
    "শুক্রবার (Friday)"
  ];

  const shortDayNamesBn = ["শনিবার", "রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার"];

  // Filter tasks based on selected scope
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (taskFilter === 'today') {
        return task.due_date === todayStr;
      }
      if (taskFilter === 'pending') {
        return task.status !== 'completed';
      }
      if (taskFilter === 'completed') {
        return task.status === 'completed';
      }
      return true; // 'all'
    }).sort((a, b) => {
      // Sort by due date, then priority
      if (a.due_date !== b.due_date) return a.due_date.localeCompare(b.due_date);
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return (priorityOrder[a.priority] ?? 1) - (priorityOrder[b.priority] ?? 1);
    });
  }, [tasks, taskFilter, todayStr]);

  // Routines grouped by day of week
  const groupedRoutines = useMemo(() => {
    const groups: { dayIndex: DayOfWeek; dayName: string; slots: StudyRoutine[] }[] = [];
    for (let day = 0; day <= 6; day++) {
      const slots = routines
        .filter(r => r.day_of_week === (day as DayOfWeek))
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
      groups.push({
        dayIndex: day as DayOfWeek,
        dayName: shortDayNamesBn[day],
        slots
      });
    }
    return groups;
  }, [routines]);

  // Total weekly routine duration
  const totalRoutineMinutes = useMemo(() => {
    return routines.reduce((sum, r) => {
      const [sh, sm] = r.start_time.split(':').map(Number);
      const [eh, em] = r.end_time.split(':').map(Number);
      const diff = (eh * 60 + em) - (sh * 60 + sm);
      return sum + (diff > 0 ? diff : 0);
    }, 0);
  }, [routines]);

  const routineHours = Math.floor(totalRoutineMinutes / 60);
  const routineRemainingMins = totalRoutineMinutes % 60;

  // Print using native browser print dialog (Save as PDF or Print directly)
  const handlePrint = () => {
    window.print();
  };

  // Generate downloadable PDF file via html2canvas-pro & jsPDF with smart page boundaries
  const handleDownloadPdf = async () => {
    if (!printDocRef.current) return;
    setIsGeneratingPdf(true);
    setPdfSuccessMessage(null);

    try {
      const element = printDocRef.current;
      const sanitizedName = studentName.replace(/[^a-zA-Z0-9\u0980-\u09FF]/g, '_');
      const filename = `${sanitizedName}_Study_Routine_Schedule_${todayStr}.pdf`;

      // html2canvas-pro natively supports modern CSS color functions including oklch()
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const contentWidth = pageWidth - margin * 2;
      const pagePrintableHeight = pageHeight - margin * 2;

      // Calculate maximum height per page in canvas pixel units
      const maxPageCanvasHeight = (pagePrintableHeight / contentWidth) * canvas.width;

      if (canvas.height <= maxPageCanvasHeight) {
        // Fits cleanly on a single page
        const imgData = canvas.toDataURL('image/jpeg', 0.98);
        const slicePdfHeight = (canvas.height * contentWidth) / canvas.width;
        pdf.addImage(imgData, 'JPEG', margin, margin, contentWidth, slicePdfHeight, undefined, 'FAST');
      } else {
        // Multi-page document: compute smart break points so that no table row or text element is bisected
        const containerRect = element.getBoundingClientRect();
        const scale = canvas.width / element.offsetWidth;

        // Elements that must not be cut in half horizontally
        const breakSensitiveElements = Array.from(
          element.querySelectorAll('tr, thead, h2, h3, .print-page-break-avoid, .avoid-break, .pdf-section')
        );

        const avoidBoxes = breakSensitiveElements.map(el => {
          const r = el.getBoundingClientRect();
          return {
            top: (r.top - containerRect.top) * scale,
            bottom: (r.bottom - containerRect.top) * scale,
          };
        });

        const cutPoints: number[] = [0];
        let currentY = 0;

        while (currentY < canvas.height) {
          let candidateCutY = currentY + maxPageCanvasHeight;

          if (candidateCutY >= canvas.height) {
            cutPoints.push(canvas.height);
            break;
          }

          // Check if candidateCutY cuts through any element
          let bestCutY = candidateCutY;
          for (const box of avoidBoxes) {
            if (box.top < candidateCutY && box.bottom > candidateCutY) {
              // Element is crossed by the cut line!
              // Cut safely above the element if the page still has at least 35% of content
              if (box.top - currentY > maxPageCanvasHeight * 0.35) {
                bestCutY = Math.max(currentY + 60, box.top - 6 * scale);
                break;
              }
            }
          }

          // Guard against zero progress
          if (bestCutY <= currentY + 50) {
            bestCutY = candidateCutY;
          }

          cutPoints.push(bestCutY);
          currentY = bestCutY;
        }

        const totalPages = cutPoints.length - 1;

        for (let i = 0; i < totalPages; i++) {
          const sliceTop = cutPoints[i];
          const sliceBottom = cutPoints[i + 1];
          const sliceHeight = sliceBottom - sliceTop;

          if (sliceHeight <= 0) continue;

          const sliceCanvas = document.createElement('canvas');
          sliceCanvas.width = canvas.width;
          sliceCanvas.height = sliceHeight;
          const ctx = sliceCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
            ctx.drawImage(
              canvas,
              0, sliceTop, canvas.width, sliceHeight,
              0, 0, canvas.width, sliceHeight
            );
          }

          const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.98);
          const slicePdfHeight = (sliceHeight * contentWidth) / canvas.width;

          if (i > 0) {
            pdf.addPage();
          }
          pdf.addImage(sliceData, 'JPEG', margin, margin, contentWidth, slicePdfHeight, undefined, 'FAST');
        }
      }

      pdf.save(filename);
      setPdfSuccessMessage('পিডিএফ ফাইলটি সফলভাবে ডাউনলোড হয়েছে!');
      setTimeout(() => setPdfSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Fallback: Notify and open browser print dialog
      showToast('পিডিএফ তৈরিতে ব্রাউজার প্রিন্ট ডায়ালগ ব্যবহার করা হচ্ছে...', 'info');
      window.print();
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-white dark:bg-charcoal-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-[#E8E5ED] dark:border-charcoal-800 flex flex-col max-h-[94vh] my-auto overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-[#E8E5ED] dark:border-charcoal-800 shrink-0 bg-white dark:bg-charcoal-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-lavender-400 text-charcoal-900 flex items-center justify-center font-bold shrink-0 shadow-xs">
              <Printer className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-charcoal-900 dark:text-white truncate">
                পড়ার রুটিন ও টাস্ক শিডিউল এক্সপোর্ট (Print / PDF)
              </h2>
              <p className="text-[11px] text-charcoal-500 dark:text-slate-400 truncate">
                প্রিন্ট করার জন্য A4 সাইজে সাজানো রুটিন ও পড়ার পরিকল্পনা
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-charcoal-400 hover:text-charcoal-700 dark:hover:text-white hover:bg-[#F2EDF8] dark:hover:bg-charcoal-800 transition cursor-pointer active:scale-95"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Controls Toolbar */}
        <div className="px-4 sm:px-6 py-3 bg-[#FBF9FD] dark:bg-charcoal-850 border-b border-[#E8E5ED] dark:border-charcoal-800 shrink-0 text-xs text-charcoal-700 dark:text-slate-300">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Sections to Include Checkboxes */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-extrabold text-charcoal-900 dark:text-white flex items-center gap-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-lavender-600 dark:text-lavender-400" />
                অংশসমূহ:
              </span>

              <label className="flex items-center gap-1.5 cursor-pointer select-none font-bold">
                <input
                  type="checkbox"
                  checked={includeRoutine}
                  onChange={(e) => setIncludeRoutine(e.target.checked)}
                  className="rounded text-lavender-600 focus:ring-lavender-400 h-4 w-4 cursor-pointer accent-purple-600"
                />
                <span>সাপ্তাহিক রুটিন ({routines.length})</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer select-none font-bold">
                <input
                  type="checkbox"
                  checked={includeTasks}
                  onChange={(e) => setIncludeTasks(e.target.checked)}
                  className="rounded text-lavender-600 focus:ring-lavender-400 h-4 w-4 cursor-pointer accent-purple-600"
                />
                <span>টাস্ক শিডিউল ({filteredTasks.length})</span>
              </label>
            </div>

            {/* Filters: Task Filter & Orientation */}
            <div className="flex flex-wrap items-center gap-2.5">
              {includeTasks && (
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-charcoal-600 dark:text-slate-400">টাস্ক ফিল্টার:</span>
                  <select
                    value={taskFilter}
                    onChange={(e) => setTaskFilter(e.target.value as any)}
                    className="bg-white dark:bg-charcoal-800 border border-[#E8E5ED] dark:border-charcoal-700 rounded-lg px-2 py-1 text-xs font-bold text-charcoal-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-lavender-400 cursor-pointer"
                  >
                    <option value="pending">আসন্ন ও বাকি টাস্ক</option>
                    <option value="today">আজকের টাস্ক</option>
                    <option value="all">সকল টাস্ক</option>
                    <option value="completed">সম্পন্ন টাস্ক</option>
                  </select>
                </div>
              )}

              <div className="flex items-center gap-1.5">
                <span className="font-bold text-charcoal-600 dark:text-slate-400">পেজ মোড:</span>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as any)}
                  className="bg-white dark:bg-charcoal-800 border border-[#E8E5ED] dark:border-charcoal-700 rounded-lg px-2 py-1 text-xs font-bold text-charcoal-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-lavender-400 cursor-pointer"
                >
                  <option value="portrait">পোর্ট্রেট (Portrait)</option>
                  <option value="landscape">ল্যান্ডস্কেপ (Landscape)</option>
                </select>
              </div>
            </div>
          </div>

          {pdfSuccessMessage && (
            <div className="mt-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold">{pdfSuccessMessage}</span>
            </div>
          )}
        </div>

        {/* Scrollable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-100 dark:bg-charcoal-950/80">
          <div className="max-w-3xl mx-auto">
            {/* The Actual Printable Document (Tagged for @media print and html2pdf) */}
            <div 
              ref={printDocRef}
              id="printable-schedule-document"
              className="bg-white text-slate-900 p-6 sm:p-8 rounded-xl shadow-lg border border-slate-300 space-y-6 print:shadow-none print:border-none print:p-0 print:m-0"
              style={{
                fontFamily: "'Hind Siliguri', 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              }}
            >
              {/* Document Header with Student Credentials */}
              <div className="border-b-2 border-slate-800 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  {/* Left: App Branding & Title */}
                  <div>
                    <div className="flex items-center gap-2 text-slate-900 mb-1">
                      <GraduationCap className="w-6 h-6 text-purple-700" />
                      <span className="text-xs font-black tracking-widest text-purple-800 uppercase">
                        STUDENT STUDY PLANNER • শিক্ষাসূচি
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                      সাপ্তাহিক পড়ার রুটিন ও টাস্ক শিডিউল
                    </h1>
                    <p className="text-xs text-slate-600 mt-0.5">
                      শিক্ষার্থীর ব্যক্তিগত অধ্যয়ন পরিকল্পনা ও সময় ব্যবস্থাপনা
                    </p>
                  </div>

                  {/* Right: Student Profile Card */}
                  <div className="bg-slate-50 border border-slate-300 rounded-lg p-3 text-xs min-w-[240px]">
                    <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                      <span className="font-bold text-slate-600">শিক্ষার্থী:</span>
                      <span className="font-black text-slate-900">{studentName}</span>

                      <span className="font-bold text-slate-600">শ্রেণি/বর্ষ:</span>
                      <span className="font-bold text-slate-800">{studentClass}</span>

                      <span className="font-bold text-slate-600">প্রতিষ্ঠান:</span>
                      <span className="font-medium text-slate-800 truncate" title={studentInstitution}>
                        {studentInstitution}
                      </span>

                      <span className="font-bold text-slate-600">তারিখ:</span>
                      <span className="font-medium text-slate-700">
                        {formatDhakaDateBengali(todayStr)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Motivational Quote Banner */}
                {dailyQuote && (
                  <div className="mt-3 bg-purple-50 border-l-4 border-purple-600 p-2.5 rounded-r-lg flex items-start gap-2 text-xs">
                    <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <div className="italic text-purple-950 font-medium">
                      "{dailyQuote}" — <span className="font-bold text-purple-800">{dailyQuoteAuthor}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 1. WEEKLY ROUTINE SECTION */}
              {includeRoutine && (
                <div className="pdf-section space-y-3.5 print-page-break-avoid">
                  <div className="flex items-center justify-between border-b-2 border-slate-300 pb-2">
                    <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                      <CalendarDays className="w-4 h-4 text-purple-700" />
                      সাপ্তাহিক পড়ার সময়সূচি (Weekly Study Routine)
                    </h2>
                    <span className="text-xs font-bold text-slate-600">
                      সাপ্তাহিক মোট সময়: {routineHours > 0 ? `${routineHours} ঘণ্টা ` : ''}{routineRemainingMins} মিনিট ({routines.length} টি সেশন)
                    </span>
                  </div>

                  {routines.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-slate-900 font-extrabold border-b border-slate-300">
                            <th className="py-3 px-3.5 border border-slate-300 w-24">বার (Day)</th>
                            <th className="py-3 px-3.5 border border-slate-300 w-36">সময় (Time)</th>
                            <th className="py-3 px-3.5 border border-slate-300 w-44">বিষয় (Subject)</th>
                            <th className="py-3 px-3.5 border border-slate-300 w-24 text-center">সময়কাল</th>
                            <th className="py-3 px-3.5 border border-slate-300">পড়ার বিষয় / নোট ও অধ্যায়</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedRoutines.map((group) => {
                            if (group.slots.length === 0) {
                              return (
                                <tr key={group.dayIndex} className="avoid-break print-page-break-avoid border-b border-slate-200 text-slate-500">
                                  <td className="py-3 px-3.5 border border-slate-300 font-bold bg-slate-50/70 align-top">
                                    {group.dayName}
                                  </td>
                                  <td colSpan={4} className="py-3 px-3.5 border border-slate-300 italic text-slate-500 leading-relaxed">
                                    স্বাধ্যায়, রিভিশন ও অনুশীলনের সময় (Self Study & Revision)
                                  </td>
                                </tr>
                              );
                            }

                            return group.slots.map((slot, sIdx) => {
                              const sub = subjectMap.get(slot.subject_id);
                              const [sh, sm] = slot.start_time.split(':').map(Number);
                              const [eh, em] = slot.end_time.split(':').map(Number);
                              const durationMins = (eh * 60 + em) - (sh * 60 + sm);
                              const dHours = Math.floor(durationMins / 60);
                              const dMins = durationMins % 60;

                              return (
                                <tr key={slot.id} className="avoid-break print-page-break-avoid border-b border-slate-200 hover:bg-slate-50/50">
                                  {sIdx === 0 && (
                                    <td 
                                      rowSpan={group.slots.length} 
                                      className="py-3 px-3.5 border border-slate-300 font-bold text-slate-900 bg-slate-50 align-top leading-normal"
                                    >
                                      {group.dayName}
                                      <div className="text-[10px] text-slate-500 font-normal mt-0.5">
                                        ({group.slots.length} টি সেশন)
                                      </div>
                                    </td>
                                  )}
                                  <td className="py-2.5 px-3.5 border border-slate-300 font-bold text-slate-900 whitespace-nowrap text-xs">
                                    {formatTime12h(slot.start_time, 'bn')} - {formatTime12h(slot.end_time, 'bn')}
                                  </td>
                                  <td className="py-2.5 px-3.5 border border-slate-300 font-bold text-xs text-slate-900">
                                    <div className="flex items-center gap-2">
                                      <span 
                                        className="w-2.5 h-2.5 rounded-full inline-block shrink-0 print:border print:border-slate-400"
                                        style={{ backgroundColor: sub?.color || '#6366f1' }}
                                      />
                                      <span className="truncate">{sub?.name || 'বিষয় নির্ধারিত নেই'}</span>
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3.5 border border-slate-300 text-center font-medium text-slate-700 whitespace-nowrap text-xs">
                                    {dHours > 0 ? `${dHours} ঘণ্টা ` : ''}{dMins} মি.
                                  </td>
                                  <td className="py-2.5 px-3.5 border border-slate-300 text-slate-700 text-xs leading-relaxed">
                                    {slot.notes || '—'}
                                  </td>
                                </tr>
                              );
                            });
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-5 text-center border border-dashed border-slate-300 rounded-lg text-slate-500 text-xs leading-relaxed">
                      এখনো কোনো পড়ার রুটিন যুক্ত করা হয়নি।
                    </div>
                  )}
                </div>
              )}

              {/* 2. TASK & ASSIGNMENT SCHEDULE SECTION */}
              {includeTasks && (
                <div className="pdf-section space-y-3.5 print-page-break-avoid">
                  <div className="flex items-center justify-between border-b-2 border-slate-300 pb-2">
                    <h2 className="text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                      <ListTodo className="w-4 h-4 text-purple-700" />
                      টাস্ক ও অ্যাসাইনমেন্ট তালিকা (Task Schedule Checklist)
                    </h2>
                    <span className="text-xs font-bold text-slate-600">
                      মোট {filteredTasks.length} টি টাস্ক
                    </span>
                  </div>

                  {filteredTasks.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse border border-slate-300">
                        <thead>
                          <tr className="bg-slate-100 text-slate-900 font-extrabold border-b border-slate-300">
                            <th className="py-3 px-2 border border-slate-300 w-10 text-center">চেক</th>
                            <th className="py-3 px-3.5 border border-slate-300">টাস্কের বিবরণ ও লক্ষ্য</th>
                            <th className="py-3 px-3.5 border border-slate-300 w-36">বিষয়</th>
                            <th className="py-3 px-3.5 border border-slate-300 w-28">জমার তারিখ</th>
                            <th className="py-3 px-2.5 border border-slate-300 w-20 text-center">গুরুত্ব</th>
                            <th className="py-3 px-2.5 border border-slate-300 w-20 text-center">অবস্থা</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredTasks.map((task) => {
                            const sub = task.subject_id ? subjectMap.get(task.subject_id) : null;
                            const isDone = task.status === 'completed';

                            return (
                              <tr key={task.id} className="avoid-break print-page-break-avoid border-b border-slate-200 hover:bg-slate-50/50">
                                <td className="py-2.5 px-2 border border-slate-300 text-center align-middle">
                                  <div className="w-4 h-4 border border-slate-500 rounded-sm mx-auto flex items-center justify-center font-bold text-[10px]">
                                    {isDone ? '✓' : ''}
                                  </div>
                                </td>
                                <td className="py-2.5 px-3.5 border border-slate-300">
                                  <div className={`font-bold text-xs leading-snug ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                    {task.title}
                                  </div>
                                  {task.description && (
                                    <div className="text-[11px] text-slate-600 mt-1 leading-relaxed line-clamp-2">
                                      {task.description}
                                    </div>
                                  )}
                                </td>
                                <td className="py-2.5 px-3.5 border border-slate-300 text-slate-800 font-medium text-xs">
                                  {sub?.name || 'সাধারণ'}
                                </td>
                                <td className="py-2.5 px-3.5 border border-slate-300 text-slate-700 whitespace-nowrap font-medium text-xs">
                                  {task.due_date}
                                  {task.due_time && (
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                      {formatTime12h(task.due_time, 'bn')}
                                    </div>
                                  )}
                                </td>
                                <td className="py-2.5 px-2.5 border border-slate-300 text-center whitespace-nowrap">
                                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold inline-block ${
                                    task.priority === 'high' 
                                      ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                                      : task.priority === 'medium' 
                                        ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                                  }`}>
                                    {task.priority === 'high' ? 'জরুরি' : task.priority === 'medium' ? 'মাঝারি' : 'সাধারণ'}
                                  </span>
                                </td>
                                <td className="py-2.5 px-2.5 border border-slate-300 text-center whitespace-nowrap font-bold text-[10px]">
                                  {isDone ? (
                                    <span className="text-emerald-700 font-bold">সম্পন্ন</span>
                                  ) : (
                                    <span className="text-amber-700 font-bold">চলমান/বাকি</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-5 text-center border border-dashed border-slate-300 rounded-lg text-slate-500 text-xs leading-relaxed">
                      নির্বাচিত ফিল্টারে কোনো টাস্ক পাওয়া যায়নি।
                    </div>
                  )}
                </div>
              )}

              {/* 3. WEEKLY GOALS & NOTES SECTION (Lined for handwriting) */}
              <div className="pdf-section space-y-2.5 pt-1 print-page-break-avoid">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                  শিক্ষার্থীর সাপ্তাহিক লক্ষ্য ও বিশেষ নোট (Weekly Goals & Notes):
                </h3>
                <div className="border border-slate-300 rounded-lg p-3 bg-slate-50/50 space-y-4">
                  <div className="border-b border-dashed border-slate-300 h-6"></div>
                  <div className="border-b border-dashed border-slate-300 h-6"></div>
                  <div className="border-b border-dashed border-slate-300 h-6"></div>
                </div>
              </div>

              {/* Print Footer Attribution */}
              <div className="text-[10px] text-slate-400 text-center pt-3 border-t border-slate-200 flex items-center justify-between">
                <span>StudyMate BD • Student Study Planner</span>
                <span>Generated on {todayStr} (Asia/Dhaka)</span>
                <span>অধ্যয়ন পরিকল্পনা ও নিয়মিত রুটিন</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Controls */}
        <div className="px-4 sm:px-6 py-3.5 bg-white dark:bg-charcoal-900 border-t border-[#E8E5ED] dark:border-charcoal-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-charcoal-500 dark:text-slate-400 hidden sm:block">
            ব্রাউজারের প্রিন্ট ডায়ালগ থেকে সরাসরি <span className="font-bold text-charcoal-800 dark:text-slate-200">"Save as PDF"</span> নির্বাচন করে সংরক্ষণ করতে পারবেন।
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-charcoal-600 dark:text-slate-300 hover:bg-[#F2EDF8] dark:hover:bg-charcoal-800 transition cursor-pointer"
            >
              বন্ধ করুন
            </button>

            {/* Direct Download Button (html2pdf) */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-charcoal-900 dark:text-white bg-[#F2EDF8] hover:bg-lavender-200 dark:bg-charcoal-800 dark:hover:bg-charcoal-700 transition cursor-pointer border border-[#E8E5ED] dark:border-charcoal-700 active:scale-95 disabled:opacity-50"
              title="কম্পিউটার বা ফোনে সরাসরি PDF ফাইল ডাউনলোড করুন"
            >
              <FileDown className="w-4 h-4 text-purple-700 dark:text-purple-400" />
              <span>{isGeneratingPdf ? 'পিডিএফ তৈরি হচ্ছে...' : 'PDF ফাইল ডাউনলোড'}</span>
            </button>

            {/* Print / Save as PDF Button (Native print dialog) */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-charcoal-900 hover:bg-black dark:bg-white dark:text-charcoal-900 shadow-md transition cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>প্রিন্ট / সেভ অ্যাজ PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
