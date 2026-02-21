"use client";

import { SkillIcon, skills } from "@/data/skills";
import * as Fade from "@/components/motion/fade";

export function SkillsSection() {
  return (
    <section>
      <Fade.Item>
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Skills
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>
      </Fade.Item>
      <Fade.Item>
        <div className="group relative overflow-hidden">
          {/* Left blur gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
          {/* Right blur gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

          <div className="flex w-max animate-scroll group-hover:[animation-play-state:paused]">
            {[...skills, ...skills].map((skill, index) => (
              <div
                key={`${skill.name}-${index}`}
                className="flex flex-col items-center gap-2 shrink-0 mx-5 md:mx-10"
              >
                <SkillIcon name={skill.name} icon={skill.icon} />
                <span className="text-xs text-muted-foreground">
                  {skill.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Fade.Item>
    </section>
  );
}
