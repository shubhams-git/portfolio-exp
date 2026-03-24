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
};

const DEFAULT_TITLE = "The Layered Matrix";
const DEFAULT_DESCRIPTION =
  "A cinematic, recruiter-readable software engineering portfolio for Shubham Sharma.";
const DEFAULT_IMAGE = "/meta/og-default.svg";
const DEFAULT_IMAGE_ALT = "The Layered Matrix portfolio preview";
const DEFAULT_SITE_NAME = "The Layered Matrix";
const DEFAULT_TWITTER_CARD = "summary_large_image";

function getOrigin() {
  if (typeof window === "undefined") {
    return "";
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
  upsertMeta("property", "og:title", resolvedTitle);
  upsertMeta("property", "og:description", resolvedDescription);
  upsertMeta("property", "og:type", resolvedType);
  upsertMeta("property", "og:site_name", resolvedSiteName);
  upsertMeta("property", "og:image", resolvedImage);
  upsertMeta("property", "og:image:alt", resolvedImageAlt);
  upsertMeta("property", "og:url", resolvedCanonical);
  upsertMeta("name", "twitter:card", resolvedCard);
  upsertMeta("name", "twitter:title", resolvedTitle);
  upsertMeta("name", "twitter:description", resolvedDescription);
  upsertMeta("name", "twitter:image", resolvedImage);
  upsertMeta("name", "twitter:image:alt", resolvedImageAlt);

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
}
