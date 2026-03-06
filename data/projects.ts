export interface Project {
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  techStack: string[];
  features: string[];
  motivation: string;
  liveUrl?: string;
  githubUrl?: string;
  date: string;
  status: "completed" | "in-progress" | "archived";
}

export const projects: Project[] = [
  {
    slug: "devflow",
    title: "DevFlow",
    description:
      "A modern developer productivity dashboard that integrates with GitHub, Jira, and Slack to streamline your workflow.",
    longDescription:
      "DevFlow is a comprehensive developer productivity platform designed to centralize all your development activities in one place. It provides real-time insights into your coding patterns, team collaboration metrics, and project progress. The dashboard features customizable widgets, automated status updates, and intelligent notifications that help developers stay focused and productive.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop",
    techStack: [
      "Next.js",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "Tailwind CSS",
      "Redis",
    ],
    features: [
      "Real-time GitHub activity tracking",
      "Automated standup reports",
      "Team collaboration insights",
      "Custom widget dashboard",
      "Slack and Jira integration",
    ],
    motivation:
      "As a developer, I found myself constantly switching between different tools to track my work progress. I wanted to build a unified dashboard that brings all essential information together, reducing context switching and improving focus. DevFlow was born from the need to have a single source of truth for daily development activities.",
    liveUrl: "https://devflow.demo.com",
    githubUrl: "https://github.com/iamabhay17/devflow",
    date: "2025-08-15",
    status: "completed",
  },
  {
    slug: "pixel-palette",
    title: "Pixel Palette",
    description:
      "An AI-powered color palette generator that creates beautiful, accessible color schemes for your projects.",
    longDescription:
      "Pixel Palette leverages machine learning to generate harmonious color palettes based on various inputs like images, moods, or design styles. It ensures all generated palettes meet WCAG accessibility standards, making it perfect for creating inclusive designs. The tool also provides color contrast ratios, CSS exports, and Figma plugin integration.",
    image:
      "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=400&fit=crop",
    techStack: ["React", "Python", "TensorFlow", "FastAPI", "Tailwind CSS"],
    features: [
      "AI-powered palette generation",
      "WCAG accessibility checker",
      "Image color extraction",
      "Export to CSS, Tailwind, Figma",
      "Save and share palettes",
    ],
    motivation:
      "Color selection is one of the most challenging aspects of design for developers. I built Pixel Palette to democratize good design by making it easy for anyone to create professional, accessible color schemes without needing a design background.",
    liveUrl: "https://pixelpalette.demo.com",
    githubUrl: "https://github.com/iamabhay17/pixel-palette",
    date: "2025-05-20",
    status: "completed",
  },
  {
    slug: "api-forge",
    title: "API Forge",
    description:
      "A visual API builder that lets you design, mock, and test RESTful APIs without writing code.",
    longDescription:
      "API Forge is a no-code/low-code platform for designing and prototyping APIs. It features a visual interface for defining endpoints, request/response schemas, and validation rules. The tool automatically generates OpenAPI specifications, mock servers, and client SDKs. Perfect for rapid prototyping and API-first development workflows.",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop",
    techStack: ["Next.js", "TypeScript", "MongoDB", "Express", "Docker"],
    features: [
      "Visual API designer",
      "Auto-generated mock servers",
      "OpenAPI spec generation",
      "Client SDK generation",
      "Collaborative editing",
    ],
    motivation:
      "During my time at Cosmocloud, I realized how much time teams spend on API documentation and mocking. API Forge was created to streamline the API design process, allowing teams to iterate faster and maintain consistency across their API ecosystem.",
    githubUrl: "https://github.com/iamabhay17/api-forge",
    date: "2025-02-10",
    status: "in-progress",
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getAllProjects(): Project[] {
  return projects.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}
