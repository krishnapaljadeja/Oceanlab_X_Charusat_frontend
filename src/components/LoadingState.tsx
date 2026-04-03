import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const STEPS = [
  { label: "Fetching commits", color: "#FFD93D", duration: 4 },
  { label: "Classifying changes", color: "#4CC9F0", duration: 9 },
  { label: "Building phases", color: "#6BCB77", duration: 6 },
  { label: "Generating story...", color: "#FF6B9D", duration: 16 },
];

// All 4 nodes sit on the LEFT side (cx≈50) except the last (cx≈330)
// Label goes RIGHT when cx < 190, LEFT when cx >= 190
const CIRCLE_POSITIONS = [
  { cx: 50, cy: 40 },
  { cx: 50, cy: 220 },
  { cx: 50, cy: 310 },
  { cx: 330, cy: 440 },
];

const PATH_D =
  "M 50 40 C 180 40, 300 40, 330 70 C 360 100, 360 130, 330 160 C 300 190, 80 190, 50 220 C 20 250, 20 280, 50 310 C 80 340, 300 340, 330 370 C 360 400, 360 420, 330 440";

export default function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);
  const [visibleLabels, setVisibleLabels] = useState<boolean[]>([
    true,
    false,
    false,
    false,
  ]);
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!pathRef.current) return;
      const length = pathRef.current.getTotalLength();
      gsap.set(pathRef.current, {
        strokeDasharray: length,
        strokeDashoffset: length,
      });

      // Build a timeline where each segment duration matches each step's duration.
      // At the end of each segment, advance the step indicator.
      const tl = gsap.timeline();
      STEPS.forEach((step, i) => {
        const fraction = (i + 1) / STEPS.length;
        tl.to(pathRef.current!, {
          strokeDashoffset: length * (1 - fraction),
          duration: step.duration,
          ease: "none",
        });
        // When this segment finishes, show next label and advance step counter
        if (i < STEPS.length - 1) {
          tl.call(() => {
            setCurrentStep(i + 1);
            setVisibleLabels((prev) => {
              const next = [...prev];
              next[i + 1] = true;
              return next;
            });
          });
        }
      });
    },
    { scope: containerRef },
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center justify-center w-full px-6 py-8"
    >
      {/* Title */}
      <div className="mb-8 text-center">
        <h2
          className="text-5xl text-white mb-2"
          style={{
            fontFamily: "'Bebas Neue', cursive",
            letterSpacing: "0.06em",
          }}
        >
          ANALYZING REPO
        </h2>
        <p
          className="text-gray-500 text-sm"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          This may take a few minutes for large repositories
        </p>
      </div>

      {/* Board game SVG path */}
      <div className="relative w-full max-w-sm" style={{ height: 460 }}>
        <svg
          viewBox="0 0 500 460"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* Background track */}
          <path
            d={PATH_D}
            stroke="#2a2a2a"
            strokeWidth="14"
            strokeLinecap="round"
            fill="none"
          />
          {/* Animated fill */}
          <path
            ref={pathRef}
            d={PATH_D}
            stroke="#FFD93D"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />

          {/* Step nodes + labels */}
          {STEPS.map((step, i) => {
            const pos = CIRCLE_POSITIONS[i];
            const active = i <= currentStep;
            // Put label to the right if node is on left side, left if on right side
            const labelRight = pos.cx < 190;
            const LABEL_W = 190;
            const LABEL_H = 30;
            const labelX = labelRight ? pos.cx + 26 : pos.cx - 26 - LABEL_W;
            const textX = labelRight
              ? labelX + LABEL_W / 2
              : labelX + LABEL_W / 2;

            return (
              <g key={step.label}>
                {/* Circle */}
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r="18"
                  fill={active ? step.color : "#1a1a1a"}
                  stroke={active ? step.color : "#3a3a3a"}
                  strokeWidth="2"
                  style={{ transition: "fill 0.5s, stroke 0.5s" }}
                />
                <text
                  x={pos.cx}
                  y={pos.cy + 5}
                  textAnchor="middle"
                  fill={active ? "#000" : "#555"}
                  fontSize="13"
                  fontWeight="bold"
                  fontFamily="'Bebas Neue', cursive"
                  style={{ transition: "fill 0.5s" }}
                >
                  {i + 1}
                </text>

                {/* Label card – only shown once step is reached */}
                {visibleLabels[i] && (
                  <g>
                    <rect
                      x={labelX}
                      y={pos.cy - LABEL_H / 2}
                      width={LABEL_W}
                      height={LABEL_H}
                      rx="6"
                      fill="#1a1a1a"
                      stroke={step.color}
                      strokeWidth="1.5"
                    />
                    <text
                      x={textX}
                      y={pos.cy + 5}
                      textAnchor="middle"
                      fill={step.color}
                      fontSize="10"
                      fontFamily="'Bebas Neue', cursive"
                      letterSpacing="1.2"
                    >
                      {step.label.toUpperCase()}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom progress */}
      <div className="mt-4 text-center">
        <p
          className="text-sm text-gray-400"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Step{" "}
          <span style={{ color: "var(--accent-yellow)", fontWeight: 700 }}>
            {currentStep + 1}
          </span>{" "}
          of {STEPS.length} —{" "}
          <span style={{ color: "var(--accent-cyan)" }}>
            {STEPS[currentStep].label}
          </span>
        </p>
        <div className="flex gap-2 justify-center mt-3">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === currentStep ? 28 : 8,
                height: 8,
                background: i <= currentStep ? step.color : "#2a2a2a",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
