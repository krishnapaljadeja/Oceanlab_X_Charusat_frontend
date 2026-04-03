import { X, AlertCircle } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export default function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div
      className="w-full max-w-2xl mx-auto mt-4 p-4 rounded-xl flex items-start gap-3"
      style={{
        background: "rgba(255,107,157,0.1)",
        border: "2px solid #FF6B9D",
        boxShadow: "4px 4px 0 rgba(255,107,157,0.3)",
      }}
    >
      <AlertCircle
        size={18}
        className="flex-shrink-0 mt-0.5"
        style={{ color: "#FF6B9D" }}
      />
      <div className="flex-1">
        <p
          className="text-sm"
          style={{ color: "#FF6B9D", fontFamily: "'DM Sans', sans-serif" }}
        >
          {message}
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="transition-opacity hover:opacity-70"
        style={{ color: "#FF6B9D" }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
