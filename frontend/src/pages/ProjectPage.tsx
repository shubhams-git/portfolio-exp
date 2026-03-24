import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";

import { ProjectVisual } from "@/components/ProjectVisual";
import { SectionLabel } from "@/components/SectionLabel";
import { portfolioContent } from "@/content/portfolio-content";
import { getAdjacentProjects, getProjectBySlug } from "@/lib/portfolio";
import { setDocumentMetadata } from "@/lib/seo";

export function ProjectPage() {
  const { slug } = useParams();
  const project = getProjectBySlug(slug);

  useEffect(() => {
    if (!project) {
      return;
    }

    setDocumentMetadata({
      title: `${project.name} | ${portfolioContent.siteTitle}`,
      description: project.caseStudy.seoDescription,
      canonical: `/projects/${project.slug}`,
      image: project.visual.assetUrl,
      imageAlt: project.visual.alt,
      siteName: portfolioContent.siteTitle,
      type: "article",
    });
  }, [project]);

  if (!project) {
    return <Navigate replace to="/" />;
  }

  const { previousProject, nextProject } = getAdjacentProjects(project.slug);

  return (
    <main className="project-page" id="main-content">
      <section className="section project-page__hero">
        <div className="section__inner">
          <div className="project-page__hero-grid">
            <div className="project-page__hero-main">
              <SectionLabel>[Project Deep-Dive // {project.index}]</SectionLabel>
              <h1 className="project-page__title">
                {project.name}
                <span>{project.category}</span>
              </h1>
              <p className="project-page__headline">{project.caseStudy.headline}</p>
            </div>

            <aside className="project-page__hero-side">
              <div className="project-page__meta-card">
                <div>
                  <span>Role</span>
                  <strong>{project.role}</strong>
                </div>
                <div>
                  <span>Core Stack</span>
                  <strong>{project.coreStack.join(" / ")}</strong>
                </div>
                <div>
                  <span>Impact</span>
                  <strong>{project.impact}</strong>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <div className="project-page__overview-grid">
            <article className="project-page__overview-card">
              <h2>Project Context</h2>
              <p>{project.caseStudy.overview}</p>
            </article>

            <article className="project-page__challenge-card">
              <h2>Recruiter Readout</h2>
              <ul>
                {project.caseStudy.recruiterHighlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className="project-page__challenge-strip">
            <article className="project-page__challenge-card">
              <h2>The Challenge</h2>
              <ul>
                {project.caseStudy.challenge.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </div>

          <div className="project-page__metrics">
            {project.preview.metrics.map((metric) => (
              <article className="project-page__metric-card" key={metric.label}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <div className="project-page__section-head">
            <div>
              <SectionLabel>[Architecture]</SectionLabel>
              <h2 className="section-heading">System Topology</h2>
            </div>
            <p className="project-page__section-copy">{project.caseStudy.architectureSummary}</p>
          </div>

          <div className="project-page__architecture">
            <div className="project-page__visual-panel">
              <ProjectVisual project={project} />
            </div>
            <div className="project-page__layer-list">
              {project.caseStudy.architectureLayers.map((layer) => (
                <article className="project-page__layer-card" key={layer.label}>
                  <span>{layer.label}</span>
                  <p>{layer.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <div className="project-page__section-head">
            <div>
              <SectionLabel>[Code Focus]</SectionLabel>
              <h2 className="section-heading">Implementation Detail</h2>
            </div>
            <p className="project-page__section-copy">{project.caseStudy.imageCaption}</p>
          </div>

          <div className="project-page__code-grid">
            <article className="project-page__code-note">
              <h3>{project.name} Implementation</h3>
              <p>
                The code sample below reflects the slice of engineering work most worth surfacing on
                a recruiter-facing deep-dive page: state handling, orchestration discipline, and
                clarity of system boundaries.
              </p>
            </article>

            <article className="project-page__code-block">
              <div className="project-page__code-header">{project.caseStudy.codeFile}</div>
              <pre>
                <code>{project.caseStudy.codeSnippet}</code>
              </pre>
            </article>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <div className="project-page__image-stage">
            <div className={`preview-modal__image preview-modal__image--${project.slug}`}>
              <img
                alt={project.visual.alt}
                className="project-page__image-asset"
                src={project.visual.assetUrl}
              />
              <div className="preview-modal__image-grid" />
            </div>
            <p className="project-page__image-caption">{project.caseStudy.imageCaption}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section__inner">
          <nav className="project-page__nav">
            {previousProject ? (
              <Link className="project-page__nav-link" to={`/projects/${previousProject.slug}`}>
                <span>Previous Project</span>
                <strong>{previousProject.name}</strong>
              </Link>
            ) : (
              <div className="project-page__nav-link project-page__nav-link--disabled">
                <span>Previous Project</span>
                <strong>None</strong>
              </div>
            )}

            <Link className="project-page__nav-link project-page__nav-link--center" to="/#work">
              <span>Return</span>
              <strong>Project Matrix</strong>
            </Link>

            {nextProject ? (
              <Link className="project-page__nav-link" to={`/projects/${nextProject.slug}`}>
                <span>Next Project</span>
                <strong>{nextProject.name}</strong>
              </Link>
            ) : (
              <div className="project-page__nav-link project-page__nav-link--disabled">
                <span>Next Project</span>
                <strong>None</strong>
              </div>
            )}
          </nav>
        </div>
      </section>
    </main>
  );
}
