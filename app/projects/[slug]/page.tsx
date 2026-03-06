import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Github, Globe } from "lucide-react";
import { Container } from "@/components/molecules/container";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import * as Fade from "@/components/motion/fade";
import { getProjectBySlug, getAllProjects } from "@/data/projects";
import { formatDate } from "@/lib/date";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    return {
      title: "Project Not Found",
    };
  }

  return {
    title: `${project.title} | Abhay Bhardwaj`,
    description: project.description,
  };
}

export async function generateStaticParams() {
  const projects = getAllProjects();
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <Fade.Container>
      <Container className="mb-30">
        {/* Back Link */}
        <Fade.Item>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-150 mt-4 mb-8"
          >
            <ArrowLeft className="size-3.5" />
            Back to Projects
          </Link>
        </Fade.Item>

        {/* Header */}
        <header className="mb-8">
          <Fade.Item>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Badge variant="secondary">
                {project.status === "completed" ? "Completed" : "In Progress"}
              </Badge>
              <span className="tabular-nums">{formatDate(project.date)}</span>
            </div>
          </Fade.Item>
          <Fade.Item>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-pretty mb-4">
              {project.title}
            </h1>
          </Fade.Item>
          <Fade.Item>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
              {project.description}
            </p>
          </Fade.Item>

          {/* Action Buttons */}
          <Fade.Item>
            <div className="flex items-center gap-3 mt-6">
              {project.liveUrl && (
                <Link
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "default" })}
                >
                  <Globe className="size-3.5" />
                  Live Demo
                  <ArrowUpRight className="size-3" />
                </Link>
              )}
              {project.githubUrl && (
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <Github className="size-3.5" />
                  Source Code
                </Link>
              )}
            </div>
          </Fade.Item>
        </header>

        {/* Project Image */}
        <Fade.Item>
          <div className="relative aspect-2/1 rounded-lg overflow-hidden border border-border mb-12">
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </Fade.Item>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            {/* About */}
            <Fade.Item>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    About the Project
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {project.longDescription}
                </p>
              </section>
            </Fade.Item>

            {/* Motivation */}
            <Fade.Item>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Why I Built This
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <p className="text-sm text-foreground leading-relaxed">
                  {project.motivation}
                </p>
              </section>
            </Fade.Item>

            {/* Features */}
            <Fade.Item>
              <section>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Key Features
                  </h2>
                  <div className="flex-1 h-px bg-border" />
                </div>
                <ul className="space-y-3">
                  {project.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-sm text-foreground"
                    >
                      <span className="size-1.5 rounded-full bg-foreground mt-2 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </section>
            </Fade.Item>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Fade.Item>
              <aside className="sticky top-24 space-y-6">
                {/* Tech Stack */}
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs font-medium px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Project Info */}
                <div className="rounded-lg border border-border bg-card p-5">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                    Project Info
                  </h3>
                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Status</dt>
                      <dd className="text-foreground font-medium capitalize">
                        {project.status.replace("-", " ")}
                      </dd>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Date</dt>
                      <dd className="text-foreground font-medium tabular-nums">
                        {formatDate(project.date)}
                      </dd>
                    </div>
                    {project.liveUrl && (
                      <>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <dt className="text-muted-foreground">Website</dt>
                          <dd>
                            <Link
                              href={project.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground font-medium hover:text-primary transition-colors duration-150 inline-flex items-center gap-1"
                            >
                              Visit
                              <ArrowUpRight className="size-3" />
                            </Link>
                          </dd>
                        </div>
                      </>
                    )}
                    {project.githubUrl && (
                      <>
                        <Separator />
                        <div className="flex justify-between items-center">
                          <dt className="text-muted-foreground">Repository</dt>
                          <dd>
                            <Link
                              href={project.githubUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-foreground font-medium hover:text-primary transition-colors duration-150 inline-flex items-center gap-1"
                            >
                              GitHub
                              <ArrowUpRight className="size-3" />
                            </Link>
                          </dd>
                        </div>
                      </>
                    )}
                  </dl>
                </div>
              </aside>
            </Fade.Item>
          </div>
        </div>
      </Container>
    </Fade.Container>
  );
}
