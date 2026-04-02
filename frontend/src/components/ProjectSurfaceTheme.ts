import type { ProjectVisualAsset } from "@/types/portfolio";

export type SurfaceTone = ProjectVisualAsset["tone"];

export const toneClasses: Record<
  SurfaceTone,
  {
    halo: string;
    frame: string;
    accent: string;
  }
> = {
  neutral: {
    halo: "from-white/6 via-white/2 to-transparent",
    frame: "border-white/10",
    accent: "text-white/70",
  },
  cool: {
    halo: "from-cyan-400/8 via-sky-300/4 to-transparent",
    frame: "border-cyan-300/12",
    accent: "text-cyan-200",
  },
  warm: {
    halo: "from-amber-300/8 via-orange-300/4 to-transparent",
    frame: "border-amber-300/12",
    accent: "text-amber-100",
  },
  signal: {
    halo: "from-emerald-300/8 via-lime-300/4 to-transparent",
    frame: "border-emerald-300/12",
    accent: "text-[var(--color-accent)]",
  },
};

export function getToneClasses(tone: SurfaceTone) {
  return toneClasses[tone];
}
