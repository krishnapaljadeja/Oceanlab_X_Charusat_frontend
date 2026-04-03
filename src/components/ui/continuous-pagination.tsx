import { useEffect, useState, type FC, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export interface ContinuousPaginationProps {
  totalPages?: number;
  defaultPage?: number;
  currentPage?: number;
  maxVisiblePages?: number;
  onPageChange?: (page: number) => void;
}

interface PageButtonProps {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const PageButton: FC<PageButtonProps> = ({ children, onClick, disabled }) => {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center text-[#706F78] hover:text-[#65656c] border border-slate-500/20 bg-[#171717] shadow-[0_4px_10px_rgba(0,0,0,0.12)] disabled:opacity-40 disabled:cursor-not-allowed"
      whileHover={
        disabled
          ? {}
          : {
              scale: 1.08,
              y: -6,
              boxShadow: "0 6px 10px rgba(0,0,0,0.12)",
            }
      }
      whileTap={disabled ? {} : { scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.button>
  );
};

export const ContinuousPagination: FC<ContinuousPaginationProps> = ({
  totalPages = 5,
  defaultPage = 1,
  currentPage,
  maxVisiblePages = 10,
  onPageChange,
}) => {
  const [internalPage, setInternalPage] = useState<number>(defaultPage);

  const active = currentPage ?? internalPage;

  useEffect(() => {
    setInternalPage(defaultPage);
  }, [defaultPage]);

  const paginate = (page: number) => {
    if (page < 1 || page > totalPages) return;
    if (currentPage === undefined) {
      setInternalPage(page);
    }
    onPageChange?.(page);
  };

  const pageWindowStart =
    Math.floor((active - 1) / maxVisiblePages) * maxVisiblePages + 1;
  const pageWindowEnd = Math.min(totalPages, pageWindowStart + maxVisiblePages - 1);
  const pageNumbers = Array.from(
    { length: Math.max(0, pageWindowEnd - pageWindowStart + 1) },
    (_, i) => pageWindowStart + i,
  );

  return (
    <div className="flex items-center justify-center gap-1.5 sm:gap-3 text-sm">
      <PageButton
        onClick={() => paginate(pageWindowStart - maxVisiblePages)}
        disabled={pageWindowStart <= 1}
      >
        <ChevronsLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </PageButton>

      <PageButton onClick={() => paginate(active - 1)} disabled={active <= 1}>
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </PageButton>

      <div className="relative flex gap-1.5 sm:gap-3">
        {pageNumbers.map((page) => {
          const isActive = page === active;

          return (
            <motion.button
              key={page}
              onClick={(event) => {
                event.currentTarget.blur();
                paginate(page);
              }}
              className={`relative z-10 h-10 w-10 sm:h-12 sm:w-12 rounded-lg flex items-center justify-center text-sm font-medium transition-colors duration-300 border border-slate-500/20 shadow-[0_4px_10px_rgba(0,0,0,0.12)] ${
                isActive
                  ? "text-white"
                  : "text-gray-500 hover:text-gray-200 bg-[#171717]"
              }`}
              whileHover={
                !isActive
                  ? {
                      y: -6,
                      boxShadow: "0 6px 10px rgba(0,0,0,0.12)",
                    }
                  : {}
              }
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 260, damping: 18 }}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="active-bg"
                    className="absolute inset-0 rounded-lg overflow-hidden"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 220,
                      damping: 24,
                      mass: 0.8,
                    }}
                  >
                    <div
                      className="absolute inset-0 rounded-lg"
                      style={{
                        background: "#202026",
                        border: "1px solid #3a3a3e",
                        boxShadow:
                          "0 8px 16px -4px rgba(0,0,0,0.7), inset 0 1px 1px 0 rgba(255, 255, 255, 0.15)",
                      }}
                    />
                    <motion.div
                      className="absolute -inset-full bg-linear-to-tr from-transparent via-white/10 to-transparent skew-x-12"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        repeatDelay: 5,
                        ease: "easeInOut",
                      }}
                    />
                    <span
                      className="absolute inset-0 rounded-[inherit] pointer-events-none"
                      style={{
                        boxShadow: "inset 0 -4px 8px 0 rgba(0, 0, 0, 0.6)",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <span className="relative z-10 text-base sm:text-lg font-semibold">
                {page}
              </span>
            </motion.button>
          );
        })}
      </div>

      <PageButton
        onClick={() => paginate(active + 1)}
        disabled={active >= totalPages}
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </PageButton>

      <PageButton
        onClick={() => paginate(pageWindowStart + maxVisiblePages)}
        disabled={pageWindowEnd >= totalPages}
      >
        <ChevronsRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </PageButton>
    </div>
  );
};
