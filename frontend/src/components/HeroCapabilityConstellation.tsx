import { useEffect, useRef, useState } from "react";

import { Cloud, Code2, Server, Sparkles } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { ProjectGlassPanel } from "@/components/ProjectSurface";
import type { ProjectVisualAsset } from "@/types/portfolio";

export type CapabilityRoute = {
  id: string;
  title: string;
  summary: string;
  signal: string;
  tools: string[];
  reference: string;
  href: string;
  tone: ProjectVisualAsset["tone"];
};

type OrbitLayoutPoint = {
  x: number;
  y: number;
  anchorX: number;
  anchorY: number;
  angle: number;
};

const desktopLayout: OrbitLayoutPoint[] = [
  { x: 50, y: 18, anchorX: 50, anchorY: 30, angle: -90 },
  { x: 82, y: 50, anchorX: 70, anchorY: 50, angle: 0 },
  { x: 50, y: 82, anchorX: 50, anchorY: 70, angle: 90 },
  { x: 18, y: 50, anchorX: 30, anchorY: 50, angle: 180 },
];

const compactLayout: OrbitLayoutPoint[] = [
  { x: 50, y: 20, anchorX: 50, anchorY: 32, angle: -90 },
  { x: 79, y: 50, anchorX: 67, anchorY: 50, angle: 0 },
  { x: 50, y: 80, anchorX: 50, anchorY: 68, angle: 90 },
  { x: 21, y: 50, anchorX: 33, anchorY: 50, angle: 180 },
];

const mediumLayout: OrbitLayoutPoint[] = [
  { x: 50, y: 17, anchorX: 50, anchorY: 30, angle: -90 },
  { x: 82, y: 50, anchorX: 69, anchorY: 50, angle: 0 },
  { x: 50, y: 83, anchorX: 50, anchorY: 70, angle: 90 },
  { x: 18, y: 50, anchorX: 31, anchorY: 50, angle: 180 },
];

type OrbitLayoutMode = "wide" | "medium" | "small";

const toneStroke: Record<ProjectVisualAsset["tone"], string> = {
  neutral: "rgba(255,255,255,0.72)",
  cool: "rgba(125,211,252,0.95)",
  warm: "rgba(251,191,36,0.92)",
  signal: "rgba(111,251,190,0.96)",
};

const toneGlow: Record<ProjectVisualAsset["tone"], string> = {
  neutral: "rgba(255,255,255,0.16)",
  cool: "rgba(125,211,252,0.2)",
  warm: "rgba(251,191,36,0.18)",
  signal: "rgba(111,251,190,0.2)",
};

const toneSurface: Record<ProjectVisualAsset["tone"], string> = {
  neutral: "rgba(255,255,255,0.05)",
  cool: "rgba(125,211,252,0.08)",
  warm: "rgba(251,191,36,0.08)",
  signal: "rgba(111,251,190,0.08)",
};

const routeIcons = {
  frontend: Code2,
  backend: Server,
  cloud: Cloud,
  ai: Sparkles,
} as const;

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function createSignalPath(target: OrbitLayoutPoint) {
  const middleX = (50 + target.anchorX) / 2;
  const middleY = (50 + target.anchorY) / 2;
  const curveAngle = ((target.angle - 90) * Math.PI) / 180;
  const controlX = middleX + Math.cos(curveAngle) * 6.5;
  const controlY = middleY + Math.sin(curveAngle) * 6.5;

  return `M 50 50 Q ${controlX} ${controlY} ${target.anchorX} ${target.anchorY}`;
}

function getRouteCaption(signal: string) {
  return signal.split("/")[0]?.trim() ?? signal;
}

export function HeroCapabilityConstellation({
  routes,
}: {
  routes: CapabilityRoute[];
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const defaultIndex = Math.max(
    0,
    routes.findIndex((route) => route.id === "backend"),
  );
  const [activeIndex, setActiveIndex] = useState(defaultIndex);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [layoutMode, setLayoutMode] = useState<OrbitLayoutMode>(() => {
    if (typeof window === "undefined") {
      return "wide";
    }

    if (window.innerWidth < 440) {
      return "small";
    }

    if (window.innerWidth < 620) {
      return "medium";
    }

    return "wide";
  });

  const visibleRoutes = routes.slice(0, desktopLayout.length);
  const isSmallOrbit = layoutMode === "small";
  const isMediumOrbit = layoutMode === "medium";
  const orbitLayout =
    layoutMode === "small"
      ? compactLayout
      : layoutMode === "medium"
        ? mediumLayout
        : desktopLayout;
  const activeRoute = visibleRoutes[activeIndex] ?? visibleRoutes[0];
  const activeOrbit = orbitLayout[activeIndex] ?? orbitLayout[0];
  const coreOffsetX = reducedMotion ? 0 : ((activeOrbit?.anchorX ?? 50) - 50) * 0.12;
  const coreOffsetY = reducedMotion ? 0 : ((activeOrbit?.anchorY ?? 50) - 50) * 0.12;
  const stageHeightClass = isSmallOrbit
    ? "h-[18rem]"
    : isMediumOrbit
      ? "h-[18.75rem]"
      : "h-[17.75rem] sm:h-[19rem] lg:h-[20rem]";
  const nodeClassName = isSmallOrbit
    ? "w-[5.75rem] rounded-[1rem] px-2.5 py-2"
    : isMediumOrbit
      ? "w-[6.6rem] rounded-[1.1rem] px-2.5 py-2.5"
      : "w-[7.6rem] rounded-[1.25rem] px-3 py-2.5 sm:w-[8.8rem] sm:px-4 sm:py-3";
  const nodeTitleClassName = isSmallOrbit
    ? "text-[0.88rem]"
    : isMediumOrbit
      ? "text-[0.94rem]"
      : "text-[0.98rem]";
  const nodeSignalClassName = isSmallOrbit
    ? "text-[0.48rem] tracking-[0.16em]"
    : isMediumOrbit
      ? "text-[0.54rem] tracking-[0.18em]"
      : "text-[0.6rem] tracking-[0.22em]";
  const nodeIndicatorClassName = isSmallOrbit ? "w-7" : isMediumOrbit ? "w-8" : "w-9";
  const iconWrapperClassName = isSmallOrbit ? "h-8 w-8" : "h-9 w-9";
  const coreClassName = isSmallOrbit
    ? "h-24 w-24"
    : isMediumOrbit
      ? "h-28 w-28"
      : "h-32 w-32 sm:h-36 sm:w-36";
  const coreTitleClassName = isSmallOrbit
    ? "text-[1.25rem]"
    : isMediumOrbit
      ? "text-[1.42rem]"
      : "text-[1.45rem] sm:text-[1.7rem]";
  const glowSize = isSmallOrbit ? "8.5rem" : isMediumOrbit ? "9.5rem" : "10rem";
  const innerOrbitClassName = isSmallOrbit
    ? "h-[60%] w-[60%]"
    : isMediumOrbit
      ? "h-[62%] w-[62%]"
      : "h-[56%] w-[56%]";
  const outerOrbitClassName = isSmallOrbit
    ? "h-[78%] w-[78%]"
    : isMediumOrbit
      ? "h-[75%] w-[75%]"
      : "h-[72%] w-[72%]";

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const resolveLayoutMode = (width: number): OrbitLayoutMode => {
      if (width < 440) {
        return "small";
      }

      if (width < 620) {
        return "medium";
      }

      return "wide";
    };

    const updateFromWidth = (width: number) => {
      setLayoutMode(resolveLayoutMode(width));
    };

    const node = containerRef.current;
    const fallbackUpdate = () =>
      updateFromWidth(node?.clientWidth ?? window.innerWidth);

    fallbackUpdate();

    if (node && typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver((entries) => {
        const width = entries[0]?.contentRect.width ?? node.clientWidth;
        updateFromWidth(width);
      });

      observer.observe(node);
      return () => observer.disconnect();
    }

    window.addEventListener("resize", fallbackUpdate);
    return () => window.removeEventListener("resize", fallbackUpdate);
  }, []);

  useEffect(() => {
    if (reducedMotion || hasInteracted || visibleRoutes.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visibleRoutes.length);
    }, 3800);

    return () => window.clearInterval(interval);
  }, [hasInteracted, reducedMotion, visibleRoutes.length]);

  if (!activeRoute || !activeOrbit) {
    return null;
  }

  const activeToneStroke = toneStroke[activeRoute.tone];
  const activeToneGlow = toneGlow[activeRoute.tone];
  const activeToneSurface = toneSurface[activeRoute.tone];
  const activePath = createSignalPath(activeOrbit);

  return (
    <div className="mx-auto w-full max-w-[34rem] xl:ml-auto xl:mr-0 xl:max-w-[35rem]" ref={containerRef}>
      <ProjectGlassPanel
        className="w-full p-4 sm:p-5 xl:p-6"
        tone="neutral"
      >
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between gap-4">
            <div className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-white/34">
              Capability orbit
            </div>
            <div className="hidden text-[0.68rem] text-white/28 sm:block">Select a route</div>
          </div>

          <div className="relative overflow-hidden rounded-[1.9rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.028),rgba(255,255,255,0.01))]">
            <div className="relative overflow-hidden px-4 pt-4 sm:px-5 sm:pt-5">
              <motion.div
                animate={{ left: `${activeOrbit.anchorX}%`, top: `${activeOrbit.anchorY}%` }}
                className="pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                style={{
                  height: glowSize,
                  background: `radial-gradient(circle, ${activeToneGlow} 0%, transparent 74%)`,
                  width: glowSize,
                }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.025),transparent_48%)]" />
              <div className="pointer-events-none absolute inset-[10%] rounded-full border border-white/[0.04]" />
              <div className="pointer-events-none absolute inset-[22%] rounded-full border border-white/[0.05]" />
              <div className="pointer-events-none absolute inset-x-[18%] top-1/2 h-px -translate-y-1/2 bg-white/[0.04]" />
              <div className="pointer-events-none absolute inset-y-[18%] left-1/2 w-px -translate-x-1/2 bg-white/[0.03]" />

              <div className={cx("relative", stageHeightClass)}>
              <motion.div
                animate={reducedMotion ? undefined : { rotate: 360 }}
                className={cx(
                  "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full",
                  outerOrbitClassName,
                )}
                style={{
                  background: `conic-gradient(from 0deg, transparent 0deg, transparent 278deg, ${activeToneGlow} 320deg, transparent 360deg)`,
                  WebkitMaskImage:
                    "radial-gradient(circle, transparent 59%, black 63%, transparent 69%)",
                  maskImage: "radial-gradient(circle, transparent 59%, black 63%, transparent 69%)",
                }}
                transition={{ duration: 18, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                animate={reducedMotion ? undefined : { rotate: -360 }}
                className={cx(
                  "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.05]",
                  innerOrbitClassName,
                )}
                transition={{ duration: 24, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
              >
                <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/28" />
              </motion.div>
              <motion.div
                animate={reducedMotion ? undefined : { rotate: 360 }}
                className={cx(
                  "pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.04]",
                  outerOrbitClassName,
                )}
                transition={{ duration: 30, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
              >
                <span
                  className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                  style={{ backgroundColor: activeToneStroke, boxShadow: `0 0 18px ${activeToneGlow}` }}
                />
              </motion.div>

              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <circle cx="50" cy="50" fill="none" r="20" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
                <circle
                  cx="50"
                  cy="50"
                  fill="none"
                  r="30"
                  stroke="rgba(255,255,255,0.06)"
                  strokeDasharray="1.6 1.8"
                  strokeWidth="0.35"
                />
                <motion.g
                  animate={{ rotate: activeOrbit.angle + 90 }}
                  style={{ transformOrigin: "50% 50%" }}
                  transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <circle
                    cx="50"
                    cy="50"
                    fill="none"
                    r="30"
                    stroke={activeToneStroke}
                    strokeDasharray="24 180"
                    strokeLinecap="round"
                    strokeWidth="0.8"
                  />
                </motion.g>
                <path
                  d={activePath}
                  fill="none"
                  opacity="0.14"
                  stroke={activeToneStroke}
                  strokeLinecap="round"
                  strokeWidth="0.8"
                />
                <motion.path
                  animate={{ pathLength: 1, opacity: 1 }}
                  d={activePath}
                  fill="none"
                  initial={{ pathLength: 0, opacity: 0.18 }}
                  key={activeRoute.id}
                  stroke={activeToneStroke}
                  strokeLinecap="round"
                  strokeWidth="1.2"
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.circle
                  animate={{ cx: activeOrbit.anchorX, cy: activeOrbit.anchorY, opacity: [0, 1, 1, 0.3] }}
                  fill={activeToneStroke}
                  initial={{ cx: 50, cy: 50, opacity: 0 }}
                  key={`${activeRoute.id}-pulse`}
                  r="1.35"
                  transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                />
              </svg>

              <motion.div
                animate={{ x: coreOffsetX, y: coreOffsetY, scale: reducedMotion ? 1 : [1, 1.02, 1] }}
                className="absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2"
                transition={{
                  x: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                  y: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
                  scale: { duration: 3.8, ease: "easeInOut", repeat: Number.POSITIVE_INFINITY },
                }}
              >
                <div
                  className={cx(
                    "relative flex items-center justify-center rounded-full border border-white/10 bg-[radial-gradient(circle_at_50%_24%,rgba(255,255,255,0.08),transparent_38%),rgba(8,8,8,0.94)] shadow-[0_26px_60px_-38px_rgba(0,0,0,0.9)]",
                    coreClassName,
                  )}
                  style={{ boxShadow: `0 26px 60px -38px rgba(0,0,0,0.9), 0 0 32px ${activeToneGlow}` }}
                >
                  <div className={cx("absolute rounded-full border border-white/[0.06]", isSmallOrbit ? "inset-[0.55rem]" : "inset-[0.65rem]")} />
                  <div className={cx("absolute rounded-full border border-white/[0.04]", isSmallOrbit ? "inset-[0.9rem]" : "inset-[1.05rem]")} />
                  <div className="text-center">
                    <div className={cx("font-mono uppercase text-white/30", isSmallOrbit ? "text-[0.48rem] tracking-[0.22em]" : "text-[0.52rem] tracking-[0.28em]")}>
                      Full-stack
                    </div>
                    <div className={cx("mt-2 font-semibold tracking-[-0.06em] text-white", coreTitleClassName)}>
                      Delivery
                    </div>
                  </div>
                </div>
              </motion.div>

              {visibleRoutes.map((route, index) => {
                const orbitPoint = orbitLayout[index];
                const isActive = route.id === activeRoute.id;
                const Icon = routeIcons[route.id as keyof typeof routeIcons] ?? Code2;

                return (
                  <motion.button
                    aria-pressed={isActive}
                    className={cx(
                      "absolute z-[3] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center transition duration-300",
                      nodeClassName,
                      isActive
                        ? "border-white/16 bg-[rgba(16,16,16,0.94)]"
                        : "border-white/10 bg-[rgba(11,11,11,0.86)] hover:border-white/16 hover:bg-[rgba(15,15,15,0.94)]",
                    )}
                    key={route.id}
                    onClick={() => {
                      setHasInteracted(true);
                      setActiveIndex(index);
                    }}
                    onFocus={() => {
                      setHasInteracted(true);
                      setActiveIndex(index);
                    }}
                    onMouseEnter={() => {
                      setHasInteracted(true);
                      setActiveIndex(index);
                    }}
                    style={{
                      left: `${orbitPoint.x}%`,
                      top: `${orbitPoint.y}%`,
                      backgroundImage: isActive
                        ? `linear-gradient(180deg, ${activeToneSurface}, rgba(12,12,12,0.96))`
                        : undefined,
                      boxShadow: isActive ? `0 18px 34px -28px rgba(0,0,0,0.92), 0 0 0 1px ${activeToneGlow}` : undefined,
                    }}
                    type="button"
                    whileHover={reducedMotion ? undefined : { y: -3, scale: 1.02 }}
                  >
                      <div
                        className={cx(
                          "flex items-center justify-center rounded-full border",
                          iconWrapperClassName,
                          isActive ? "border-white/18 bg-white/[0.05]" : "border-white/10 bg-white/[0.025]",
                        )}
                      >
                      <Icon
                        className="h-4.5 w-4.5"
                        style={{
                          color: isActive ? activeToneStroke : "rgba(255,255,255,0.46)",
                        }}
                      />
                    </div>
                    <div className={cx("mt-2 font-medium tracking-[-0.04em] text-white", nodeTitleClassName)}>
                      {route.title}
                    </div>
                    <div className={cx("mt-1 uppercase text-white/34", nodeSignalClassName)}>
                      {getRouteCaption(route.signal)}
                    </div>
                    <div
                      className={cx(
                        "mt-2 h-1.5 rounded-full transition duration-300",
                        nodeIndicatorClassName,
                        isActive ? "opacity-100" : "opacity-24",
                      )}
                      style={{ backgroundColor: isActive ? activeToneStroke : "rgba(255,255,255,0.16)" }}
                    />
                  </motion.button>
                );
              })}
              </div>
            </div>

            <div className="border-t border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(0,0,0,0.22))] px-4 py-3.5 sm:px-5 sm:py-4">
              <AnimatePresence mode="wait">
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  initial={{ opacity: 0, y: 8 }}
                  key={activeRoute.id}
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="font-mono text-[0.56rem] uppercase tracking-[0.24em] text-white/34">
                        {activeRoute.signal}
                      </div>
                      <h3 className="mt-1.5 text-xl font-semibold tracking-[-0.05em] text-white sm:text-[1.35rem]">
                        {activeRoute.title}
                      </h3>
                    </div>
                    <div className="shrink-0 text-xs text-white/40 sm:text-sm">{activeRoute.reference}</div>
                  </div>
                  <p className="mt-2.5 max-w-[26rem] text-sm leading-6 text-white/62">{activeRoute.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {activeRoute.tools.slice(0, 3).map((tool) => (
                      <span
                        className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-white/60"
                        key={tool}
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </ProjectGlassPanel>
    </div>
  );
}
