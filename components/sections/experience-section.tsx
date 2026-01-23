import { ArrowUpRight } from "lucide-react";

import cosmoLogo from "@/assets/cosmo-logo.png";
import hroneLogo from "@/assets/hrone-logo.webp";
import { StaticImageData } from "next/image";

interface ExperienceItem {
  period: string;
  title: string;
  company: string;
  companyUrl?: string;
  skills: string[];
  description?: string;
  logo: StaticImageData;
}

const experiences: ExperienceItem[] = [
  {
    period: "Since June 2025",
    title: "Software Engineer (Platform)",
    company: "HROne",
    companyUrl: "https://www.hrone.cloud",
    skills: [
      "React",
      "TypeScript",
      "FastAPI",
      "AWS",
      "Python",
      "MongoDB",
      "Redis",
    ],
    description:
      "Working with the platform team to provide solutions for internal teams. Building reusable components and libraries to be used across various teams in the organization.",
    logo: hroneLogo,
  },
  {
    period: "2023 — 2025",
    title: "Founding Engineer",
    company: "Cosmocloud",
    companyUrl: "https://www.cosmocloud.io",
    skills: [
      "React",
      "TypeScript",
      "FastAPI",
      "AWS",
      "Python",
      "MongoDB",
      "Redis",
    ],
    description:
      "Involved in the development of core features for the product and worked on the development of the Storage accounts and CQL(cosmocloud query language) feature.",
    logo: cosmoLogo,
  },
  {
    period: "2019 — 2021",
    title: "Software Engineer Intern",
    company: "Cosmocloud",
    companyUrl: "https://www.cosmocloud.io",
    skills: ["React", "TypeScript", "FastAPI", "AWS", "Python"],

    description:
      "Worked on development of Environments and Secrets feature for the product to streamline API development and testing easier for end user.",
    logo: cosmoLogo,
  },
];

export const ExperienceSection = () => {
  return (
    <section>
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Experience
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="space-y-0">
        {experiences.map((exp, index) => (
          <div
            key={index}
            className="group relative grid grid-cols-1 md:grid-cols-[160px_1fr] gap-2 md:gap-12 py-8 first:pt-0 last:pb-0 border-b border-border last:border-0"
          >
            <div className="flex flex-col">
              <span className="text-xs lg:text-sm tabular-nums text-muted-foreground">
                {exp.period}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm lg:text-base font-semibold text-foreground leading-tight">
                  {exp.title}
                </h3>
                <a
                  href={exp.companyUrl}
                  className="inline-flex items-center gap-1 font-medium text-sm text-muted-foreground hover:text-foreground transition-colors mt-0.5"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {exp.company}
                  <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pt-1">
                {exp.description}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {exp.skills.map((skill) => (
                  <span
                    key={skill}
                    className="text-[11px] font-medium tracking-wide px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground border border-border/50"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
