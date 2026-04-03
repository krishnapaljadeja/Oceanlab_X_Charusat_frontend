import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, MotionConfig } from 'motion/react';
import { LuCircleDotDashed } from 'react-icons/lu';
import { FaArrowRotateRight } from 'react-icons/fa6';
import { TbAlertOctagonFilled } from 'react-icons/tb';
import { cn } from '@/lib/utils';

interface InlineFeedbackProps {
  errorMessage?: string;
  loadingMessage?: string;
  onRetry?: () => void;
  initialStatus?: 'error' | 'loading';
  lockLoading?: boolean;
  hideRetryButton?: boolean;
}

export const FeedbackAction: React.FC<InlineFeedbackProps> = ({
  errorMessage = 'Sync Failed',
  loadingMessage = 'Syncing',
  onRetry,
  initialStatus = 'error',
  lockLoading = false,
  hideRetryButton = false,
}) => {
  const [status, setStatus] = useState<'error' | 'loading'>(initialStatus);

  useEffect(() => {
    setStatus(initialStatus);
  }, [initialStatus]);

  const handleRetry = () => {
    setStatus('loading');
    onRetry?.();
  };

  useEffect(() => {
    if (status === 'loading' && !lockLoading) {
      const timer = setTimeout(() => {
        setStatus('error');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [status, lockLoading]);

  return (
    <div className="flex h-12 items-center gap-2">
      <MotionConfig
        transition={{ type: 'spring', bounce: 0.25, duration: 0.6 }}
      >
        <motion.div
          animate={{ width: 'auto' }}
          layout
          initial={false}
          className={cn(
            'relative z-20 flex items-center justify-center overflow-hidden border px-5 py-2.5',
            status === 'error'
              ? 'border-red-500/40 bg-[#1a1a1a]'
              : 'border-[#FFD93D]/35 bg-[#1a1a1a]',
          )}
          style={{
            borderRadius: 999,
          }}
        >
          <motion.div
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(8px)' }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            className="flex items-center gap-2"
          >
            <AnimatePresence mode="popLayout">
              <motion.div
                layout
                key={status}
                initial={{ opacity: 0, scale: 0.25, filter: 'blur(2px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.25, filter: 'blur(2px)' }}
                transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
              >
                {status === 'error' ? (
                  <TbAlertOctagonFilled
                    size={22}
                    className={cn('text-red-400')}
                  />
                ) : (
                  <LuCircleDotDashed
                    size={22}
                    strokeWidth={2.8}
                    className={cn(
                      'animate-spin text-[#FFD93D]',
                    )}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <AnimatedText
              text={status === 'error' ? errorMessage : loadingMessage}
              className={cn(
                'text-base font-semibold',
                status === 'error'
                  ? 'text-red-400'
                  : 'text-[#FFD93D]',
              )}
            />
          </motion.div>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {status === 'error' && !hideRetryButton && (
            <motion.button
              initial={{
                opacity: 0,
                x: -55,
                filter: 'blur(4px)',
                scale: 0.8,
              }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 1, x: -55, filter: 'blur(4px)', scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={handleRetry}
              className={cn(
                'z-10 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFD93D] text-[#121212]',
              )}
            >
              <FaArrowRotateRight size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </MotionConfig>
    </div>
  );
};

function AnimatedText({
  text,
  className,
  delayStep = 0.014,
}: {
  text: string;
  className?: string;
  delayStep?: number;
}) {
  const chars = text.split('');

  return (
    <span style={{ display: 'inline-flex' }}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          layout
          key={text}
          style={{ display: 'inline-flex', willChange: 'transform' }}
        >
          {chars.map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: 10, opacity: 0, scale: 0.5, filter: 'blur(2px)' }}
              animate={{ y: 0, opacity: 1, scale: 1, filter: 'blur(0px)' }}
              exit={{ y: -10, opacity: 0, scale: 0.5, filter: 'blur(2px)' }}
              transition={{
                type: 'spring',
                stiffness: 240,
                damping: 16,
                mass: 1.2,
                delay: i * delayStep,
              }}
              style={{
                display: 'inline-block',
                whiteSpace: char === ' ' ? 'pre' : undefined,
              }}
              className={className}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
