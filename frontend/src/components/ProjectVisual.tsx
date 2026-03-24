import type { Project } from "@/types/portfolio";

export function ProjectVisual({ project }: { project: Project }) {
  return (
    <div
      aria-hidden="true"
      className={`project-card__visual project-card__visual--${project.slug} project-card__visual--${project.visual.tone}`}
    >
      <img
        alt=""
        className="project-card__visual-image"
        src={project.visual.assetUrl}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />
      <div className="project-card__visual-grid" />
      <div className="project-card__visual-orb" />
      <div className="project-card__visual-line project-card__visual-line--one" />
      <div className="project-card__visual-line project-card__visual-line--two" />
      <div className="project-card__visual-line project-card__visual-line--three" />
    </div>
  );
}
