"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";

type Heading = {
  id: string;
  text: string;
  level: number;
};

export const TableOfContents = () => {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const collectHeadings = () => {
    const elements = Array.from(
      document.querySelectorAll("h1, h2, h3"),
    ) as HTMLElement[];

    const mapped: Heading[] = elements
      .filter((el) => el.id)
      .map((el) => ({
        id: el.id,
        text: el.innerText,
        level: Number(el.tagName.replace("H", "")),
      }));

    setHeadings(mapped);
  };

  useEffect(() => {
    collectHeadings();
  }, []);

  // 2️⃣ Observe which heading is active
  useEffect(() => {
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleHeadings = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              (a.target as HTMLElement).offsetTop -
              (b.target as HTMLElement).offsetTop,
          );

        if (visibleHeadings.length > 0) {
          setActiveId(visibleHeadings[0].target.id);
        }
      },
      {
        rootMargin: "-100px 0px -60% 0px",
        threshold: 0,
      },
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  // 3️⃣ Smooth scroll
  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const yOffset = -90; // adjust if you have sticky header
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
  };

  if (!headings.length) return null;
  return (
    <motion.nav
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="hidden xl:block fixed right-24 top-28 w-56"
    >
      <div className="rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm p-4">
        <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-4">
          On this page
        </h4>
        <div className="flex flex-col gap-0.5">
          {headings.map((heading) => (
            <button
              key={heading.id}
              onClick={() => scrollToHeading(heading.id)}
              className={cn(
                "text-left text-[13px] transition-all duration-200 rounded-md py-1.5 relative",
                "hover:text-foreground hover:bg-accent/50",
                activeId === heading.id
                  ? "font-medium text-foreground bg-accent/30"
                  : "text-muted-foreground",
                heading.level === 1 && "pl-3",
                heading.level === 2 && "pl-3",
                heading.level === 3 && "pl-6",
              )}
            >
              {activeId === heading.id && (
                <motion.span
                  layoutId="toc-active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-foreground rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="line-clamp-1">{heading.text}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.nav>
  );
};
