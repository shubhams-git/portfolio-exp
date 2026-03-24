import { Link, useLocation } from "react-router-dom";

import { portfolioContent } from "@/content/portfolio-content";

export function SiteHeader() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="site-header">
      <a className="site-header__skip-link" href="#main-content">
        Skip to content
      </a>
      <Link aria-label="Architect OS home" className="site-header__brand" to="/">
        Architect_OS
      </Link>
      <nav aria-label="Primary" className="site-header__nav">
        {portfolioContent.navigation.map((link) => {
          const isProjectsRoute = location.pathname.startsWith("/projects");
          const isActive = isProjectsRoute
            ? link.label === "Work"
            : location.hash === link.href;

          return (
            <Link
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "site-header__nav-link site-header__nav-link--active"
                  : "site-header__nav-link"
              }
              key={link.label}
              to={isHome ? link.href : `/${link.href}`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
