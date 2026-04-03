'use client';

import { useState, useEffect, type FC } from 'react';
import { motion, LayoutGroup } from 'motion/react';

interface TabItem {
  id: string;
  label: string;
}


interface ContinuousTabsProps {
  tabs?: TabItem[];
  defaultActiveId?: string;
  activeId?: string;
  onChange?: (id: string) => void;
}
const DEFAULT_TABS: TabItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'interactions', label: 'Interactions' },
  { id: 'resources', label: 'Resources' },
  { id: 'docs', label: 'Docs' },
];


export const ContinuousTabs: FC<ContinuousTabsProps> = ({
  tabs = DEFAULT_TABS,
  defaultActiveId = 'home',
  activeId,
  onChange,
}) => {
  const [internalActive, setInternalActive] = useState<string>(defaultActiveId);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Use activeId if provided (controlled mode), otherwise use internal state
  const active = activeId !== undefined ? activeId : internalActive;

  useEffect(() => {
    requestAnimationFrame(() => setIsMounted(true));
  }, []);

  const handleChange = (id: string) => {
    // If not in controlled mode, update internal state
    if (activeId === undefined) {
      setInternalActive(id);
    }
    onChange?.(id);
  };
  if (!isMounted) return null;

  return (
    <LayoutGroup>
      <nav
        className="relative flex items-center gap-0.5 sm:gap-1 p-0.5 sm:p-1 rounded-full transition-all duration-300"
        style={{
          background: 'rgba(15,15,15,0.8)',
          border: '1.5px solid rgba(255,217,61,0.2)',
          backdropFilter: 'blur(8px)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleChange(tab.id)}
              className="relative px-4 py-1.5 sm:px-5 sm:py-2 rounded-full outline-none transition-all"
            >
              {/* Active pill */}
              {isActive && (
                <motion.div
                  layoutId="active-pill"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                    mass: 0.9,
                  }}
                  style={{
                    background: '#FFD93D',
                    boxShadow: '0 2px 8px rgba(255,217,61,0.3)',
                  }}
                  className="absolute inset-0 rounded-full"
                />
              )}

              {/* Text */}
              <motion.span
                layout="position"
                className="relative z-10 text-xs sm:text-sm font-semibold transition-colors duration-200"
                style={{
                  color: isActive ? '#1a1a1a' : '#888',
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: '0.06em',
                }}
              >
                {tab.label}
              </motion.span>
            </button>
          );
        })}
      </nav>
    </LayoutGroup>
  );
};
