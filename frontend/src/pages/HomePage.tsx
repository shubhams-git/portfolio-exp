import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Eye, Send } from "lucide-react";
import { Link } from "react-router-dom";

import { HeroCapabilityConstellation } from "@/components/HeroCapabilityConstellation";
import { ProjectGlassPanel, ProjectTagList } from "@/components/ProjectSurface";
import { ProjectVisual } from "@/components/ProjectVisual";
import { QuickPreviewModal } from "@/components/QuickPreviewModal";
import { portfolioContent } from "@/content/portfolio-content";
import { setDocumentMetadata } from "@/lib/seo";
import type {
  ContactLink,
  ExperienceItem,
  HeroAction,
  Project,
  TechCategory,
} from "@/types/portfolio";

type ContactFormValues = { name: string; email: string; message: string };
type ContactFormErrors = Partial<Record<keyof ContactFormValues, string>>;
type ContactResponse = {
  status: string;
  message: string;
  receiptId?: string;
  issues?: { fieldErrors?: Record<string, string[]> };
};
type RevealDirection = "up" | "left" | "right";
type RevealCustom = {
  direction?: RevealDirection;
  delay?: number;
  distance?: number;
};

const initialContactValues: ContactFormValues = { name: "", email: "", message: "" };
const sectionViewport = { once: true, amount: 0.12 } as const;
const revealEase = [0.22, 1, 0.36, 1] as const;
const heroReveal = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 3.12, ease: revealEase },
  },
};
const heroStaggerChildren = { hidden: {}, visible: { transition: { staggerChildren: 0.32 } } };

function createStaggerSequence(
  {
    delayChildren,
    staggerChildren,
  }: {
    delayChildren: number;
    staggerChildren: number;
  },
) {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };
}

function createDirectionalReveal(reducedMotion: boolean) {
  return {
    hidden: (custom: RevealCustom = {}) => {
      const direction = custom.direction ?? "up";
      const distance = custom.distance ?? 18;

      return {
        opacity: 0,
        x: reducedMotion ? 0 : direction === "left" ? -distance : direction === "right" ? distance : 0,
        y: reducedMotion ? 6 : direction === "up" ? distance : Math.round(distance * 0.35),
      };
    },
    visible: (custom: RevealCustom = {}) => ({
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: reducedMotion ? 1.36 : 2.32,
        delay: custom.delay ?? 0,
        ease: revealEase,
      },
    }),
  };
}

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");
const isExternalLink = (href: string) => /^(https?:|mailto:|tel:)/.test(href);

function SectionHeading({
  title,
}: {
  title: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-[-0.05em] text-white sm:text-3xl">{title}</h2>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-[1.35rem] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-sm">
      <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/42">{label}</div>
      <div className="mt-3 text-sm leading-7 text-white/72">{value}</div>
    </article>
  );
}

function ActionButton({ action }: { action: HeroAction }) {
  const baseClass =
    "inline-flex items-center justify-center rounded-full px-5 py-3 font-mono text-[0.7rem] uppercase tracking-[0.28em] transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(111,251,190,0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]";
  if (action.kind === "unavailable") {
    return (
      <span
        aria-disabled="true"
        className={`${baseClass} cursor-not-allowed border border-white/10 bg-white/[0.03] text-white/35`}
      >
        {action.label}
      </span>
    );
  }
  const primary = action.variant === "primary";
  return (
    <a
      className={cx(
        baseClass,
        primary
          ? "border border-[color:rgba(111,251,190,0.32)] bg-[color:rgba(111,251,190,0.12)] text-[var(--color-accent)] shadow-[0_18px_50px_-26px_rgba(111,251,190,0.55)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:bg-[color:rgba(111,251,190,0.18)]"
          : "border border-white/10 bg-white/[0.04] text-white/82 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-white/18 motion-safe:hover:bg-white/[0.08]",
      )}
      download={action.kind === "download" ? action.downloadName : undefined}
      href={action.href}
      rel={action.rel ?? (isExternalLink(action.href) ? "noreferrer" : undefined)}
      target={action.target ?? (isExternalLink(action.href) ? "_blank" : undefined)}
      title={action.note}
    >
      <span>{action.label}</span>
      <ArrowUpRight className="ml-2 h-4 w-4" />
    </a>
  );
}

function renderContactLink(link: ContactLink) {
  const baseClass =
    "inline-flex items-center rounded-full border px-4 py-2 font-mono text-[0.68rem] uppercase tracking-[0.28em] transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(111,251,190,0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]";
  if (link.kind === "unavailable") {
    return (
      <a
        className={`${baseClass} cursor-not-allowed border-white/10 bg-white/[0.03] text-white/38`}
        href={link.href}
        key={link.label}
        title={link.note}
      >
        {link.label}
      </a>
    );
  }
  return (
    <a
      className={`${baseClass} border-white/10 bg-white/[0.04] text-white/74 motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[color:rgba(111,251,190,0.26)] motion-safe:hover:bg-[color:rgba(111,251,190,0.08)] motion-safe:hover:text-[var(--color-accent)]`}
      download={link.kind === "download" ? link.downloadName : undefined}
      href={link.href}
      key={link.label}
      rel={link.rel ?? (isExternalLink(link.href) ? "noreferrer" : undefined)}
      target={link.target ?? (isExternalLink(link.href) ? "_blank" : undefined)}
      title={link.note}
    >
      {link.label}
    </a>
  );
}

function projectActionClass(emphasis: "secondary" | "primary") {
  return cx(
    "inline-flex items-center gap-2.5 rounded-full border px-5 py-3 font-mono text-[0.68rem] uppercase tracking-[0.24em] transition duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:rgba(111,251,190,0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]",
    emphasis === "primary"
      ? "border-[color:rgba(111,251,190,0.28)] bg-[linear-gradient(180deg,rgba(111,251,190,0.14),rgba(111,251,190,0.08))] text-[var(--color-accent)] shadow-[0_18px_34px_-24px_rgba(111,251,190,0.34)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-[color:rgba(111,251,190,0.38)] motion-safe:hover:bg-[linear-gradient(180deg,rgba(111,251,190,0.18),rgba(111,251,190,0.11))]"
      : "border-white/14 bg-white/[0.07] text-white/86 shadow-[0_18px_30px_-24px_rgba(0,0,0,0.76)] motion-safe:hover:-translate-y-0.5 motion-safe:hover:border-white/22 motion-safe:hover:bg-white/[0.1]",
  );
}

function ProjectCard({
  project,
  onPreview,
  isPreviewOpen,
  featured = false,
  reveal,
}: {
  project: Project;
  onPreview: (project: Project) => void;
  isPreviewOpen: boolean;
  featured?: boolean;
  reveal?: RevealCustom;
}) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const revealVariants = createDirectionalReveal(shouldReduceMotion);

  return (
    <motion.article
      className={cx(featured && "xl:h-full")}
      custom={reveal}
      variants={revealVariants}
      whileHover={shouldReduceMotion ? undefined : { y: -6 }}
    >
      <ProjectGlassPanel className={cx("p-4 sm:p-5", featured && "xl:h-full xl:p-6")} tone={project.visual.tone}>
        <div className={cx("flex flex-col gap-4", featured && "xl:h-full")}>
          <ProjectVisual className="aspect-[16/9] sm:aspect-[16/10]" project={project} />
          <div className="space-y-2">
            <div className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-white/40">
              Project_{project.index} // {project.category}
            </div>
            <h3 className="text-2xl font-semibold tracking-[-0.04em] text-white sm:text-[1.85rem]">
              {project.name}
            </h3>
            <p className="max-w-2xl text-sm leading-7 text-white/60">{project.summary}</p>
          </div>
          <ProjectTagList items={featured ? project.coreStack.slice(0, 4) : project.coreStack.slice(0, 3)} />
          <div className="mt-2 border-t border-white/[0.06] pt-4 sm:mt-3 sm:pt-5">
            <div className="flex flex-wrap gap-3">
              <button
                aria-expanded={isPreviewOpen}
                aria-haspopup="dialog"
                aria-label={`Open ${project.name} quick preview`}
                className={projectActionClass("secondary")}
                onClick={() => onPreview(project)}
                type="button"
              >
                <Eye className="h-4 w-4" />
                <span>Quick preview</span>
              </button>
              <Link className={projectActionClass("primary")} to={`/projects/${project.slug}`}>
                <span>Case study</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </ProjectGlassPanel>
    </motion.article>
  );
}

function StackCard({ category, reveal }: { category: TechCategory; reveal?: RevealCustom }) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const revealVariants = createDirectionalReveal(shouldReduceMotion);

  return (
    <motion.div custom={reveal} variants={revealVariants}>
      <ProjectGlassPanel as="article" className="h-full p-5 md:p-6">
        <div className="font-mono text-[0.64rem] uppercase tracking-[0.26em] text-white/38">{category.id}</div>
        <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">{category.title}</h3>
        <p className="mt-3 text-sm leading-7 text-white/62">{category.summary}</p>
        <div className="mt-5"><ProjectTagList items={category.items.slice(0, 4)} /></div>
      </ProjectGlassPanel>
    </motion.div>
  );
}

function TimelineItem({ item, reveal }: { item: ExperienceItem; reveal?: RevealCustom }) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const revealVariants = createDirectionalReveal(shouldReduceMotion);

  return (
    <motion.article className="relative pl-6" custom={reveal} variants={revealVariants}>
      <div className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_24px_rgba(111,251,190,0.8)]" />
      <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.025] p-5 backdrop-blur-sm">
        <div className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/42">{item.period}</div>
        <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em] text-white">{item.company}</h3>
        <div className="mt-2 text-sm uppercase tracking-[0.18em] text-[var(--color-accent)]">{item.focus}</div>
        <p className="mt-4 text-sm leading-7 text-white/66">{item.summary}</p>
      </div>
    </motion.article>
  );
}

function ContactInput({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/44">{label}</span>
      {children}
      {error ? <span className="text-sm text-rose-300">{error}</span> : null}
    </label>
  );
}

export function HomePage() {
  const { person, heroActions, projects, technicalStack, experience, contactLinks, siteTitle } =
    portfolioContent;
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [contactValues, setContactValues] = useState<ContactFormValues>(initialContactValues);
  const [contactErrors, setContactErrors] = useState<ContactFormErrors>({});
  const [contactStatus, setContactStatus] = useState<{ tone: "idle" | "success" | "error"; message: string }>({
    tone: "idle",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const sectionStagger = createStaggerSequence({
    delayChildren: shouldReduceMotion ? 0.08 : 0.16,
    staggerChildren: shouldReduceMotion ? 0.16 : 0.4,
  });
  const groupStagger = createStaggerSequence({
    delayChildren: 0,
    staggerChildren: shouldReduceMotion ? 0.12 : 0.28,
  });
  const sectionReveal = createDirectionalReveal(shouldReduceMotion);
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress: heroScrollProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroLeadY = useTransform(heroScrollProgress, [0, 1], [0, shouldReduceMotion ? 0 : 32]);
  const heroPanelY = useTransform(heroScrollProgress, [0, 1], [0, shouldReduceMotion ? 0 : 56]);
  const heroPanelScale = useTransform(heroScrollProgress, [0, 1], [1, shouldReduceMotion ? 1 : 0.985]);
  const heroGlowOpacity = useTransform(heroScrollProgress, [0, 1], [1, shouldReduceMotion ? 1 : 0.62]);
  const [featuredProject, ...supportingProjects] = projects;
  const resolveCategory = (title: string) => technicalStack.find((category) => category.title === title) ?? null;
  const resolveProject = (slug: string, fallbackIndex = 0) => projects.find((project) => project.slug === slug) ?? projects[fallbackIndex] ?? null;
  const capabilityRoutes = [
    { id: "frontend", title: "Frontend", categoryTitle: "Frontend", projectSlug: "weather-app", fallbackIndex: 0 },
    { id: "backend", title: "Backend", categoryTitle: "Backend", projectSlug: "rizzbot", fallbackIndex: 0 },
    { id: "cloud", title: "Cloud", categoryTitle: "Cloud & Infra", projectSlug: "ai-financial-forecasting", fallbackIndex: 2 },
    { id: "ai", title: "AI", categoryTitle: "AI & Integrations", projectSlug: "rizzbot", fallbackIndex: 0 },
  ]
    .map((route) => {
      const category = resolveCategory(route.categoryTitle);
      const project = resolveProject(route.projectSlug, route.fallbackIndex);
      if (!category || !project) return null;
      return {
        id: route.id,
        title: route.title,
        summary: category.summary,
        signal: category.signal,
        tools: category.items,
        reference: project.name,
        href: `/projects/${project.slug}`,
        tone: project.visual.tone,
      };
    })
    .filter((route) => route !== null);
  useEffect(() => {
    setDocumentMetadata({
      title: siteTitle,
      description:
        "Shubham Sharma is a Melbourne-based full-stack developer building product-focused applications, practical AI integrations, and recruiter-readable case-study driven portfolio work.",
      canonical: "/",
      image: "/meta/og-default.svg",
      imageAlt: "The Layered Matrix portfolio homepage preview",
      siteName: siteTitle,
      type: "website",
    });
  }, [siteTitle]);

  useEffect(() => {
    if (!activeProject) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [activeProject]);

  const handleContactChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setContactValues((current) => ({ ...current, [name]: value }));
    setContactErrors((current) => ({ ...current, [name]: "" }));
  };

  const validateContactForm = () => {
    const nextErrors: ContactFormErrors = {};
    if (contactValues.name.trim().length < 2) nextErrors.name = "Name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactValues.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (contactValues.message.trim().length < 10) nextErrors.message = "Message must be at least 10 characters.";
    return nextErrors;
  };

  const handleContactSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateContactForm();
    if (Object.keys(nextErrors).length > 0) {
      setContactErrors(nextErrors);
      setContactStatus({ tone: "error", message: "Submission blocked. Check the terminal parameters and try again." });
      return;
    }
    setIsSubmitting(true);
    setContactStatus({ tone: "idle", message: "" });
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";
    try {
      const response = await fetch(`${apiBaseUrl}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactValues),
      });
      const payload = (await response.json()) as ContactResponse;
      if (!response.ok) {
        setContactErrors({
          name: payload.issues?.fieldErrors?.name?.[0] ?? "",
          email: payload.issues?.fieldErrors?.email?.[0] ?? "",
          message: payload.issues?.fieldErrors?.message?.[0] ?? "",
        });
        setContactStatus({ tone: "error", message: payload.message || "Submission failed. Try again." });
        return;
      }
      setContactValues(initialContactValues);
      setContactErrors({});
      setContactStatus({
        tone: "success",
        message: payload.receiptId ? `${payload.message} Receipt: ${payload.receiptId}.` : payload.message,
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
      <main id="main-content" className="relative isolate overflow-hidden text-white">
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] bg-[radial-gradient(circle_at_18%_16%,rgba(111,251,190,0.18),transparent_34%),radial-gradient(circle_at_82%_8%,rgba(255,255,255,0.08),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_46%)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={shouldReduceMotion ? undefined : { opacity: heroGlowOpacity }}
          transition={{ duration: 0.8 }}
        />
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 pb-24 pt-24 sm:gap-14 sm:px-6 lg:px-8 lg:pt-28">
          <motion.section
            ref={heroRef}
            animate="visible"
            className="grid gap-7 xl:grid-cols-[minmax(0,1.08fr)_minmax(28rem,0.92fr)] xl:items-start"
            initial="hidden"
            variants={heroStaggerChildren}
          >
            <motion.div
              className="mx-auto w-full max-w-[44rem] space-y-7 text-center xl:mx-0 xl:max-w-none xl:text-left"
              style={shouldReduceMotion ? undefined : { y: heroLeadY }}
              variants={heroReveal}
            >
              <div className="space-y-4">
                <h1 className="mx-auto max-w-4xl text-5xl font-semibold tracking-[-0.085em] text-white [text-wrap:balance] sm:text-6xl lg:text-7xl xl:mx-0 xl:text-[7.8rem]">
                  <span className="block">Shubham</span>
                  <span className="block text-white/92">Sharma</span>
                </h1>
                <div className="font-mono text-sm uppercase tracking-[0.4em] text-[var(--color-accent)] sm:text-base">
                  Full-Stack Developer
                </div>
              </div>
              <p className="mx-auto max-w-2xl text-lg leading-8 text-white/74 sm:text-xl xl:mx-0">{person.valueProposition}</p>
              <div className="flex flex-wrap justify-center gap-3 xl:justify-start">
                {heroActions.map((action) => <ActionButton action={action} key={action.label} />)}
              </div>
            </motion.div>
            <motion.aside
              className="w-full"
              style={shouldReduceMotion ? undefined : { y: heroPanelY, scale: heroPanelScale }}
              variants={heroReveal}
            >
              <HeroCapabilityConstellation routes={capabilityRoutes} />
            </motion.aside>
          </motion.section>

          <motion.section
            className="space-y-6"
            id="work"
            initial="hidden"
            variants={sectionStagger}
            viewport={sectionViewport}
            whileInView="visible"
          >
            <motion.div custom={{ direction: "left", distance: 14 }} variants={sectionReveal}>
              <SectionHeading title="Work" />
            </motion.div>
            {featuredProject ? (
              <motion.div
                className="space-y-5 xl:grid xl:grid-cols-[1.16fr_0.84fr] xl:items-start xl:gap-5 xl:space-y-0"
                variants={groupStagger}
              >
                <ProjectCard
                  featured
                  isPreviewOpen={activeProject?.slug === featuredProject.slug}
                  onPreview={setActiveProject}
                  project={featuredProject}
                  reveal={{ direction: "left", distance: 22 }}
                />
                <motion.div className="space-y-5" variants={groupStagger}>
                  {supportingProjects.map((project, index) => (
                    <ProjectCard
                      isPreviewOpen={activeProject?.slug === project.slug}
                      key={project.slug}
                      onPreview={setActiveProject}
                      project={project}
                      reveal={{
                        direction: index % 2 === 0 ? "right" : "left",
                        distance: 18 + index * 3,
                      }}
                    />
                  ))}
                </motion.div>
              </motion.div>
            ) : null}
          </motion.section>

          <motion.section
            className="space-y-6 pt-2 sm:pt-4"
            id="stack"
            initial="hidden"
            variants={sectionStagger}
            viewport={sectionViewport}
            whileInView="visible"
          >
            <motion.div custom={{ direction: "right", distance: 14 }} variants={sectionReveal}>
              <SectionHeading title="Stack" />
            </motion.div>
            <motion.div className="grid gap-4 xl:grid-cols-5 xl:items-start" variants={groupStagger}>
              {technicalStack.map((category, index) => (
                <StackCard
                  category={category}
                  key={category.id}
                  reveal={{
                    direction: index % 2 === 0 ? "left" : "right",
                    distance: 16 + (index % 3) * 2,
                  }}
                />
              ))}
            </motion.div>
          </motion.section>

          <motion.section
            className="space-y-6"
            id="about"
            initial="hidden"
            variants={sectionStagger}
            viewport={sectionViewport}
            whileInView="visible"
          >
            <motion.div custom={{ direction: "left", distance: 14 }} variants={sectionReveal}>
              <SectionHeading title="About" />
            </motion.div>
            <motion.div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr] xl:items-start" variants={groupStagger}>
              <motion.div className="space-y-5" custom={{ direction: "left", distance: 18 }} variants={sectionReveal}>
                <div className="flex justify-center xl:justify-start">
                  <div className="w-full max-w-[17.5rem] sm:max-w-[20rem] lg:max-w-[23rem] xl:max-w-none">
                    <div className="overflow-hidden rounded-[1.6rem]">
                      {person.introMediaUrl ? (
                        <video
                          aria-label={`${person.firstName} ${person.lastName} introduction video`}
                          autoPlay={!shouldReduceMotion}
                          className="aspect-[5/6] w-full object-cover object-center sm:aspect-[4/5]"
                          loop
                          muted
                          playsInline
                          preload="metadata"
                        >
                          <source src={person.introMediaUrl} type="video/mp4" />
                        </video>
                      ) : (
                        <div className="flex aspect-[5/6] items-center justify-center text-8xl font-semibold tracking-[-0.08em] text-white sm:aspect-[4/5]">
                          {person.firstName[0]}
                          {person.lastName[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <motion.div className="grid gap-4 sm:grid-cols-2" variants={groupStagger}>
                  <motion.div custom={{ direction: "left", distance: 12 }} variants={sectionReveal}>
                    <StatCard label="Identity" value={`${person.firstName} ${person.lastName}`} />
                  </motion.div>
                  <motion.div custom={{ direction: "right", distance: 12 }} variants={sectionReveal}>
                    <StatCard label="Role" value={person.role} />
                  </motion.div>
                  <motion.div custom={{ direction: "left", distance: 12 }} variants={sectionReveal}>
                    <StatCard label="Location" value={person.location} />
                  </motion.div>
                  <motion.div custom={{ direction: "right", distance: 12 }} variants={sectionReveal}>
                    <StatCard label="Timezone" value={person.timezone} />
                  </motion.div>
                </motion.div>
              </motion.div>
              <motion.div className="space-y-5" custom={{ direction: "right", distance: 20 }} variants={sectionReveal}>
                <ProjectGlassPanel className="p-6 sm:p-8">
                  <p className="text-base leading-8 text-white/70">
                    I build product-focused software across frontend, backend, and AI integration work, with an emphasis on clarity, maintainability, and practical delivery.
                  </p>
                </ProjectGlassPanel>
                <ProjectGlassPanel className="p-6 sm:p-8">
                  <motion.div
                    className="relative mt-6 space-y-4 before:absolute before:left-[0.28rem] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-gradient-to-b before:from-[color:rgba(111,251,190,0.5)] before:via-white/12 before:to-transparent"
                    variants={groupStagger}
                  >
                    {experience.map((item, index) => (
                      <TimelineItem
                        item={item}
                        key={`${item.company}-${item.period}`}
                        reveal={{ direction: index % 2 === 0 ? "left" : "right", distance: 14 }}
                      />
                    ))}
                  </motion.div>
                </ProjectGlassPanel>
              </motion.div>
            </motion.div>
          </motion.section>

          <motion.section
            className="space-y-6"
            id="contact"
            initial="hidden"
            variants={sectionStagger}
            viewport={sectionViewport}
            whileInView="visible"
          >
            <motion.div custom={{ direction: "right", distance: 14 }} variants={sectionReveal}>
              <SectionHeading title="Contact" />
            </motion.div>
            <motion.div className="grid gap-6 xl:grid-cols-[0.88fr_1.12fr] xl:items-start" variants={groupStagger}>
              <motion.div custom={{ direction: "left", distance: 18 }} variants={sectionReveal}>
                <ProjectGlassPanel className="h-full p-6 sm:p-8" tone="signal">
                  <div className="inline-flex items-center gap-2 text-[var(--color-accent)]">
                    <Send className="h-4 w-4" />
                  </div>
                  <h3 className="mt-5 text-4xl font-semibold tracking-[-0.06em] text-white [text-wrap:balance]">
                    Get in touch.
                  </h3>
                  <p className="mt-5 max-w-xl text-base leading-8 text-white/68">
                    Available for roles, freelance work, and product collaborations.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    {contactLinks.map((link) => renderContactLink(link))}
                  </div>
                </ProjectGlassPanel>
              </motion.div>
              <motion.div custom={{ direction: "right", distance: 20 }} variants={sectionReveal}>
                <ProjectGlassPanel className="overflow-hidden" tone="signal">
                  <form className="space-y-5 p-5 sm:p-6" onSubmit={handleContactSubmit}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <ContactInput error={contactErrors.name} label="Name">
                        <input
                          className="w-full rounded-[1.2rem] border border-white/10 bg-black/28 px-4 py-3 text-white outline-none transition duration-300 placeholder:text-white/26 focus:border-[color:rgba(111,251,190,0.3)] focus:bg-black/38"
                          name="name"
                          onChange={handleContactChange}
                          placeholder="Enter your name"
                          type="text"
                          value={contactValues.name}
                        />
                      </ContactInput>
                      <ContactInput error={contactErrors.email} label="Email">
                        <input
                          className="w-full rounded-[1.2rem] border border-white/10 bg-black/28 px-4 py-3 text-white outline-none transition duration-300 placeholder:text-white/26 focus:border-[color:rgba(111,251,190,0.3)] focus:bg-black/38"
                          name="email"
                          onChange={handleContactChange}
                          placeholder="you@company.com"
                          type="email"
                          value={contactValues.email}
                        />
                      </ContactInput>
                    </div>
                    <ContactInput error={contactErrors.message} label="Message">
                      <textarea
                        className="min-h-40 w-full rounded-[1.2rem] border border-white/10 bg-black/28 px-4 py-3 text-white outline-none transition duration-300 placeholder:text-white/26 focus:border-[color:rgba(111,251,190,0.3)] focus:bg-black/38"
                        name="message"
                        onChange={handleContactChange}
                        placeholder="Describe the project, role, or collaboration scope."
                        rows={6}
                        value={contactValues.message}
                      />
                    </ContactInput>
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        className="inline-flex items-center justify-center rounded-full border border-[color:rgba(111,251,190,0.24)] bg-[color:rgba(111,251,190,0.1)] px-5 py-3 font-mono text-[0.72rem] uppercase tracking-[0.28em] text-[var(--color-accent)] transition duration-300 motion-safe:hover:-translate-y-0.5 motion-safe:hover:bg-[color:rgba(111,251,190,0.16)] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={isSubmitting}
                        type="submit"
                      >
                        {isSubmitting ? "Sending" : "Send"}
                      </button>
                    </div>
                    {contactStatus.message ? (
                      <div
                        className={cx(
                          "rounded-[1.2rem] border px-4 py-3 text-sm leading-7",
                          contactStatus.tone === "success"
                            ? "border-[color:rgba(111,251,190,0.24)] bg-[color:rgba(111,251,190,0.08)] text-[var(--color-accent)]"
                            : "border-rose-400/24 bg-rose-400/10 text-rose-200",
                        )}
                        role="status"
                      >
                        {contactStatus.message}
                      </div>
                    ) : null}
                  </form>
                </ProjectGlassPanel>
              </motion.div>
            </motion.div>
          </motion.section>
        </div>
      </main>
      <AnimatePresence>
        {activeProject ? (
          <QuickPreviewModal key={activeProject.slug} onClose={() => setActiveProject(null)} project={activeProject} />
        ) : null}
      </AnimatePresence>
    </>
  );
}
