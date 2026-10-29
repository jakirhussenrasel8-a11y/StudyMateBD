import { useState, useEffect, useCallback } from 'react';
import { 
  getDhakaQuoteDateString, 
  getMsUntilNextDhaka6AM,
  getDhakaDateString,
  formatDhakaDateBengali 
} from '../lib/dateUtils';

export interface MotivationalQuote {
  id: number;
  quote: string;
  author: string;
  category: 'perseverance' | 'discipline' | 'learning' | 'time' | 'focus';
  categoryLabelBn: string;
}

/**
 * Curated collection of Bengali motivational academic quotes for students
 * focused on education, learning, discipline, perseverance, focus, and time management.
 */
export const BENGALI_ACADEMIC_QUOTES: MotivationalQuote[] = [
  {
    id: 1,
    quote: "জ্ঞান অর্জনের চেয়ে বড় কোনো সম্পদ নেই, আর অজ্ঞতার চেয়ে বড় কোনো দারিদ্র্য নেই।",
    author: "হজরত আলী (রা.)",
    category: "learning",
    categoryLabelBn: "জ্ঞানার্জন",
  },
  {
    id: 2,
    quote: "স্বপ্ন সেটা নয় যা তুমি ঘুমিয়ে দেখ, স্বপ্ন সেটাই যা তোমাকে ঘুমাতে দেয় না।",
    author: "ড. এ পি জে আব্দুল কালাম",
    category: "perseverance",
    categoryLabelBn: "লক্ষ্য ও স্বপ্ন",
  },
  {
    id: 3,
    quote: "শিক্ষা হলো সবচেয়ে শক্তিশালী হাতিয়ার, যা তুমি বিশ্বকে পরিবর্তন করতে ব্যবহার করতে পারো।",
    author: "নেলসন ম্যান্ডেলা",
    category: "learning",
    categoryLabelBn: "শিক্ষার শক্তি",
  },
  {
    id: 4,
    quote: "প্রতিদিনের ছোট ছোট পড়াশোনা ও অনুশীলন বছর শেষে এক বিশাল অর্জনে রূপ নেয়।",
    author: "একাডেমিক প্রবাদ",
    category: "discipline",
    categoryLabelBn: "ধারাবাহিকতা",
  },
  {
    id: 5,
    quote: "যদি তুমি সূর্যের মতো আলো ছড়াতে চাও, তবে প্রথমে সূর্যের মতোই নিজেকে পোড়াতে শেখো।",
    author: "ড. এ পি জে আব্দুল কালাম",
    category: "perseverance",
    categoryLabelBn: "কঠোর পরিশ্রম",
  },
  {
    id: 6,
    quote: "হারিয়ে যাওয়া সময় কখনো ফিরে পাওয়া যায় না; তাই পড়ার টেবিলের প্রতিটি মুহূর্তকে মূল্যবান ভাবো।",
    author: "বেঞ্জামিন ফ্র্যাঙ্কলিন",
    category: "time",
    categoryLabelBn: "সময়ানুবর্তিতা",
  },
  {
    id: 7,
    quote: "মনোযোগ হলো শিক্ষার ভিত্তি। যেখানে পুরো মন নিবদ্ধ থাকে, সেখানে কঠিন পাঠও সহজ হয়ে যায়।",
    author: "স্বামী বিবেকানন্দ",
    category: "focus",
    categoryLabelBn: "মনোযোগ ও একাগ্রতা",
  },
  {
    id: 8,
    quote: "যে প্রশ্ন করে সে পাঁচ মিনিটের জন্য বোকা থাকে, কিন্তু যে প্রশ্ন করে না সে সারাজীবন বোকা থাকে।",
    author: "কনফুসিয়াস",
    category: "learning",
    categoryLabelBn: "জিজ্ঞাসা ও শিক্ষা",
  },
  {
    id: 9,
    quote: "কঠিন পরিশ্রমের কোনো বিকল্প নেই; মেধা তোমাকে সুযোগ দিতে পারে, কিন্তু নিয়মিত অধ্যবসায় সাফল্য নিশ্চিত করে।",
    author: "টমাস আলভা এডিসন",
    category: "perseverance",
    categoryLabelBn: "অধ্যবসায়",
  },
  {
    id: 10,
    quote: "ভুল করা কোনো ব্যর্থতা নয়, ভুল থেকে নতুন করে না শেখাটাই আসল ব্যর্থতা।",
    author: "আলবার্ট আইনস্টাইন",
    category: "learning",
    categoryLabelBn: "শেখার মানসিকতা",
  },
  {
    id: 11,
    quote: "শৃঙ্খলা হলো তোমার লক্ষ্য এবং প্রাপ্তির মধ্যবর্তী একমাত্র সেতুবন্ধন।",
    author: "জিম রন",
    category: "discipline",
    categoryLabelBn: "আত্মনিয়ন্ত্রণ",
  },
  {
    id: 12,
    quote: "আজকের অলসতা আগামীকালের উদ্বেগের কারণ; তাই আজকের পাঠ আজকেই শেষ করো।",
    author: "লর্ড চেস্টারফিল্ড",
    category: "time",
    categoryLabelBn: "সময়ের সদ্ব্যবহার",
  },
  {
    id: 13,
    quote: "পড়াশোনায় সফল হতে হলে প্রতিভার চেয়ে বেশি প্রয়োজন একটানা লেগে থাকার অদম্য ইচ্ছা।",
    author: "উইলিয়াম জেমস",
    category: "perseverance",
    categoryLabelBn: "দৃঢ় সংকল্প",
  },
  {
    id: 14,
    quote: "জ্ঞানের শিকড় তেতো হলেও তার ফল সবসময় অত্যন্ত মিষ্টি হয়।",
    author: "এরিস্টটল",
    category: "learning",
    categoryLabelBn: "বিদ্যার মূল্যায়ন",
  },
  {
    id: 15,
    quote: "মনকে শান্ত রেখে গভীর মনোযোগে একটি অধ্যায় পড়া বিক্ষিপ্তভাবে দশটি অধ্যায় পড়ার চেয়েও উত্তম।",
    author: "রবীন্দ্রনাথ ঠাকুর",
    category: "focus",
    categoryLabelBn: "গভীর পড়াশোনা",
  },
  {
    id: 16,
    quote: "আমরা বারবার যা করি আমরা সেটাই হয়ে উঠি। সুতরাং শ্রেষ্ঠত্ব কোনো একক কাজ নয়, বরং একটি নিয়মিত অভ্যাস।",
    author: "এরিস্টটল",
    category: "discipline",
    categoryLabelBn: "পড়ার অভ্যাস",
  },
  {
    id: 17,
    quote: "তোমার আজকের ত্যাগ ও মনোযোগই তোমার আগামীকালের আত্মবিশ্বাস তৈরি করবে।",
    author: "ড. মুহম্মদ জাফর ইকবাল",
    category: "perseverance",
    categoryLabelBn: "আত্মবিশ্বাস",
  },
  {
    id: 18,
    quote: "একটি ভালো বই এবং পড়ার টেবিলে একাগ্র সময় মানুষের জীবনের মোড় ঘুরিয়ে দিতে পারে।",
    author: "কাজী নজরুল ইসলাম",
    category: "learning",
    categoryLabelBn: "বই ও জ্ঞান",
  },
  {
    id: 19,
    quote: "দেরি হয়ে গেছে ভেবে হাল ছেড়ো না; নতুন করে শুরুর এখনই সেরা সময়।",
    author: "সি এস লুইস",
    category: "perseverance",
    categoryLabelBn: "নতুন প্রত্যয়",
  },
  {
    id: 20,
    quote: "সময়কে যে নিয়ন্ত্রণ করতে পারে, সে নিজের ভবিষ্যৎ নিয়ন্ত্রণ করতে পারে।",
    author: "সেনেকা",
    category: "time",
    categoryLabelBn: "সময় সচেতনতা",
  },
  {
    id: 21,
    quote: "শিক্ষা গ্রহণ কেবল পরীক্ষার জন্য নয়, চিন্তা করার সক্ষমতা গড়ে তোলার জন্য।",
    author: "আলবার্ট আইনস্টাইন",
    category: "learning",
    categoryLabelBn: "উপলব্ধি",
  },
  {
    id: 22,
    quote: "বড় ফলাফলের পথ ছোট ছোট রুটিন মেনে চলা দিয়েই শুরু হয়।",
    author: "জেমস ক্লিয়ার",
    category: "discipline",
    categoryLabelBn: "রুটিন ও শৃঙ্খলা",
  },
  {
    id: 23,
    quote: "সাফল্য হলো প্রতিদিনের ছোট ছোট প্রচেষ্টার সমষ্টি, যা বাইরে থেকে খুব সহজ মনে হলেও ভেতরে তীব্র একাগ্রতা দাবি করে।",
    author: "রবার্ট কলিয়ার",
    category: "perseverance",
    categoryLabelBn: "অবিচল প্রচেষ্টা",
  },
  {
    id: 24,
    quote: "পরীক্ষার খাতার আগে প্রতিটি দিন পড়ার টেবিলে সততার সাথে লড়াই করো, বিজয় তোমারই হবে।",
    author: "আচার্য জগদীশচন্দ্র বসু",
    category: "discipline",
    categoryLabelBn: "আন্তরিক পড়ালেখা",
  },
];

/**
 * Deterministically picks a quote for a given YYYY-MM-DD date string.
 * This guarantees the exact same quote is displayed regardless of renders, page refreshes,
 * or offline status during the same Bangladesh date cycle.
 */
function getQuoteForDate(dateStr: string): MotivationalQuote {
  // Simple deterministic string hash
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  }
  const index = hash % BENGALI_ACADEMIC_QUOTES.length;
  return BENGALI_ACADEMIC_QUOTES[index];
}

/**
 * Custom hook: useDailyBengaliQuote
 * 
 * - Deterministically calculates the active academic motivational quote in Bengali based on
 *   the Bangladesh Standard Time calendar date (Asia/Dhaka).
 * - Switches to the new day's quote every morning at exactly 6:00 AM Asia/Dhaka.
 * - If the dashboard remains open across 6:00 AM, automatically updates the quote without a refresh.
 * - Handles tab sleep, device suspension, and background throttling gracefully.
 */
export function useDailyBengaliQuote() {
  const [currentQuoteDate, setCurrentQuoteDate] = useState<string>(() => {
    return getDhakaQuoteDateString();
  });

  const checkAndUpdateQuoteDate = useCallback(() => {
    const activeDate = getDhakaQuoteDateString();
    setCurrentQuoteDate(prev => {
      if (prev !== activeDate) {
        return activeDate;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    // 1. Initial check
    checkAndUpdateQuoteDate();

    // 2. Set exact timeout to 6:00 AM Bangladesh time
    let timerId: NodeJS.Timeout | null = null;

    const scheduleNext6AMTimer = () => {
      const msUntil6AM = getMsUntilNextDhaka6AM();
      timerId = setTimeout(() => {
        checkAndUpdateQuoteDate();
        // Reschedule for next day 6 AM
        scheduleNext6AMTimer();
      }, msUntil6AM + 200); // 200ms grace window
    };

    scheduleNext6AMTimer();

    // 3. Periodic fallback poll (every 30 seconds) to guard against device sleep / timer suspension
    const intervalId = setInterval(() => {
      checkAndUpdateQuoteDate();
    }, 30000);

    // 4. Handle visibility change & window focus (tab un-suspension)
    const handleWakeOrFocus = () => {
      checkAndUpdateQuoteDate();
    };

    document.addEventListener('visibilitychange', handleWakeOrFocus);
    window.addEventListener('focus', handleWakeOrFocus);

    return () => {
      if (timerId) clearTimeout(timerId);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleWakeOrFocus);
      window.removeEventListener('focus', handleWakeOrFocus);
    };
  }, [checkAndUpdateQuoteDate]);

  const activeQuote = getQuoteForDate(currentQuoteDate);
  const todayCalendarDate = getDhakaDateString();

  return {
    quote: activeQuote.quote,
    author: activeQuote.author,
    category: activeQuote.category,
    categoryLabelBn: activeQuote.categoryLabelBn,
    quoteCycleDate: currentQuoteDate,
    todayCalendarDate,
    formattedDhakaDate: formatDhakaDateBengali(todayCalendarDate),
  };
}
