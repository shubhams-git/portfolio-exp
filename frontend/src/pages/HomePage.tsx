import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Link } from "react-router-dom";

import { ProjectVisual } from "@/components/ProjectVisual";
import { QuickPreviewModal } from "@/components/QuickPreviewModal";
import { SectionLabel } from "@/components/SectionLabel";
import { portfolioContent } from "@/content/portfolio-content";
import { setDocumentMetadata } from "@/lib/seo";
import type {
  ContactLink,
  ExperienceItem,
  HeroAction,
  Project,
  TechCategory,
} from "@/types/portfolio";

type ContactFormValues = {
  name: string;
  email: string;
  message: string;
};

type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;

type ContactResponse = {
  status: string;
  message: string;
  receiptId?: string;
  receiver?: string;
  issues?: {
    fieldErrors?: Record<string, string[]>;
    formErrors?: string[];
  };
};

const initialContactValues: ContactFormValues = {
  name: "",
  email: "",
  message: "",
};

function isExternalLink(href: string) {
  return /^(https?:|mailto:|tel:)/.test(href);
}

function renderContactLink(link: ContactLink, index: number) {
  const prefix = `${String(index + 1).padStart(2, "0")} // ${link.label}`;

  if (link.kind === "unavailable") {
    return (
      <a className="terminal-window__link" href={link.href} key={link.label} title={link.note}>
        {prefix}
      </a>
    );
  }

  return (
    <a
      download={link.kind === "download" ? link.downloadName : undefined}
      href={link.href}
      key={link.label}
      rel={link.rel ?? (isExternalLink(link.href) ? "noreferrer" : undefined)}
      target={link.target ?? (isExternalLink(link.href) ? "_blank" : undefined)}
      title={link.note}
    >
      {prefix}
    </a>
  );
}

function ActionButton({ action }: { action: HeroAction }) {
  if (action.kind === "unavailable") {
    return (
      <span
        aria-disabled="true"
        className={`action-button action-button--${action.variant} action-button--disabled`}
        title={action.note}
      >
        [{action.label}]
      </span>
    );
  }

  return (
    <a
      className={`action-button action-button--${action.variant}`}
      download={action.kind === "download" ? action.downloadName : undefined}
      href={action.href}
      rel={action.rel ?? (isExternalLink(action.href) ? "noreferrer" : undefined)}
      target={action.target ?? (isExternalLink(action.href) ? "_blank" : undefined)}
      title={action.note}
    >
      [{action.label}]
    </a>
  );
}

function ProjectCard({
  project,
  onPreview,
  isPreviewOpen,
}: {
  project: Project;
  onPreview: (project: Project) => void;
  isPreviewOpen: boolean;
}) {
  return (
    <article className="project-card">
      <ProjectVisual project={project} />

      <header className="project-card__header">
        <div>
          <div className="project-card__eyebrow">
            Project_{project.index} / {project.category}
          </div>
          <h3 className="project-card__name">{project.name}</h3>
        </div>
        <button
          aria-expanded={isPreviewOpen}
          aria-haspopup="dialog"
          aria-label={`Open ${project.name} quick preview`}
          className="project-card__launch"
          onClick={() => onPreview(project)}
          type="button"
        >
          Preview
        </button>
      </header>

      <p className="project-card__summary">{project.summary}</p>

      <div className="project-card__meta">
        <div className="meta-block">
          <div className="meta-block__label">Problem Solved</div>
          <p className="meta-block__value">{project.problem}</p>
        </div>
        <div className="meta-block">
          <div className="meta-block__label">Role</div>
          <p className="meta-block__value">{project.role}</p>
        </div>
        <div className="meta-block">
          <div className="meta-block__label">Core Stack</div>
          <p className="meta-block__value">{project.coreStack.join(" / ")}</p>
        </div>
        <div className="meta-block">
          <div className="meta-block__label">Architecture Challenge</div>
          <p className="meta-block__value">{project.architectureChallenge}</p>
        </div>
      </div>

      <div className="project-card__actions">
        <div className="meta-block">
          <div className="meta-block__label">Impact</div>
          <p className="meta-block__value project-card__body">{project.impact}</p>
        </div>

        <Link className="project-card__detail-link" to={`/projects/${project.slug}`}>
          Case Study
        </Link>
      </div>
    </article>
  );
}

function StackColumn({ category }: { category: TechCategory }) {
  return (
    <article className="stack-column">
      <div className="stack-column__index">/{category.id}</div>
      <h3 className="stack-column__title">{category.title}</h3>
      <ul>
        {category.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function TimelineItem({ item }: { item: ExperienceItem }) {
  return (
    <article className="timeline-item">
      <div className="timeline-item__period">{item.period}</div>
      <h3 className="timeline-item__company">{item.company}</h3>
      <div className="timeline-item__focus">{item.focus}</div>
      <p className="timeline-item__summary">{item.summary}</p>
    </article>
  );
}

export function HomePage() {
  const {
    person,
    heroActions,
    projects,
    technicalStack,
    experience,
    contactLinks,
    siteTitle,
  } = portfolioContent;
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [contactValues, setContactValues] = useState<ContactFormValues>(initialContactValues);
  const [contactErrors, setContactErrors] = useState<ContactFormErrors>({});
  const [contactStatus, setContactStatus] = useState<{
    tone: "idle" | "success" | "error";
    message: string;
  }>({ tone: "idle", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setDocumentMetadata({
      title: siteTitle,
      description:
        "Shubham Sharma is a Melbourne-based software developer building full-stack applications, practical AI integrations, and recruiter-readable case-study driven portfolio work.",
      canonical: "/",
      image: "/meta/og-default.svg",
      imageAlt: "The Layered Matrix portfolio homepage preview",
      siteName: siteTitle,
      type: "website",
    });
  }, [siteTitle]);

  useEffect(() => {
    if (!activeProject) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeProject]);

  const handleContactChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setContactValues((current) => ({
      ...current,
      [name]: value,
    }));

    setContactErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateContactForm = () => {
    const nextErrors: ContactFormErrors = {};

    if (contactValues.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValues.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (contactValues.message.trim().length < 10) {
      nextErrors.message = "Message must be at least 10 characters.";
    }

    return nextErrors;
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextErrors = validateContactForm();

    if (Object.keys(nextErrors).length > 0) {
      setContactErrors(nextErrors);
      setContactStatus({
        tone: "error",
        message: "Submission blocked. Check the terminal parameters and try again.",
      });
      return;
    }

    setIsSubmitting(true);
    setContactStatus({ tone: "idle", message: "" });

    const apiBaseUrl =
      import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

    try {
      const response = await fetch(`${apiBaseUrl}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactValues),
      });

      const payload = (await response.json()) as ContactResponse;

      if (!response.ok) {
        const fieldErrors: ContactFormErrors = {
          name: payload.issues?.fieldErrors?.name?.[0] ?? "",
          email: payload.issues?.fieldErrors?.email?.[0] ?? "",
          message: payload.issues?.fieldErrors?.message?.[0] ?? "",
        };

        setContactErrors(fieldErrors);
        setContactStatus({
          tone: "error",
          message: payload.message || "Submission failed. Try again.",
        });
        return;
      }

      setContactValues(initialContactValues);
      setContactErrors({});
      setContactStatus({
        tone: "success",
        message: payload.receiptId
          ? `${payload.message} Receipt: ${payload.receiptId}.`
          : payload.message,
      });
    } catch {
      setContactStatus({
        tone: "error",
        message: "API connection failed. Confirm the Express backend is running on the configured port.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <main id="main-content">
        <section className="section hero" id="top">
          <div className="section__inner">
            <div className="hero__frame">
              <div className="hero__content">
                <div className="hero__meta">
                  {person.location} / Status: {person.status}
                </div>
                <h1 className="hero__title">
                  <span>[{person.firstName}]</span>
                  <span>[{person.lastName}].</span>
                </h1>
                <p className="hero__role">{person.role}.</p>
                <p className="hero__summary">{person.valueProposition}</p>
                <div className="hero__actions">
                  {heroActions.map((action) => (
                    <ActionButton action={action} key={action.label} />
                  ))}
                </div>
                <div className="hero__credentials">
                  <div className="hero__credential">
                    <span>Focus</span>
                    <strong>Full-stack product engineering</strong>
                  </div>
                  <div className="hero__credential">
                    <span>Strength</span>
                    <strong>Applied AI and recruiter clarity</strong>
                  </div>
                </div>
              </div>

              <aside aria-label="Hero atmospheric panel" className="hero__aside">
                <div className="portrait-panel">
                  <div className="portrait-panel__inner">
                    <div className="portrait-panel__copy">Layered Matrix / Entry Surface</div>
                    <div className="portrait-panel__glyph">
                      {person.firstName[0]}
                      {person.lastName[0]}
                    </div>
                    <div className="portrait-panel__specs">
                      <div>
                        <span>Location</span>
                        <strong>Melbourne, VIC</strong>
                      </div>
                      <div>
                        <span>Mode</span>
                        <strong>Recruiter-facing portfolio</strong>
                      </div>
                      <div>
                        <span>Current Build</span>
                        <strong>Milestone_9</strong>
                      </div>
                    </div>
                    <div className="portrait-panel__meta">
                      Spatial depth / technical grid / restrained motion
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section className="section" id="work">
          <div className="section__inner">
            <div className="work-section__header">
              <div>
                <SectionLabel>[01] System Architecture & Projects</SectionLabel>
                <h2 className="section-heading">Engineering Portfolio.</h2>
              </div>
              <p className="work-section__intro">
                A dense but scannable project matrix built to show product judgment, frontend
                polish, backend fluency, and practical AI integration without hiding behind style.
              </p>
            </div>
            <div className="work-grid">
              {projects.map((project) => (
                <ProjectCard
                  isPreviewOpen={activeProject?.slug === project.slug}
                  key={project.slug}
                  onPreview={setActiveProject}
                  project={project}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="stack">
          <div className="section__inner">
            <div className="stack-section__header">
              <div>
                <SectionLabel>[02] Technical Arsenal</SectionLabel>
                <h2 className="section-heading">Technical Arsenal</h2>
              </div>
              <div className="stack-section__status">
                <span>System Capability Matrix v4.0.1</span>
                <strong>Status: Operational</strong>
              </div>
            </div>

            <div className="stack-grid">
              {technicalStack.map((category) => (
                <StackColumn category={category} key={category.id} />
              ))}
            </div>

            <div className="stack-section__footer">
              <div className="stack-section__note">
                <p>
                  Engineering philosophy rooted in absolute precision. The stack is presented as a
                  recruiter-readable matrix: frontend craft, backend architecture, cloud delivery,
                  AI integration, and database fundamentals.
                </p>
              </div>
              <div className="stack-section__specs">
                <div>
                  <span>Runtime</span>
                  <strong>React / Express</strong>
                </div>
                <div>
                  <span>Architecture</span>
                  <strong>Full-stack portfolio system</strong>
                </div>
                <div>
                  <span>Priority</span>
                  <strong>Clarity over noise</strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="section__inner">
            <SectionLabel>[03] Portrait Void</SectionLabel>
            <div className="about-layout">
              <aside className="about-portrait">
                <div className="about-portrait__card">
                  <div className="about-portrait__visual">
                    {person.introMediaUrl ? (
                      <video
                        aria-label={`${person.firstName} ${person.lastName} introduction video`}
                        autoPlay
                        className="about-portrait__video"
                        loop
                        muted
                        playsInline
                        preload="metadata"
                      >
                        <source src={person.introMediaUrl} type="video/mp4" />
                      </video>
                    ) : (
                      <>
                        <div className="about-portrait__halo" />
                        <div className="about-portrait__monogram">
                          {person.firstName[0]}
                          {person.lastName[0]}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="about-portrait__caption">
                    <span>Identity Surface</span>
                    <strong>
                      {person.firstName} {person.lastName} / {person.role}
                    </strong>
                  </div>
                </div>
              </aside>

              <div className="about-content">
                <article className="about-intro">
                  <h2 className="section-heading">The Human Element.</h2>
                  <p className="about-intro__body">
                    I build software with a product lens first. My work sits at the intersection of
                    full-stack product engineering, practical AI integration, and recruiter-readable
                    technical execution. I care about interfaces that feel intentional, backend
                    systems that stay understandable, and delivery that holds up under real product
                    constraints.
                  </p>
                  <p className="about-intro__quote">
                    "Strong engineering shows up in systems that are both useful to users and easy
                    to reason about."
                  </p>
                </article>

                <div className="timeline">
                  {experience.map((item) => (
                    <TimelineItem item={item} key={item.company} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="section__inner">
            <SectionLabel>[04] Terminal Contact</SectionLabel>
            <div className="contact-panel">
              <div className="contact-panel__intro">
                <div className="hero__meta">// Initializing Connection</div>
                <h2 className="contact-panel__title">Let&apos;s Build.</h2>
                <p className="hero__summary">
                  Use the terminal interface to send a direct message through the Express backend.
                  Submissions are now validated, rate-limited, and stored with a receipt for
                  follow-up.
                </p>

                <div className="contact-panel__meta">
                  <div>
                    <span>Signal</span>
                    <strong>Direct contact route</strong>
                  </div>
                  <div>
                    <span>Transport</span>
                    <strong>Express API / persisted contact store</strong>
                  </div>
                </div>
              </div>

              <div className="contact-panel__terminal">
                <div className="terminal-window">
                  <div className="terminal-window__bar">
                    <div className="terminal-window__dots">
                      <span />
                      <span />
                      <span />
                    </div>
                    <div className="terminal-window__label">Session Type: Secure Shell</div>
                  </div>

                  <form className="terminal-window__body" onSubmit={handleContactSubmit}>
                    <p className="terminal-window__prompt">user@melbourne:~$ ./contact --initiate</p>

                    <div className="terminal-window__grid">
                      <label className="terminal-field">
                        <span className="terminal-field__label">Parameter: Name</span>
                        <input
                          className={`terminal-input ${contactErrors.name ? "terminal-input--error" : ""}`}
                          name="name"
                          onChange={handleContactChange}
                          placeholder="Enter full identity..."
                          type="text"
                          value={contactValues.name}
                        />
                        {contactErrors.name ? (
                          <span className="terminal-field__error">{contactErrors.name}</span>
                        ) : null}
                      </label>

                      <label className="terminal-field">
                        <span className="terminal-field__label">Parameter: Email</span>
                        <input
                          className={`terminal-input ${contactErrors.email ? "terminal-input--error" : ""}`}
                          name="email"
                          onChange={handleContactChange}
                          placeholder="Enter transmission node..."
                          type="email"
                          value={contactValues.email}
                        />
                        {contactErrors.email ? (
                          <span className="terminal-field__error">{contactErrors.email}</span>
                        ) : null}
                      </label>

                      <label className="terminal-field">
                        <span className="terminal-field__label">Parameter: Payload</span>
                        <textarea
                          className={`terminal-input terminal-input--textarea ${
                            contactErrors.message ? "terminal-input--error" : ""
                          }`}
                          name="message"
                          onChange={handleContactChange}
                          placeholder="Describe the architectural scope..."
                          rows={5}
                          value={contactValues.message}
                        />
                        {contactErrors.message ? (
                          <span className="terminal-field__error">{contactErrors.message}</span>
                        ) : null}
                      </label>
                    </div>

                    <div className="terminal-window__actions">
                      <button
                        className="action-button action-button--primary terminal-submit"
                        disabled={isSubmitting}
                        type="submit"
                      >
                        [{isSubmitting ? "Sending..." : "Execute: Send"}]
                      </button>

                      <div className="terminal-window__links">
                        {contactLinks.map((link, index) => renderContactLink(link, index))}
                      </div>
                    </div>

                    {contactStatus.message ? (
                      <div
                        className={`terminal-status terminal-status--${contactStatus.tone}`}
                        role="status"
                      >
                        {contactStatus.message}
                      </div>
                    ) : null}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {activeProject ? (
        <QuickPreviewModal onClose={() => setActiveProject(null)} project={activeProject} />
      ) : null}
    </>
  );
}
