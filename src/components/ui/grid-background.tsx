import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  className?: string;
  dotColor?: string;
  dotSize?: number;
  spacing?: number;
  backgroundColor?: string;
}

export function GridBackground({
  className,
  dotColor = "rgba(255, 255, 255, 0.14)",
  dotSize = 1.2,
  spacing = 24,
  backgroundColor = "#0b0b0b",
}: GridBackgroundProps) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        background: backgroundColor,
        backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
        backgroundSize: `${spacing}px ${spacing}px`,
        backgroundPosition: "0 0",
      }}
    />
  );
}
