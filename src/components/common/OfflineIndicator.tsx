import React from 'react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <aside 
      aria-label="Offline status banner"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-amber-600 text-white px-4 py-2 text-xs font-black shadow-xl border border-amber-400 animate-in slide-in-from-bottom-4 duration-300 pointer-events-none"
    >
      <span className="h-2 w-2 rounded-full bg-white animate-ping" />
      <WifiOff className="w-3.5 h-3.5" />
      <span>অফলাইন মোড — সংরক্ষিত লোকাল ডেটা ব্যবহৃত হচ্ছে</span>
    </aside>
  );
};
