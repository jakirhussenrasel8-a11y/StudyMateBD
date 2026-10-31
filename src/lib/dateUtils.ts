/**
 * Date and timezone utilities for StudyMate BD
 * Authoritative timezone: Asia/Dhaka (UTC+06:00, Bangladesh Standard Time)
 */

/**
 * Returns YYYY-MM-DD string for a given date in Asia/Dhaka timezone.
 */
export function getDhakaDateString(date: Date = new Date()): string {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Dhaka',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    return formatter.format(date);
  } catch {
    // Math fallback: Bangladesh Standard Time is fixed UTC+6 (no DST)
    const utc = date.getTime() + date.getTimezoneOffset() * 60000;
    const dhaka = new Date(utc + 6 * 3600000);
    const y = dhaka.getFullYear();
    const m = String(dhaka.getMonth() + 1).padStart(2, '0');
    const d = String(dhaka.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

/**
 * Returns date and time breakdown in Asia/Dhaka.
 */
export function getDhakaTimeParts(date: Date = new Date()): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  dateString: string;
} {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const dhaka = new Date(utc + 6 * 3600000);
  const year = dhaka.getFullYear();
  const month = dhaka.getMonth() + 1;
  const day = dhaka.getDate();
  const hour = dhaka.getHours();
  const minute = dhaka.getMinutes();
  const second = dhaka.getSeconds();
  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return { year, month, day, hour, minute, second, dateString };
}

/**
 * Calculates milliseconds until next midnight (12:00:00 AM) in Asia/Dhaka.
 */
export function getMsUntilNextDhakaMidnight(): number {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const dhaka = new Date(utc + 6 * 3600000);

  const nextMidnightDhaka = new Date(dhaka);
  nextMidnightDhaka.setDate(nextMidnightDhaka.getDate() + 1);
  nextMidnightDhaka.setHours(0, 0, 0, 0);

  const diffMs = nextMidnightDhaka.getTime() - dhaka.getTime();
  return Math.max(1000, diffMs);
}

/**
 * Calculates milliseconds until next 6:00:00 AM in Asia/Dhaka.
 */
export function getMsUntilNextDhaka6AM(): number {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const dhaka = new Date(utc + 6 * 3600000);

  const targetDhaka = new Date(dhaka);
  if (dhaka.getHours() < 6) {
    targetDhaka.setHours(6, 0, 0, 0);
  } else {
    targetDhaka.setDate(targetDhaka.getDate() + 1);
    targetDhaka.setHours(6, 0, 0, 0);
  }

  const diffMs = targetDhaka.getTime() - dhaka.getTime();
  return Math.max(1000, diffMs);
}

/**
 * Returns the effective date string for the daily quote schedule in Asia/Dhaka.
 * The daily quote activates at 6:00 AM Bangladesh time every day.
 * - If current Bangladesh time is >= 06:00, returns today's Bangladesh date (YYYY-MM-DD).
 * - If current Bangladesh time is < 06:00, returns yesterday's Bangladesh date (YYYY-MM-DD).
 */
export function getDhakaQuoteDateString(date: Date = new Date()): string {
  const { hour } = getDhakaTimeParts(date);
  if (hour >= 6) {
    return getDhakaDateString(date);
  }
  // Before 6:00 AM, quote is from yesterday
  const yesterday = new Date(date.getTime() - 24 * 3600000);
  return getDhakaDateString(yesterday);
}

const BANGLA_DIGITS: { [key: string]: string } = {
  '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪',
  '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯',
};

export function toBengaliDigits(input: number | string): string {
  return String(input).replace(/[0-9]/g, (digit) => BANGLA_DIGITS[digit] || digit);
}

const BANGLA_MONTHS = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const BANGLA_WEEKDAYS = [
  'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'
];

/**
 * Formats a YYYY-MM-DD date string into a friendly, clear Bengali full date (e.g. "শনিবার, ৩১ অক্টোবর ২০২৬").
 */
export function formatDhakaDateBengali(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [yStr, mStr, dStr] = dateStr.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const d = parseInt(dStr, 10);
    const dateObj = new Date(y, m - 1, d);
    const weekday = BANGLA_WEEKDAYS[dateObj.getDay()];
    const month = BANGLA_MONTHS[m - 1] || '';
    const dayBn = toBengaliDigits(d);
    const yearBn = toBengaliDigits(y);
    return `${weekday}, ${dayBn} ${month} ${yearBn}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats a YYYY-MM-DD date string into a clean short date (e.g. "৩১ অক্টোবর, ২০২৬").
 */
export function formatDateBengaliShort(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [yStr, mStr, dStr] = dateStr.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const d = parseInt(dStr, 10);
    const month = BANGLA_MONTHS[m - 1] || '';
    const dayBn = toBengaliDigits(d);
    const yearBn = toBengaliDigits(y);
    return `${dayBn} ${month}, ${yearBn}`;
  } catch {
    return dateStr;
  }
}

/**
 * Formats a YYYY-MM-DD date string with day and month only (e.g. "৩১ অক্টোবর").
 */
export function formatDateBengaliDayMonth(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [, mStr, dStr] = dateStr.split('-');
    const m = parseInt(mStr, 10);
    const d = parseInt(dStr, 10);
    const month = BANGLA_MONTHS[m - 1] || '';
    const dayBn = toBengaliDigits(d);
    return `${dayBn} ${month}`;
  } catch {
    return dateStr;
  }
}

/**
 * Returns a high-contrast human friendly relative date in Bengali with exact date.
 * e.g. "আজ (৩১ অক্টোবর)", "আগামীকাল (১ নভেম্বর)", "১৫ নভেম্বর ২০২৬ (রবিবার)"
 */
export function formatRelativeDateBengali(dateStr: string, todayStr?: string): {
  badgeText: string;
  fullDateText: string;
  status: 'today' | 'tomorrow' | 'overdue' | 'upcoming';
} {
  const currentToday = todayStr || getDhakaDateString();
  const dayMonth = formatDateBengaliDayMonth(dateStr);
  const fullDate = formatDateBengaliShort(dateStr);

  if (dateStr === currentToday) {
    return {
      badgeText: `আজ (${dayMonth})`,
      fullDateText: `আজ, ${fullDate}`,
      status: 'today'
    };
  }

  // Calculate day difference
  const [ty, tm, td] = currentToday.split('-').map(Number);
  const [dy, dm, dd] = dateStr.split('-').map(Number);
  const todayDate = new Date(ty, tm - 1, td);
  const targetDate = new Date(dy, dm - 1, dd);
  const diffDays = Math.round((targetDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return {
      badgeText: `আগামীকাল (${dayMonth})`,
      fullDateText: `আগামীকাল, ${fullDate}`,
      status: 'tomorrow'
    };
  }

  if (diffDays === -1) {
    return {
      badgeText: `গতকাল (${dayMonth})`,
      fullDateText: `গতকাল, ${fullDate}`,
      status: 'overdue'
    };
  }

  if (diffDays < 0) {
    return {
      badgeText: `মেয়াদোত্তীর্ণ (${dayMonth})`,
      fullDateText: `${fullDate} (মেয়াদোত্তীর্ণ)`,
      status: 'overdue'
    };
  }

  const weekday = BANGLA_WEEKDAYS[targetDate.getDay()];
  return {
    badgeText: `${dayMonth} (${weekday})`,
    fullDateText: `${weekday}, ${fullDate}`,
    status: 'upcoming'
  };
}

