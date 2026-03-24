import { useEffect, useId, useRef } from "react";
import type { KeyboardEvent } from "react";
import { Link } from "react-router-dom";

import type { Project } from "@/types/portfolio";

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
    <div
      aria-modal="true"
      className="preview-modal"
      onClick={onClose}
      role="dialog"
    >
      <div
        aria-describedby={descriptionId}
        aria-labelledby={titleId}
        className="preview-modal__panel"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        ref={panelRef}
        tabIndex={-1}
      >
        <div className="preview-modal__main">
          <div className="preview-modal__eyebrow">Project Preview // {project.index}</div>
          <h2 className="preview-modal__title" id={titleId}>
            {project.name}
          </h2>
          <p className="preview-modal__lede" id={descriptionId}>
            {project.preview.title}
          </p>

          <section className="preview-modal__section">
            <h3>Problem Scope</h3>
            <p>{project.preview.problemScope}</p>
          </section>

          <section className="preview-modal__section">
            <h3>Architectural Solution</h3>
            <p>{project.preview.architecturalSolution}</p>
          </section>

          <Link
            className="action-button action-button--primary preview-modal__cta"
            to={`/projects/${project.slug}`}
          >
            [View Technical Deep-Dive]
          </Link>
        </div>

        <aside className="preview-modal__side">
          <button
            aria-label="Close project preview"
            className="preview-modal__close"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            Close
          </button>

          <section className="preview-modal__metrics">
            <h3>Core Performance Metrics</h3>
            <div className="preview-modal__metric-list">
              {project.preview.metrics.map((metric) => (
                <div className="preview-modal__metric" key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                </div>
              ))}
            </div>
          </section>

          <section className="preview-modal__stack">
            <h3>Applied Stack</h3>
            <div className="preview-modal__tags">
              {project.preview.appliedStack.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </section>

          <div className={`preview-modal__image preview-modal__image--${project.slug}`}>
            <img
              alt={project.visual.alt}
              className="preview-modal__image-asset"
              src={project.visual.assetUrl}
            />
            <div className="preview-modal__image-grid" />
          </div>
        </aside>
      </div>
    </div>
  );
}
