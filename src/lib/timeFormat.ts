/**
 * Time formatting and cultural Bengali greeting utilities for StudyMate BD
 */

/**
 * Converts a 24-hour time string (e.g. "14:30", "09:00", "20:45") into a 12-hour format with time period.
 * 
 * Bengali time periods:
 *  - ভোর (Dawn): 04:00 - 05:59
 *  - সকাল (Morning): 06:00 - 11:59
 *  - দুপুর (Noon): 12:00 - 14:59
 *  - বিকাল (Afternoon): 15:00 - 17:59
 *  - সন্ধ্যা (Evening): 18:00 - 19:59
 *  - রাত (Night): 20:00 - 03:59
 */
export function formatTime12h(timeStr?: string | null, language: 'bn' | 'en' = 'bn'): string {
  if (!timeStr) return '';
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return timeStr;

  const hour24 = parseInt(parts[0], 10);
  const min = parseInt(parts[1], 10);
  if (isNaN(hour24) || isNaN(min)) return timeStr;

  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const minFormatted = String(min).padStart(2, '0');

  if (language === 'en') {
    const period = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minFormatted} ${period}`;
  }

  // Bengali period
  let periodBn = 'রাত';
  if (hour24 >= 4 && hour24 < 6) {
    periodBn = 'ভোর';
  } else if (hour24 >= 6 && hour24 < 12) {
    periodBn = 'সকাল';
  } else if (hour24 >= 12 && hour24 < 15) {
    periodBn = 'দুপুর';
  } else if (hour24 >= 15 && hour24 < 18) {
    periodBn = 'বিকাল';
  } else if (hour24 >= 18 && hour24 < 20) {
    periodBn = 'সন্ধ্যা';
  }

  return `${periodBn} ${hour12}:${minFormatted}`;
}

/**
 * Returns appropriate greeting based on the 6 Bangladeshi cultural day divisions:
 * ভোর (Dawn), সকাল (Morning), দুপুর (Noon), বিকাল (Afternoon), সন্ধ্যা (Evening), রাত (Night)
 */
export function getSixPeriodGreeting(hour: number = new Date().getHours(), language: 'bn' | 'en' = 'bn'): string {
  if (hour >= 4 && hour < 6) {
    return language === 'bn' ? 'শুভ ভোর' : 'Good Dawn';
  } else if (hour >= 6 && hour < 12) {
    return language === 'bn' ? 'শুভ সকাল' : 'Good Morning';
  } else if (hour >= 12 && hour < 15) {
    return language === 'bn' ? 'শুভ দুপুর' : 'Good Noon';
  } else if (hour >= 15 && hour < 18) {
    return language === 'bn' ? 'শুভ বিকাল' : 'Good Afternoon';
  } else if (hour >= 18 && hour < 20) {
    return language === 'bn' ? 'শুভ সন্ধ্যা' : 'Good Evening';
  } else {
    return language === 'bn' ? 'শুভ রাত্রি' : 'Good Night';
  }
}
