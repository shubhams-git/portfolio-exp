import { portfolioContent } from "@/content/portfolio-content";

function isExternalLink(href: string) {
  return /^(https?:|mailto:|tel:)/.test(href);
}

export function SiteFooter({ status }: { status: string }) {
  return (
    <footer className="site-footer">
      <div>
        <div className="site-footer__brand">The Layered Matrix</div>
        <div className="site-footer__status">[system_ready] {status}</div>
      </div>

      <div className="site-footer__links">
        {portfolioContent.contactLinks.map((link) => (
          <a
            className={`site-footer__link ${
              link.kind === "unavailable" ? "site-footer__link--muted" : ""
            }`}
            download={link.kind === "download" ? link.downloadName : undefined}
            href={link.href}
            key={link.label}
            rel={link.rel ?? (isExternalLink(link.href) ? "noreferrer" : undefined)}
            target={link.target ?? (isExternalLink(link.href) ? "_blank" : undefined)}
            title={link.note}
          >
            {link.label}
          </a>
        ))}
      </div>
    </footer>
  );
}
