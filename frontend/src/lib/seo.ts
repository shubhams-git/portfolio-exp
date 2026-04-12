export type SeoMetadata = {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  imageAlt?: string;
  siteName?: string;
  type?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  twitterCard?: "summary" | "summary_large_image";
  twitterSite?: string;
  twitterCreator?: string;
  author?: string;
  keywords?: string;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
};

const SITE_URL = "https://portfolio-of-shubham.vercel.app";
const DEFAULT_TITLE = "Shubham Sharma | Full-Stack Developer — Portfolio";
const DEFAULT_DESCRIPTION =
  "Shubham Sharma is a Melbourne-based full-stack developer building with React, Node.js, Python, and AI. Explore projects in conversational AI, data visualization, and cloud-deployed ML systems.";
const DEFAULT_IMAGE = "/meta/og-default.svg";
const DEFAULT_IMAGE_ALT = "Shubham Sharma — Full-Stack Developer Portfolio";
const DEFAULT_SITE_NAME = "Shubham Sharma — Portfolio";
const DEFAULT_TWITTER_CARD = "summary_large_image";
const DEFAULT_AUTHOR = "Shubham Sharma";

function getOrigin() {
  if (typeof window === "undefined") {
    return SITE_URL;
  }

  return window.location.origin;
}

function resolveUrl(value?: string) {
  if (!value) {
    return "";
  }

  if (/^(https?:|data:|mailto:|tel:|\/)/i.test(value)) {
    if (value.startsWith("/")) {
      return `${getOrigin()}${value}`;
    }

    return value;
  }

  return `${getOrigin()}/${value.replace(/^\/+/, "")}`;
}

function withFallback(value: string | undefined, fallback: string) {
  return value?.trim() ? value.trim() : fallback;
}

function upsertMeta(attribute: "name" | "property", key: string, content: string) {
  const selector = `meta[${attribute}="${key}"]`;
  let tag = document.head.querySelector<HTMLMetaElement>(selector);

  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  const selector = `link[rel="${rel}"]`;
  let tag = document.head.querySelector<HTMLLinkElement>(selector);

  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }

  tag.setAttribute("href", href);
}

function setRobotsMeta(noIndex?: boolean, noFollow?: boolean) {
  const directives = [
    noIndex ? "noindex" : "index",
    noFollow ? "nofollow" : "follow",
  ];

  upsertMeta("name", "robots", directives.join(","));
}

const DYNAMIC_JSONLD_ID = "dynamic-jsonld";

function injectJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  let script = document.getElementById(DYNAMIC_JSONLD_ID) as HTMLScriptElement | null;

  if (!script) {
    script = document.createElement("script");
    script.id = DYNAMIC_JSONLD_ID;
    script.type = "application/ld+json";
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(data);
}

export function setDocumentMetadata(title: string, description: string): void;
export function setDocumentMetadata(metadata: SeoMetadata): void;
export function setDocumentMetadata(
  titleOrMetadata: string | SeoMetadata,
  description?: string,
) {
  const metadata =
    typeof titleOrMetadata === "string"
      ? { title: titleOrMetadata, description }
      : titleOrMetadata;

  const resolvedTitle = withFallback(metadata.title, DEFAULT_TITLE);
  const resolvedDescription = withFallback(metadata.description, DEFAULT_DESCRIPTION);
  const resolvedImage = resolveUrl(metadata.image ?? DEFAULT_IMAGE);
  const resolvedCanonical = resolveUrl(
    metadata.canonical ?? (typeof window !== "undefined" ? window.location.pathname : "/"),
  );
  const resolvedSiteName = withFallback(metadata.siteName, DEFAULT_SITE_NAME);
  const resolvedImageAlt = withFallback(metadata.imageAlt, DEFAULT_IMAGE_ALT);
  const resolvedCard = metadata.twitterCard ?? DEFAULT_TWITTER_CARD;
  const resolvedType = metadata.type ?? "website";

  document.title = resolvedTitle;

  upsertMeta("name", "description", resolvedDescription);
  upsertMeta("name", "author", metadata.author ?? DEFAULT_AUTHOR);
  upsertMeta("property", "og:title", resolvedTitle);
  upsertMeta("property", "og:description", resolvedDescription);
  upsertMeta("property", "og:type", resolvedType);
  upsertMeta("property", "og:site_name", resolvedSiteName);
  upsertMeta("property", "og:image", resolvedImage);
  upsertMeta("property", "og:image:alt", resolvedImageAlt);
  upsertMeta("property", "og:url", resolvedCanonical);
  upsertMeta("property", "og:locale", "en_AU");
  upsertMeta("name", "twitter:card", resolvedCard);
  upsertMeta("name", "twitter:title", resolvedTitle);
  upsertMeta("name", "twitter:description", resolvedDescription);
  upsertMeta("name", "twitter:image", resolvedImage);
  upsertMeta("name", "twitter:image:alt", resolvedImageAlt);

  if (metadata.keywords) {
    upsertMeta("name", "keywords", metadata.keywords);
  }

  if (metadata.twitterSite) {
    upsertMeta("name", "twitter:site", metadata.twitterSite);
  }

  if (metadata.twitterCreator) {
    upsertMeta("name", "twitter:creator", metadata.twitterCreator);
  }

  if (resolvedCanonical) {
    upsertLink("canonical", resolvedCanonical);
  }

  setRobotsMeta(metadata.noIndex, metadata.noFollow);

  if (metadata.jsonLd) {
    injectJsonLd(metadata.jsonLd);
  }
}
