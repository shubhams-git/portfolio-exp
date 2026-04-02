import type { Project } from "@/types/portfolio";

import { getToneClasses } from "@/components/ProjectSurfaceTheme";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function ProjectVisual({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const tone = getToneClasses(project.visual.tone);
  const imageStyle = {
    objectPosition: project.visual.objectPosition ?? "50% 50%",
    transform: `scale(${project.visual.zoom ?? 1})`,
  };

  return (
    <div
      aria-label={project.visual.alt}
      role="img"
      className={cx(
        "relative isolate overflow-hidden rounded-[1.75rem] border border-white/10 bg-[color:rgba(255,255,255,0.015)] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.85)]",
        "aspect-[4/3] w-full",
        className,
      )}
    >
      <img
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-[0.94]"
        src={project.visual.assetUrl}
        style={imageStyle}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.04),rgba(5,5,5,0.28)_100%),linear-gradient(135deg,rgba(255,255,255,0.03),transparent_48%,rgba(255,255,255,0.02))]" />
      <div
        className={cx(
          "absolute inset-0 bg-gradient-to-br opacity-[0.12]",
          tone.halo,
        )}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_52%,transparent_28%,rgba(0,0,0,0.22)_100%)]" />
      <div className="absolute inset-0 ring-1 ring-inset ring-white/6" />
    </div>
  );
}
