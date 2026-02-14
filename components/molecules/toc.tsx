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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("hidden xl:block fixed right-24 top-30 w-56", "space-y-4")}
    >
      <div className="flex flex-col text-sm">
        {headings.map((heading) => (
          <button
            key={heading.id}
            onClick={() => scrollToHeading(heading.id)}
            className={cn(
              "text-left transition-colors duration-200",
              "border-l-2 py-1",
              "hover:text-foreground",
              {
                "font-medium text-foreground border-foreground":
                  activeId === heading.id,
                "text-muted-foreground border-transparent":
                  activeId !== heading.id,
                "pl-3": heading.level === 1,
                "pl-6": heading.level === 2,
                "pl-9": heading.level === 3,
              },
            )}
          >
            {heading.text}
          </button>
        ))}
      </div>
    </motion.nav>
  );
};
