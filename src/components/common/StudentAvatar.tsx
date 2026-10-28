import React from 'react';
import { Gender } from '../../types';

interface StudentAvatarProps {
  gender?: Gender | string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  className?: string;
}

export const StudentAvatar: React.FC<StudentAvatarProps> = ({
  gender = 'male',
  name = 'শিক্ষার্থী',
  size = 'md',
  showBadge = true,
  className = '',
}) => {
  const isFemale = gender === 'female';

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  const currentSizeClass = sizeClasses[size] || sizeClasses.md;

  // Background and border colors matching pastel palette
  const bgClass = isFemale
    ? 'bg-gradient-to-tr from-[#FFE4E6] to-[#FED7E2] dark:from-pink-950 dark:to-rose-900 border-[#FECDD3] dark:border-pink-800'
    : 'bg-gradient-to-tr from-[#CFE4E0] to-[#C5A7E2] dark:from-indigo-950 dark:to-teal-950 border-[#C5A7E2]/50 dark:border-lavender-800';

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl border shadow-xs select-none shrink-0 transition-transform ${currentSizeClass} ${bgClass} ${className}`}
      title={isFemale ? 'ছাত্রী (Girl Student)' : 'ছাত্র (Boy Student)'}
    >
      {isFemale ? (
        // Girl Student Vector Icon
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5 drop-shadow-xs"
        >
          {/* Hair back / ponytail */}
          <path
            d="M8 20C8 14 11 9 18 9C25 9 28 14 28 20C28 26 26 28 26 28H10C10 28 8 26 8 20Z"
            fill="#832A45"
          />
          {/* Ribbon */}
          <circle cx="27" cy="14" r="3" fill="#F43F5E" />
          <path d="M25 14L23 18M28 16L30 19" stroke="#E11D48" strokeWidth="1.5" strokeLinecap="round" />
          {/* Face */}
          <circle cx="18" cy="18" r="8" fill="#FDE2D2" />
          {/* Bangs / Hair front */}
          <path
            d="M10 16C10 12 13 11 18 11C23 11 26 12 26 16C24 14 21 14 18 14C15 14 12 14 10 16Z"
            fill="#9F1239"
          />
          {/* Eyes with friendly sparkle */}
          <circle cx="15.5" cy="17.5" r="1.2" fill="#1E293B" />
          <circle cx="20.5" cy="17.5" r="1.2" fill="#1E293B" />
          {/* Soft Smile */}
          <path
            d="M16 20.5C16.8 21.8 19.2 21.8 20 20.5"
            stroke="#BE123C"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Blushes */}
          <circle cx="13.5" cy="19.5" r="1.2" fill="#FDA4AF" opacity="0.8" />
          <circle cx="22.5" cy="19.5" r="1.2" fill="#FDA4AF" opacity="0.8" />
          {/* Student collar */}
          <path
            d="M13 26L18 31L23 26"
            fill="#FFFFFF"
            stroke="#F43F5E"
            strokeWidth="1"
          />
        </svg>
      ) : (
        // Boy Student Vector Icon
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5 drop-shadow-xs"
        >
          {/* Hair back */}
          <path
            d="M10 17C10 12 13 8 18 8C23 8 26 12 26 17V20H10V17Z"
            fill="#1E293B"
          />
          {/* Face */}
          <circle cx="18" cy="19" r="8" fill="#FDE2D2" />
          {/* Boy Short Hair with styled bangs */}
          <path
            d="M9 16C9.5 11 13 9 18 9C23 9 26.5 11 27 16C24.5 13 21 13 18 13.5C14 14 11 15 9 16Z"
            fill="#0F172A"
          />
          {/* Eyes */}
          <circle cx="15.5" cy="18.5" r="1.2" fill="#0F172A" />
          <circle cx="20.5" cy="18.5" r="1.2" fill="#0F172A" />
          {/* Smile */}
          <path
            d="M16 21.5C16.8 22.8 19.2 22.8 20 21.5"
            stroke="#0F172A"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          {/* Student Collar / Shirt */}
          <path
            d="M12 27L18 32L24 27"
            fill="#FFFFFF"
            stroke="#3B82F6"
            strokeWidth="1"
          />
        </svg>
      )}

      {/* Gender Indicator Mini Badge */}
      {showBadge && size !== 'xs' && (
        <span
          className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black border border-white dark:border-charcoal-900 shadow-2xs ${
            isFemale ? 'bg-pink-500 text-white' : 'bg-blue-600 text-white'
          }`}
          title={isFemale ? 'মেয়ে' : 'ছেলে'}
        >
          {isFemale ? '♀' : '♂'}
        </span>
      )}
    </div>
  );
};
