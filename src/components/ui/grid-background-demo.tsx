import { GridBackground } from "@/components/ui/grid-background";

export default function GridBackgroundDemo() {
  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      <GridBackground />
      <div className="relative z-10 p-8 text-white">Demo content</div>
    </div>
  );
}
