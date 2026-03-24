import { portfolioContent } from "@/content/portfolio-content";
import type { Project } from "@/types/portfolio";

export function getProjectBySlug(slug: string | undefined): Project | undefined {
  return portfolioContent.projects.find((project) => project.slug === slug);
}

export function getAdjacentProjects(slug: string) {
  const index = portfolioContent.projects.findIndex((project) => project.slug === slug);

  if (index === -1) {
    return { previousProject: undefined, nextProject: undefined };
  }

  return {
    previousProject: portfolioContent.projects[index - 1],
    nextProject: portfolioContent.projects[index + 1],
  };
}
