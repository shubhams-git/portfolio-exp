import { portfolioContent } from "@/content/portfolio-content";

function isExternalLink(href: string) {
  return /^(https?:|mailto:|tel:)/.test(href);
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 bg-[#040507]">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-lg font-semibold tracking-[-0.04em] text-white">
              {portfolioContent.person.firstName} {portfolioContent.person.lastName}
            </div>
            <p className="mt-2 text-sm text-zinc-400">{portfolioContent.person.location}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {portfolioContent.contactLinks.map((link) => (
              <a
                className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs uppercase tracking-[0.24em] text-zinc-300 transition duration-300 hover:border-white/16 hover:bg-white/[0.06] hover:text-white"
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
        </div>
      </div>
    </footer>
  );
}
