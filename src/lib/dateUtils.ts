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

/**
 * Formats a YYYY-MM-DD date string into a friendly Bengali date format.
 */
export function formatDhakaDateBengali(dateStr: string): string {
  try {
    const [y, m, d] = dateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('bn-BD', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}
