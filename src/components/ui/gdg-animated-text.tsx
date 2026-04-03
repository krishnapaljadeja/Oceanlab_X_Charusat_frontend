"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GdgAnimatedTextProps {
  text: string;
  className?: string;
  mode?: "light" | "accent";
}

export function GdgAnimatedText({
  text,
  className,
  mode = "light",
}: GdgAnimatedTextProps) {
  const chars = text.split("");

  return (
    <div className={cn("relative inline-block", className)}>
      <span
        className={cn(
          "absolute inset-0 pointer-events-none",
          "bg-clip-text text-transparent bg-[length:220%_220%]",
          mode === "light"
            ? "bg-gradient-to-r from-white via-slate-200 to-white"
            : "bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300",
        )}
        style={{
          WebkitBackgroundClip: "text",
          animation: "gdgShimmer 4.8s ease-in-out infinite",
        }}
      >
        {text}
      </span>

      <span className="relative">
        {chars.map((char, i) => (
          <motion.span
            key={`${char}-${i}`}
            className={cn(
              "inline-block",
              mode === "light" ? "text-white" : "text-[#FFD93D]",
            )}
            initial={{ y: 36, opacity: 0 }}
            animate={{
              y: [0, -4, 0],
              opacity: [0.92, 1, 0.92],
            }}
            transition={{
              y: {
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.035,
              },
              opacity: {
                duration: 2.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.035,
              },
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </span>
    </div>
  );
}
