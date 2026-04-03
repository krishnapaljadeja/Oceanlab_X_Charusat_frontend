import { cn } from "@/lib/utils";

interface BoxGridBackgroundProps {
  className?: string;
  lineColor?: string;
  cellSize?: number;
  backgroundColor?: string;
}

export function BoxGridBackground({
  className,
  lineColor = "rgba(255, 255, 255, 0.06)",
  cellSize = 40,
  backgroundColor = "#0b0b0b",
}: BoxGridBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundColor,
        backgroundImage: `
          linear-gradient(to right, ${lineColor} 1px, transparent 1px),
          linear-gradient(to bottom, ${lineColor} 1px, transparent 1px)
        `,
        backgroundSize: `${cellSize}px ${cellSize}px`,
        backgroundPosition: "0 0",
      }}
    />
  );
}
