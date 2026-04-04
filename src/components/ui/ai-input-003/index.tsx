"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, Youtube, Search } from "lucide-react";

export type MentionType = "google" | "youtube" | null;

export interface MessageReply01 {
  id: string;
  text: string;
  sender: "user" | "ai";
  mention?: MentionType;
  timestamp: number;
}

interface AiInput003Props {
  onSendMessage?: (message: string, mention: MentionType) => void;
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  submitLabel?: string;
}

const MentionBadge: React.FC<{ type: MentionType; compact?: boolean }> = ({
  type,
  compact = false,
}) => {
  if (!type) return null;
  const isGoogle = type === "google";
  const label = isGoogle ? "Google Search" : "Youtube Analyzer";

  return (
    <div
      className={`flex items-center gap-2 rounded-xl px-3 py-1.5 transition-all duration-300 select-none ${compact ? "text-xs" : "text-sm"} border border-neutral-200 bg-neutral-100 dark:border-[#333] dark:bg-[#222]`}
    >
      {isGoogle ? (
        <div className="flex h-5 w-5 items-center justify-center rounded-md border border-neutral-100 bg-white shadow-sm dark:border-transparent">
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        </div>
      ) : (
        <div className="flex h-5 w-5 items-center justify-center rounded-md bg-red-600 shadow-sm">
          <Youtube size={14} className="fill-white text-white" />
        </div>
      )}
      <span className="font-medium text-neutral-600 dark:text-neutral-300">
        {label}
      </span>
    </div>
  );
};

export const AiInput003: React.FC<AiInput003Props> = ({
  onSendMessage,
  placeholder = "Type here...",
  value,
  onValueChange,
  disabled = false,
  submitLabel,
}) => {
  const [internalValue, setInternalValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [mention, setMention] = useState<MentionType>(null);

  const inputValue = value !== undefined ? value : internalValue;

  useEffect(() => {
    const val = inputValue;
    if (val.includes("@goog")) setMention("google");
    else if (val.includes("@yt")) setMention("youtube");
    else if (!val.includes("@")) setMention(null);
  }, [inputValue]);

  const setInput = (next: string) => {
    if (onValueChange) onValueChange(next);
    if (value === undefined) setInternalValue(next);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending || disabled) return;

    setIsSending(true);
    if (onSendMessage) onSendMessage(inputValue, mention);

    if (value === undefined) {
      setInternalValue("");
    }
    setMention(null);

    setTimeout(() => {
      setIsSending(false);
    }, 350);
  };

  return (
    <div className="relative w-full">
      <AnimatePresence>
        {mention && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full left-4 mb-3 z-20"
          >
            <MentionBadge type={mention} />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={{
          scale: isSending ? 0.99 : 1,
          borderColor: isSending ? "rgba(255,217,61,0.4)" : "rgba(42,42,42,1)",
          boxShadow: isSending
            ? "0 0 18px rgba(255,217,61,0.15)"
            : "0 4px 12px rgba(0,0,0,0.08)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className="group relative flex items-center overflow-hidden rounded-2xl border bg-[#1a1a1a] px-3.5 py-2 transition-colors duration-300"
      >
        {isSending && (
          <motion.div
            initial={{ y: "220%" }}
            animate={{ y: "-120%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-0 z-0 skew-x-12 bg-gradient-to-t from-[#FFD93D]/20 via-[#FFD93D]/10 to-white/10 blur-md"
          />
        )}

        <Search size={16} className="z-10 text-[#4CC9F0] mr-2.5" />

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder={placeholder}
          className="z-10 flex-1 border-none bg-transparent py-1.5 text-[15px] font-medium text-neutral-100 placeholder-neutral-500 outline-none"
          disabled={disabled}
        />

        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || disabled}
          className={`z-10 ml-2.5 pt-1 flex min-w-[96px] h-9 items-center justify-center rounded-xl px-3.5 transition-all duration-300 ${
            inputValue.trim() && !disabled
              ? "bg-[#d2b50e] text-black shadow-sm"
              : "bg-neutral-700 text-neutral-300"
          }`}
          style={{
            fontFamily: "'Bebas Neue', cursive",
            letterSpacing: "0.06em",
            fontSize: "0.99rem",
          }}
        >
          {submitLabel ? submitLabel : <ArrowUp size={20} strokeWidth={3} />}
        </motion.button>
      </motion.div>
    </div>
  );
};
