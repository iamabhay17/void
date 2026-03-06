import { ArrowUpRight } from "lucide-react";
import { Link } from "next-view-transitions";
import Image from "next/image";
import type { Project } from "@/data/projects";
import { Badge } from "./badge";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group block rounded-lg border border-border bg-card overflow-hidden hover:bg-accent/50 transition-colors duration-150"
    >
      <div className="relative aspect-2/1 overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {project.status === "in-progress" && (
          <div className="absolute top-3 right-3">
            <Badge
              variant="secondary"
              className="bg-background/90 backdrop-blur-sm"
            >
              In Progress
            </Badge>
          </div>
        )}
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h3 className="text-sm lg:text-base font-semibold text-foreground transition-colors duration-150 text-pretty">
            {project.title}
          </h3>
          <ArrowUpRight
            className="size-4 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-150 mt-0.5"
            aria-hidden="true"
          />
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.slice(0, 4).map((tech) => (
            <span
              key={tech}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground"
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 4 && (
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground">
              +{project.techStack.length - 4}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
