import type { ReactNode } from "react";

import type { SurfaceTone } from "@/components/ProjectSurfaceTheme";
import { toneClasses } from "@/components/ProjectSurfaceTheme";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function ProjectGlassPanel({
  tone = "neutral",
  className,
  children,
  as: Tag = "section",
}: {
  tone?: SurfaceTone;
  className?: string;
  children: ReactNode;
  as?: "section" | "article" | "div";
}) {
  const surface = toneClasses[tone];

  return (
    <Tag
      className={cx(
        "group/surface relative isolate overflow-hidden rounded-[1.85rem] border bg-[color:var(--color-surface-glass)] shadow-[0_24px_64px_-48px_rgba(0,0,0,0.82)] backdrop-blur-xl transition-[border-color,transform,background-color] duration-300 motion-safe:hover:border-white/14",
        surface.frame,
        className,
      )}
    >
      <div
        className={cx(
          "pointer-events-none absolute inset-0 bg-gradient-to-br opacity-35",
          surface.halo,
        )}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.025),transparent_40%)]" />
      <div className="relative">{children}</div>
    </Tag>
  );
}

export function ProjectMetricCard({
  label,
  value,
  detail,
  className,
}: {
  label: string;
  value: string;
  detail?: string;
  className?: string;
}) {
  return (
    <article
      className={cx(
        "rounded-[1.25rem] border border-white/10 bg-white/[0.025] p-4 backdrop-blur-sm transition duration-300 motion-safe:hover:border-white/16",
        className,
      )}
    >
      <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/45">
        {label}
      </div>
      <div className="mt-3 text-lg font-semibold tracking-[-0.03em] text-white">{value}</div>
      {detail ? <p className="mt-2 text-sm leading-6 text-white/64">{detail}</p> : null}
    </article>
  );
}

export function ProjectTagList({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  return (
    <div className={cx("flex flex-wrap gap-2", className)}>
      {items.map((item) => (
        <span
          className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 font-mono text-[0.64rem] uppercase tracking-[0.18em] text-white/64"
          key={item}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
