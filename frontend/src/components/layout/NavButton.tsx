'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';

interface NavButtonProps {
  active?: boolean;
  onClick?: () => void;
  icon: React.ReactNode;
  label: string;
  isMobile?: boolean;
}

const NavButton: React.FC<NavButtonProps> = memo(({ active, onClick, icon, label, isMobile }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 relative group w-full
        ${active 
          ? 'bg-stone-800 text-amber-400 shadow-lg shadow-amber-900/20' 
          : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
        }
        ${isMobile ? 'justify-start' : 'flex-col justify-center'}
      `}
    >
      <div className="flex items-center gap-3 flex-1">
        {icon}
        {isMobile && (
          <span className="text-sm font-medium">{label}</span>
        )}
      </div>
      {!isMobile && (
        <span className="text-[10px] mt-1 font-medium">{label}</span>
      )}
      {active && !isMobile && (
        <motion.div
          layoutId="active-indicator"
          className="absolute left-0 w-1 h-8 bg-amber-400 rounded-r-full"
        />
      )}
      {active && isMobile && (
        <motion.div
          layoutId="active-indicator-mobile"
          className="absolute right-0 w-1 h-8 bg-amber-400 rounded-l-full"
        />
      )}
    </button>
  );
});

NavButton.displayName = 'NavButton';

export default NavButton;
