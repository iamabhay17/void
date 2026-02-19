"use client";

import { SkillIcon, skills } from "@/data/skills";
import { motion } from "framer-motion";
import { useState } from "react";
import * as Fade from "@/components/motion/fade";

export function SkillsSection() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="mt-20">
      <Fade.Item>
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Skills
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>
      </Fade.Item>
      <Fade.Item>
        <div
          className="relative overflow-hidden"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Left blur gradient */}
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
          {/* Right blur gradient */}
          <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />

          <motion.div
            className="flex gap-20"
            animate={{
              x: ["0%", "-50%"],
            }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
            style={{
              animationPlayState: isPaused ? "paused" : "running",
            }}
            onHoverStart={() => setIsPaused(true)}
            onHoverEnd={() => setIsPaused(false)}
          >
            {[...skills, ...skills].map((skill, index) => (
              <div
                key={`${skill.name}-${index}`}
                className="flex flex-col items-center gap-2 shrink-0"
              >
                <SkillIcon name={skill.name} icon={skill.icon} />
                <span className="text-xs text-muted-foreground">
                  {skill.name}
                </span>
              </div>
            ))}
          </motion.div>
        </div>
      </Fade.Item>
    </section>
  );
}
