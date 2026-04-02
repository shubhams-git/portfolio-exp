import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

import { ProjectGlassPanel, ProjectMetricCard, ProjectTagList } from "@/components/ProjectSurface";
import { ProjectVisual } from "@/components/ProjectVisual";
import type { Project } from "@/types/portfolio";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function QuickPreviewModal({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;

    const focusTarget = closeButtonRef.current ?? panelRef.current;
    focusTarget?.focus({ preventScroll: true });

    return () => {
      if (window.location.pathname !== "/") {
        return;
      }

      previousFocusRef.current?.focus({ preventScroll: true });
    };
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = panelRef.current?.querySelectorAll<HTMLElement>(
      [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'textarea:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ].join(", "),
    );

    if (!focusableElements || focusableElements.length === 0) {
      event.preventDefault();
      panelRef.current?.focus({ preventScroll: true });
      return;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;

    if (event.shiftKey && activeElement === firstFocusable) {
      event.preventDefault();
      lastFocusable.focus({ preventScroll: true });
      return;
    }

    if (!event.shiftKey && activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus({ preventScroll: true });
    }
  };

  return (
    <motion.div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/82 p-4 backdrop-blur-2xl sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      role="dialog"
    >
      <motion.div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        className="relative grid max-h-[92vh] w-full max-w-7xl gap-0 overflow-hidden rounded-[2rem] border border-white/10 bg-[color:var(--color-surface-glass)] shadow-[var(--shadow-panel)] outline-none backdrop-blur-2xl xl:grid-cols-[minmax(0,1.2fr)_minmax(24rem,0.8fr)]"
        initial={{ opacity: 0, y: 20, scale: 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.985 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        ref={panelRef}
        tabIndex={-1}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.1),transparent_38%),linear-gradient(135deg,rgba(255,255,255,0.06),transparent_40%,rgba(255,255,255,0.02))]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="relative min-h-0 overflow-y-auto">
          <div className="space-y-6 p-6 sm:p-8 xl:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.34em] text-white/58">
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_20px_rgba(111,251,190,0.85)]" />
                Preview // {project.index}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-white/52">
                {project.category}
              </span>
            </div>

            <div className="space-y-5">
              <h2 id={titleId} className="max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl">
                {project.name}
              </h2>
              <p
                className="max-w-3xl text-lg leading-8 text-white/72"
                id={descriptionId}
              >
                {project.preview.title}
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <ProjectGlassPanel as="article" className="p-5">
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/42">
                  Problem
                </div>
                <p className="mt-4 text-sm leading-7 text-white/72">
                  {project.preview.problemScope}
                </p>
              </ProjectGlassPanel>

              <ProjectGlassPanel as="article" className="p-5">
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/42">
                  Solution
                </div>
                <p className="mt-4 text-sm leading-7 text-white/72">
                  {project.preview.architecturalSolution}
                </p>
              </ProjectGlassPanel>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {project.preview.metrics.map((metric) => (
                <ProjectMetricCard key={metric.label} label={metric.label} value={metric.value} />
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {project.deliverySignals.map((metric) => (
                <ProjectMetricCard
                  detail={metric.detail}
                  key={metric.label}
                  label={metric.label}
                  value={metric.value}
                />
              ))}
            </div>

            <Link
              className="inline-flex items-center justify-center rounded-full border border-[color:rgba(111,251,190,0.22)] bg-[color:rgba(111,251,190,0.08)] px-5 py-3 font-mono text-xs uppercase tracking-[0.28em] text-[var(--color-accent)] transition duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:bg-[color:rgba(111,251,190,0.14)]"
              to={`/projects/${project.slug}`}
            >
              View case study
            </Link>
          </div>
        </div>

        <aside className="relative min-h-0 overflow-y-auto border-t border-white/10 bg-black/28 xl:border-l xl:border-t-0">
          <div className="space-y-6 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-mono text-xs uppercase tracking-[0.34em] text-white/45">
                  Details
                </div>
              </div>

              <button
                aria-label="Close project preview"
                className={cx(
                  "inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] px-4 font-mono text-[0.68rem] uppercase tracking-[0.3em] text-white/82 transition duration-300",
                  "motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[color:rgba(111,251,190,0.3)] motion-safe:hover:bg-white/[0.09]",
                )}
                onClick={onClose}
                ref={closeButtonRef}
                type="button"
              >
                Close
              </button>
            </div>

            <ProjectGlassPanel as="article" className="p-5">
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/42">
                Applied stack
              </div>
              <ProjectTagList className="mt-4" items={project.preview.appliedStack} />
            </ProjectGlassPanel>

            <ProjectGlassPanel as="article" className="p-5">
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/42">
                Summary
              </div>
              <p className="mt-4 text-sm leading-7 text-white/70">{project.caseStudy.headline}</p>
            </ProjectGlassPanel>

            <ProjectGlassPanel as="article" className="p-5">
              <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/42">
                Proof points
              </div>
              <div className="mt-4 space-y-3">
                {project.proofPoints.map((point, index) => (
                  <div
                    className="rounded-[1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/72"
                    key={point}
                  >
                    <div className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[var(--color-accent)]">
                      0{index + 1}
                    </div>
                    <p className="mt-2">{point}</p>
                  </div>
                ))}
              </div>
            </ProjectGlassPanel>

            <ProjectVisual className="aspect-[16/11]" project={project} />
          </div>
        </aside>
      </motion.div>
    </motion.div>
  );
}
