import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send } from "lucide-react";
import { QAMessage } from "@/lib/types";
import { askQuestion } from "@/lib/api";

interface RepoQAProps {
  owner: string;
  repo: string;
}

const SUGGESTED_QUESTIONS = [
  "When was this project first created?",
  "Who are the most active contributors?",
  "When was testing introduced?",
  "What was the most active development period?",
  "Has this project ever had a major rewrite?",
  "What technologies does this project use?",
  "When was CI/CD first set up?",
  "What phase is this project currently in?",
];

export default function RepoQA({ owner, repo }: RepoQAProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<QAMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading, isOpen]);

  async function handleAsk(questionText?: string): Promise<void> {
    const question = (questionText || inputValue).trim();
    if (!question || isLoading) return;

    const userMessage: QAMessage = {
      role: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setError(null);

    const result = await askQuestion(owner, repo, question, [
      ...messages,
      userMessage,
    ]);

    if (result.success) {
      const assistantMessage: QAMessage = {
        role: "assistant",
        content: result.answer,
        timestamp: result.timestamp,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } else {
      setError(result.error);
      // Remove the user message if request failed
      setMessages((prev) => prev.slice(0, -1));
    }

    setIsLoading(false);
  }

  return (
    <>
      {/* ===== FLOATING CHAT PANEL ===== */}
      {isOpen && (
        <div
          className="fixed bottom-24 left-6 z-50 flex flex-col rounded-xl overflow-hidden"
          style={{
            width: "360px",
            maxHeight: "520px",
            background: "#1a1a1a",
            border: "1.5px solid #2a2a2a",
            boxShadow:
              "6px 6px 0 rgba(255,217,61,0.15), 0 20px 60px rgba(0,0,0,0.6)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{
              background: "#111",
              borderBottom: "1.5px solid #2a2a2a",
            }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={14} style={{ color: "#FFD93D" }} />
              <span
                className="text-base tracking-widest"
                style={{
                  color: "#FFD93D",
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: "0.08em",
                }}
              >
                ASK THE REPO
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center w-6 h-6 rounded transition-colors hover:opacity-70"
              style={{ color: "#555" }}
            >
              <X size={14} />
            </button>
          </div>

          {/* Messages area */}
          <div
            className="flex-1 overflow-y-auto p-3 space-y-3"
            style={{ minHeight: 0 }}
          >
            {/* Suggested chips */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5 pb-1">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleAsk(q)}
                    disabled={isLoading}
                    className="px-2.5 py-1 text-xs rounded-full transition-all disabled:opacity-40"
                    style={{
                      background: "#222",
                      border: "1px solid #333",
                      color: "#aaa",
                      fontFamily: "'DM Sans', sans-serif",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "rgba(255,217,61,0.1)";
                      e.currentTarget.style.borderColor =
                        "rgba(255,217,61,0.4)";
                      e.currentTarget.style.color = "#FFD93D";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#222";
                      e.currentTarget.style.borderColor = "#333";
                      e.currentTarget.style.color = "#aaa";
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Message bubbles */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className="text-xs mb-1 px-1"
                  style={{
                    color: "#555",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {msg.role === "user" ? "You" : "AI"}
                </div>
                <div
                  className="rounded-2xl px-3 py-2 text-xs leading-relaxed"
                  style={
                    msg.role === "user"
                      ? {
                          background: "#FFD93D",
                          color: "#0f0f0f",
                          borderRadius: "14px 14px 4px 14px",
                          maxWidth: "85%",
                          fontFamily: "'DM Sans', sans-serif",
                          fontWeight: 600,
                        }
                      : {
                          background: "#242424",
                          color: "#c4c4c4",
                          borderRadius: "14px 14px 14px 4px",
                          maxWidth: "90%",
                          fontFamily: "'DM Sans', sans-serif",
                          border: "1px solid #2a2a2a",
                        }
                  }
                >
                  {msg.content}
                </div>
                <div
                  className="text-xs mt-0.5 px-1"
                  style={{ color: "#444", fontFamily: "'DM Sans', sans-serif" }}
                >
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex flex-col items-start">
                <div
                  className="text-xs mb-1 px-1"
                  style={{ color: "#555", fontFamily: "'DM Sans', sans-serif" }}
                >
                  AI
                </div>
                <div
                  className="flex items-center gap-1 px-3 py-2 rounded-2xl"
                  style={{
                    background: "#242424",
                    border: "1px solid #2a2a2a",
                    borderRadius: "14px 14px 14px 4px",
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "#FFD93D", animationDelay: "0ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "#FFD93D", animationDelay: "150ms" }}
                  />
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{ background: "#FFD93D", animationDelay: "300ms" }}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Error banner */}
          {error && (
            <div
              className="flex items-center justify-between gap-2 mx-3 mb-2 px-3 py-2 rounded-lg text-xs flex-shrink-0"
              style={{
                background: "rgba(255,100,100,0.08)",
                border: "1px solid rgba(255,100,100,0.25)",
                color: "#ff8080",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="font-bold text-sm leading-none flex-shrink-0 hover:opacity-70"
              >
                ×
              </button>
            </div>
          )}

          {/* Input row */}
          <div
            className="flex gap-2 p-3 flex-shrink-0"
            style={{ borderTop: "1.5px solid #2a2a2a" }}
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="Ask anything..."
              disabled={isLoading}
              maxLength={500}
              className="flex-1 px-3 py-2 rounded-lg text-xs disabled:opacity-50 focus:outline-none"
              style={{
                background: "#111",
                border: "1.5px solid #333",
                color: "#e0e0e0",
                fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={(e) =>
                (e.currentTarget.style.borderColor = "rgba(255,217,61,0.5)")
              }
              onBlur={(e) => (e.currentTarget.style.borderColor = "#333")}
            />
            <button
              onClick={() => handleAsk()}
              disabled={isLoading || !inputValue.trim()}
              className="flex items-center justify-center w-9 h-9 rounded-lg transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "#FFD93D",
                color: "#0f0f0f",
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled)
                  e.currentTarget.style.background = "#ffe566";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#FFD93D";
              }}
            >
              <Send size={14} />
            </button>
          </div>

          {/* Char count */}
          {inputValue.length > 400 && (
            <div
              className="pb-2 px-3 text-xs text-right flex-shrink-0"
              style={{ color: "#555", fontFamily: "'DM Sans', sans-serif" }}
            >
              {500 - inputValue.length} remaining
            </div>
          )}
        </div>
      )}

      {/* ===== FAB ===== */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:-translate-y-1"
        style={{
          background: isOpen ? "rgba(255,217,61,0.15)" : "#1a1a1a",
          border: "2px solid #FFD93D",
          boxShadow: isOpen
            ? "3px 3px 0 rgba(255,217,61,0.4)"
            : "3px 3px 0 rgba(255,217,61,0.3)",
          color: "#FFD93D",
        }}
        title="Ask about this repository"
      >
        {isOpen ? <X size={18} /> : <MessageCircle size={18} />}
      </button>
    </>
  );
}
