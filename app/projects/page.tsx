import type { Metadata } from "next";
import { Container } from "@/components/molecules/container";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/ui/project-card";
import * as Fade from "@/components/motion/fade";
import { getAllProjects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects | Abhay Bhardwaj",
  description:
    "A showcase of projects I've built - from developer tools to creative experiments.",
};

export default function ProjectsPage() {
  const projects = getAllProjects();

  return (
    <Fade.Container>
      <Container className="mb-30">
        {/* Header */}
        <header className="mb-12 mt-4">
          <Fade.Item>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Badge variant="secondary">Projects</Badge>
              <Badge variant="secondary">Open Source</Badge>
            </div>
          </Fade.Item>
          <Fade.Item>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-pretty mb-4">
              Things I&apos;ve Built
            </h1>
          </Fade.Item>
          <Fade.Item>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
              A collection of projects that showcase my passion for building
              useful tools and exploring new technologies. Each project
              represents a problem I wanted to solve.
            </p>
          </Fade.Item>
        </header>

        {/* Section Header */}
        <section>
          <Fade.Item>
            <div className="flex items-center gap-4 mb-10">
              <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                All Projects
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>
          </Fade.Item>

          {/* Projects Grid */}
          {projects.length === 0 ? (
            <div className="text-center border rounded-sm py-12">
              <p className="text-sm text-muted-foreground">
                No projects yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((project) => (
                <Fade.Item key={project.slug}>
                  <ProjectCard project={project} />
                </Fade.Item>
              ))}
            </div>
          )}
        </section>
      </Container>
    </Fade.Container>
  );
}
