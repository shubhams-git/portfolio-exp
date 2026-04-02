import { useEffect } from "react";
import { motion } from "motion/react";
import { Link, Navigate, useParams } from "react-router-dom";

import { ProjectGlassPanel, ProjectMetricCard, ProjectTagList } from "@/components/ProjectSurface";
import { ProjectVisual } from "@/components/ProjectVisual";
import { portfolioContent } from "@/content/portfolio-content";
import { getAdjacentProjects, getProjectBySlug } from "@/lib/portfolio";
import { setDocumentMetadata } from "@/lib/seo";

const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

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
    <main
      className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(111,251,190,0.08),transparent_24rem),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_20%)] text-white"
      id="main-content"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 pb-24 pt-24 sm:px-6 lg:px-8 lg:pt-28">
        <motion.section
          initial="hidden"
          viewport={{ once: true, margin: "-120px" }}
          variants={sectionReveal}
          whileInView="visible"
        >
          <ProjectGlassPanel tone={project.visual.tone} className="p-6 md:p-8 xl:p-10">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/60">
                <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] shadow-[0_0_20px_rgba(111,251,190,0.85)]" />
                Project // {project.index}
              </span>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-white/52">
                {project.category}
              </span>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)] xl:items-start">
              <div>
                <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-white sm:text-5xl lg:text-6xl xl:text-7xl">
                  {project.name}
                  <span className="mt-3 block text-2xl font-medium tracking-[-0.03em] text-white/55 sm:text-3xl lg:text-4xl">
                    {project.caseStudy.headline}
                  </span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
                  {project.caseStudy.overview}
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 font-mono text-xs uppercase tracking-[0.28em] text-white/82 transition duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[color:rgba(111,251,190,0.32)] motion-safe:hover:bg-white/[0.08]"
                    to="/#work"
                  >
                    Back to work
                  </Link>
                  <Link
                    className="inline-flex items-center justify-center rounded-full border border-[color:rgba(111,251,190,0.22)] bg-[color:rgba(111,251,190,0.08)] px-5 py-3 font-mono text-xs uppercase tracking-[0.28em] text-[var(--color-accent)] transition duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:bg-[color:rgba(111,251,190,0.14)]"
                    to="/#contact"
                  >
                    Contact
                  </Link>
                </div>

                <div className="mt-10 grid gap-4 sm:grid-cols-3">
                  {project.preview.metrics.map((metric) => (
                    <ProjectMetricCard key={metric.label} label={metric.label} value={metric.value} />
                  ))}
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {project.deliverySignals.map((signal) => (
                    <ProjectMetricCard
                      detail={signal.detail}
                      key={signal.label}
                      label={signal.label}
                      value={signal.value}
                    />
                  ))}
                </div>
              </div>

              <ProjectGlassPanel as="article" tone={project.visual.tone} className="p-5 md:p-6">
                <dl className="mt-5 space-y-5">
                  <div className="border-b border-white/8 pb-4">
                    <dt className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-white/42">
                      Role
                    </dt>
                    <dd className="mt-2 text-base font-medium tracking-[-0.02em] text-white/90">
                      {project.role}
                    </dd>
                  </div>
                  <div className="border-b border-white/8 pb-4">
                    <dt className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-white/42">
                      Core Stack
                    </dt>
                    <dd className="mt-3">
                      <ProjectTagList items={project.coreStack} />
                    </dd>
                  </div>
                  <div className="border-b border-white/8 pb-4">
                    <dt className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-white/42">
                      Architecture challenge
                    </dt>
                    <dd className="mt-2 text-sm leading-7 text-white/70">
                      {project.architectureChallenge}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-white/42">
                      Outcome
                    </dt>
                    <dd className="mt-2 text-sm leading-7 text-white/72">{project.impact}</dd>
                  </div>
                  <div className="border-t border-white/8 pt-4">
                    <dt className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-white/42">
                      Proof points
                    </dt>
                    <dd className="mt-3 grid gap-3">
                      {project.proofPoints.map((point, index) => (
                        <div
                          className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/72"
                          key={point}
                        >
                          <span className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[var(--color-accent)]">
                            0{index + 1}
                          </span>
                          <p className="mt-2">{point}</p>
                        </div>
                      ))}
                    </dd>
                  </div>
                </dl>
              </ProjectGlassPanel>
            </div>
          </ProjectGlassPanel>
        </motion.section>

        <motion.section
          className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]"
          initial="hidden"
          viewport={{ once: true, margin: "-120px" }}
          variants={sectionReveal}
          whileInView="visible"
        >
          <ProjectGlassPanel as="article" className="p-6 md:p-8">
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
              Context
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/70 sm:text-lg">
              {project.caseStudy.architectureSummary}
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <ProjectMetricCard
                detail="The engineering surface needed to stay credible in interviews, not just visually polished."
                label="Design goal"
                value="Recruiter-readable delivery"
              />
              <ProjectMetricCard
                detail="The project stays useful because the interface and the technical narrative stay aligned."
                label="Product lens"
                value="Interface + architecture"
              />
            </div>

            <div className="mt-8 grid gap-3">
              {project.caseStudy.challenge.map((item) => (
                <div
                  className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-white/72"
                  key={item}
                >
                  {item}
                </div>
              ))}
            </div>
          </ProjectGlassPanel>

          <ProjectGlassPanel as="article" className="p-6 md:p-8">
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
              Highlights
            </h2>
            <ul className="mt-6 space-y-4">
              {project.caseStudy.recruiterHighlights.map((item) => (
                <li
                  className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 text-sm leading-7 text-white/76"
                  key={item}
                >
                  {item}
                </li>
              ))}
            </ul>
          </ProjectGlassPanel>
        </motion.section>

        <motion.section
          className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)] xl:items-start"
          initial="hidden"
          viewport={{ once: true, margin: "-120px" }}
          variants={sectionReveal}
          whileInView="visible"
        >
          <div className="space-y-4">
            <ProjectVisual className="aspect-[16/10] md:aspect-[21/12]" project={project} />
            <p className="max-w-3xl font-mono text-xs uppercase leading-6 tracking-[0.28em] text-white/45">
              {project.caseStudy.imageCaption}
            </p>
          </div>

          <div className="space-y-4">
            {project.caseStudy.architectureLayers.map((layer, index) => (
              <ProjectMetricCard
                detail={layer.detail}
                key={layer.label}
                label={`Layer ${String(index + 1).padStart(2, "0")}`}
                value={layer.label}
              />
            ))}
          </div>
        </motion.section>

        <motion.section
          className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]"
          initial="hidden"
          viewport={{ once: true, margin: "-120px" }}
          variants={sectionReveal}
          whileInView="visible"
        >
          <ProjectGlassPanel as="article" className="p-6 md:p-8">
            <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
              Code
            </h2>
            <p className="mt-5 text-base leading-8 text-white/70">
              The code sample below surfaces the part of the system that best communicates how the
              project works: a narrow, typed boundary that keeps orchestration understandable.
            </p>
            <div className="mt-8 rounded-[1.35rem] border border-white/10 bg-black/35 p-4 text-sm leading-7 text-white/72">
              <p>What to notice:</p>
              <ul className="mt-3 space-y-2">
                <li>Explicit state hand-off instead of implicit side effects.</li>
                <li>Clear request shaping before model or service execution.</li>
                <li>Output packaging that keeps the product boundary readable.</li>
              </ul>
            </div>
          </ProjectGlassPanel>

          <ProjectGlassPanel as="article" className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 md:px-6">
              <div>
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/42">
                  Source slice
                </div>
                <div className="mt-1 text-sm font-medium text-white/82">{project.caseStudy.codeFile}</div>
              </div>
            </div>
            <pre className="overflow-x-auto p-5 text-sm leading-7 text-white/76 md:p-6">
              <code>{project.caseStudy.codeSnippet}</code>
            </pre>
          </ProjectGlassPanel>
        </motion.section>

        <motion.section
          initial="hidden"
          viewport={{ once: true, margin: "-120px" }}
          variants={sectionReveal}
          whileInView="visible"
        >
          <ProjectGlassPanel as="article" className="p-6 md:p-8">
            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
              <div>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white sm:text-3xl">
                  Visual
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
                  The presentation keeps the visual surface framed and legible instead of treating
                  it like a detached thumbnail.
                </p>
              </div>

              <div className="space-y-3">
                <div className="font-mono text-xs uppercase tracking-[0.34em] text-white/42">
                  Applied stack
                </div>
                <ProjectTagList items={project.preview.appliedStack} />
                <div className="grid gap-3">
                  {project.proofPoints.map((point, index) => (
                    <div
                      className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/72"
                      key={point}
                    >
                      <span className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[var(--color-accent)]">
                        proof 0{index + 1}
                      </span>
                      <p className="mt-2">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <ProjectVisual className="aspect-[18/9] md:aspect-[21/10]" project={project} />
            </div>
          </ProjectGlassPanel>
        </motion.section>

        <motion.section
          initial="hidden"
          viewport={{ once: true, margin: "-120px" }}
          variants={sectionReveal}
          whileInView="visible"
        >
          <nav className="grid gap-4 md:grid-cols-3">
            {previousProject ? (
              <Link
                className="group"
                to={`/projects/${previousProject.slug}`}
                aria-label={`Open previous project: ${previousProject.name}`}
              >
                <ProjectGlassPanel className="h-full p-5 transition duration-300 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:border-[color:rgba(111,251,190,0.25)]">
                  <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/42">
                    Previous project
                  </div>
                  <div className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">
                    {previousProject.name}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/64">{previousProject.category}</p>
                </ProjectGlassPanel>
              </Link>
            ) : (
              <ProjectGlassPanel className="p-5 opacity-65">
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/42">
                  Previous project
                </div>
                <div className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white/60">
                  None
                </div>
              </ProjectGlassPanel>
            )}

            <Link className="group" to="/#work" aria-label="Return to the project matrix">
              <ProjectGlassPanel className="flex h-full flex-col items-center justify-center gap-3 p-5 text-center transition duration-300 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:border-[color:rgba(111,251,190,0.32)]">
                <div className="text-xl font-semibold tracking-[-0.03em] text-white">
                  Back to work
                </div>
              </ProjectGlassPanel>
            </Link>

            {nextProject ? (
              <Link
                className="group"
                to={`/projects/${nextProject.slug}`}
                aria-label={`Open next project: ${nextProject.name}`}
              >
                <ProjectGlassPanel className="h-full p-5 transition duration-300 motion-safe:group-hover:-translate-y-1 motion-safe:group-hover:border-[color:rgba(111,251,190,0.25)]">
                  <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/42">
                    Next project
                  </div>
                  <div className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">
                    {nextProject.name}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/64">{nextProject.category}</p>
                </ProjectGlassPanel>
              </Link>
            ) : (
              <ProjectGlassPanel className="p-5 opacity-65">
                <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/42">
                  Next project
                </div>
                <div className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white/60">
                  None
                </div>
              </ProjectGlassPanel>
            )}
          </nav>
        </motion.section>
      </div>
    </main>
  );
}
