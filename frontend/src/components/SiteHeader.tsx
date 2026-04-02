import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useScroll, useSpring } from "motion/react";
import { Link, useLocation } from "react-router-dom";

import { portfolioContent } from "@/content/portfolio-content";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function navItemClass(isActive: boolean) {
  return isActive
    ? "rounded-full border border-[#6FFBBE]/25 bg-[#6FFBBE]/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-[#d8fff0] transition duration-300"
    : "rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.28em] text-zinc-300 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08] hover:text-white";
}

export function SiteHeader() {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isProjectsRoute = location.pathname.startsWith("/projects");
  const [activeHref, setActiveHref] = useState<string>(location.hash);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progressScaleX = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 28,
    mass: 0.28,
  });

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.hash, location.pathname]);

  useEffect(() => {
    if (!isHome) {
      setActiveHref(isProjectsRoute ? "#work" : "");
      return;
    }

    const sections = portfolioContent.navigation
      .map((link) => document.querySelector<HTMLElement>(link.href))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio);

        if (visibleEntries[0]) {
          setActiveHref(`#${visibleEntries[0].target.id}`);
          return;
        }

        if (window.scrollY < 220) {
          setActiveHref("");
        }
      },
      {
        rootMargin: "-24% 0px -52% 0px",
        threshold: [0.15, 0.3, 0.5, 0.7],
      },
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [isHome, isProjectsRoute]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#040507]/80 backdrop-blur-xl">
      <motion.div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px origin-left bg-[linear-gradient(90deg,rgba(111,251,190,0),rgba(111,251,190,0.92),rgba(255,255,255,0.65))]"
        style={{ scaleX: progressScaleX }}
      />
      <a
        className="fixed left-4 top-4 z-50 -translate-y-20 rounded-full border border-white/10 bg-[#040507]/95 px-4 py-2 text-xs uppercase tracking-[0.28em] text-white transition duration-300 focus:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6FFBBE]/60"
        href="#main-content"
      >
        Skip to content
      </a>

      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-4 md:items-center">
          <Link aria-label="Shubham Sharma home" className="flex min-w-0 flex-col pr-2" to="/">
            <span className="text-base font-semibold tracking-[-0.04em] text-white sm:text-lg">
              {portfolioContent.person.firstName} {portfolioContent.person.lastName}
            </span>
            <span className="max-w-[10rem] text-[0.64rem] uppercase tracking-[0.24em] text-zinc-500 sm:max-w-none sm:text-[0.68rem] sm:tracking-[0.34em]">
              {portfolioContent.siteTitle}
            </span>
          </Link>

          <div className="hidden flex-1 items-center justify-center xl:flex">
            <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-2 text-[0.68rem] uppercase tracking-[0.3em] text-zinc-400">
              Full-Stack Developer / Melbourne, VIC
            </div>
          </div>

          <nav aria-label="Primary" className="hidden items-center justify-end gap-2 md:flex">
            {portfolioContent.navigation.map((link) => {
              const isActive = isProjectsRoute ? link.label === "Work" : activeHref === link.href;

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={navItemClass(isActive)}
                  key={link.label}
                  onClick={() => setActiveHref(link.href)}
                  to={isHome ? link.href : `/${link.href}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <button
            aria-controls="mobile-primary-nav"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-zinc-200 transition duration-300 hover:border-white/20 hover:bg-white/[0.08] hover:text-white md:hidden"
            onClick={() => setIsMenuOpen((open) => !open)}
            type="button"
          >
            {isMenuOpen ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isMenuOpen ? (
            <motion.nav
              animate={{ height: "auto", opacity: 1, y: 0 }}
              aria-label="Primary mobile"
              className="overflow-hidden md:hidden"
              exit={{ height: 0, opacity: 0, y: -8 }}
              id="mobile-primary-nav"
              initial={{ height: 0, opacity: 0, y: -8 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/8 pt-3 sm:grid-cols-4">
                {portfolioContent.navigation.map((link) => {
                  const isActive = isProjectsRoute ? link.label === "Work" : activeHref === link.href;

                  return (
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className={cx(
                        navItemClass(isActive),
                        "justify-center text-center",
                      )}
                      key={link.label}
                      onClick={() => {
                        setActiveHref(link.href);
                        setIsMenuOpen(false);
                      }}
                      to={isHome ? link.href : `/${link.href}`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </motion.nav>
          ) : null}
        </AnimatePresence>
      </div>
    </header>
  );
}
