import { ArrowUpRight } from "lucide-react";
import * as Fade from "@/components/motion/fade";
import { experiences } from "@/data/experience";
import Image from "next/image";

export const ExperienceSection = () => {
  return (
    <section>
      <Fade.Item>
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Experience
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>
      </Fade.Item>
      <div className="space-y-0">
        {experiences.map((exp, index) => (
          <Fade.Item key={index}>
            <div
              className={`group py-8 hover:bg-accent/50 transition-all -mx-2 px-2 ${index !== experiences.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className="flex gap-4">
                <div className="hidden lg:block shrink-0">
                  <div className="size-10 sm:size-12 rounded-lg border border-border bg-background overflow-hidden flex items-center justify-center">
                    <Image
                      src={exp.logo}
                      alt={exp.company}
                      width={48}
                      height={48}
                      className="size-full object-contain p-1.5"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-row items-start justify-between gap-1 sm:gap-4">
                    <div>
                      <h3 className="text-sm lg:text-base font-semibold text-foreground leading-tight">
                        {exp.title}
                      </h3>
                      <a
                        href={exp.companyUrl}
                        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {exp.company}
                        <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </div>
                    <span className="text-xs tabular-nums text-muted-foreground bg-muted/50 px-2 py-0.5 rounded w-fit">
                      {exp.period}
                    </span>
                  </div>
                </div>
              </div>
              {exp.description && (
                <p className="text-sm text-muted-foreground leading-relaxed mt-6">
                  {exp.description}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-6">
                {exp.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-secondary text-secondary-foreground"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </Fade.Item>
        ))}
      </div>
    </section>
  );
};
