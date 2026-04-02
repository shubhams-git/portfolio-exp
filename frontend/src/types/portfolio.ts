export type NavigationLink = {
  label: string;
  href: string;
};

export type PortfolioLinkKind = "internal" | "external" | "download" | "unavailable";

export type PortfolioLinkMetadata = {
  kind: PortfolioLinkKind;
  note?: string;
  downloadName?: string;
  target?: "_blank";
  rel?: string;
};

export type HeroAction = {
  label: string;
  href: string;
  variant: "primary" | "secondary";
} & PortfolioLinkMetadata;

export type ProjectMetric = {
  label: string;
  value: string;
  detail?: string;
};

export type ProjectPreview = {
  title: string;
  problemScope: string;
  architecturalSolution: string;
  metrics: ProjectMetric[];
  appliedStack: string[];
};

export type ArchitectureLayer = {
  label: string;
  detail: string;
};

export type ProjectCaseStudy = {
  headline: string;
  seoDescription: string;
  overview: string;
  challenge: string[];
  recruiterHighlights: string[];
  architectureSummary: string;
  architectureLayers: ArchitectureLayer[];
  codeFile: string;
  codeSnippet: string;
  imageCaption: string;
};

export type ProjectVisualAsset = {
  assetUrl: string;
  alt: string;
  tone: "neutral" | "cool" | "warm" | "signal";
  objectPosition?: string;
  zoom?: number;
};

export type Project = {
  slug: string;
  index: string;
  name: string;
  category: string;
  summary: string;
  problem: string;
  role: string;
  coreStack: string[];
  architectureChallenge: string;
  impact: string;
  proofPoints: string[];
  deliverySignals: ProjectMetric[];
  featured?: boolean;
  preview: ProjectPreview;
  caseStudy: ProjectCaseStudy;
  visual: ProjectVisualAsset;
};

export type TechCategory = {
  id: string;
  title: string;
  summary: string;
  signal: string;
  evidence: string;
  items: string[];
};

export type ExperienceItem = {
  company: string;
  period: string;
  focus: string;
  summary: string;
};

export type ContactLink = {
  label: string;
  href: string;
} & PortfolioLinkMetadata;

export type PortfolioContent = {
  siteTitle: string;
  person: {
    firstName: string;
    lastName: string;
    role: string;
    location: string;
    timezone: string;
    status: string;
    availabilityNote: string;
    valueProposition: string;
    introMediaUrl?: string;
  };
  navigation: NavigationLink[];
  heroActions: HeroAction[];
  projects: Project[];
  technicalStack: TechCategory[];
  experience: ExperienceItem[];
  contactLinks: ContactLink[];
};
