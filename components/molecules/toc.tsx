"use client";

import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptic";
import { AnimatePresence, motion } from "framer-motion";
import { List, X } from "lucide-react";
import React, { useEffect, useState } from "react";

type Heading = {
  id: string;
  text: string;
  level: number;
};

const useTocHeadings = () => {
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

  const scrollToHeading = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;

    const yOffset = -90;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return { headings, activeId, scrollToHeading };
};

// Desktop TOC - Fixed sidebar
export const TableOfContents = () => {
  const { headings, activeId, scrollToHeading } = useTocHeadings();

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
                "text-left text-[13px] transition-colors duration-150 rounded-md py-1.5 relative",
                "hover:text-foreground hover:bg-accent/30",
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
                  transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
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

// Mobile TOC - Floating button with sheet
export const MobileTableOfContents = () => {
  const { headings, activeId, scrollToHeading } = useTocHeadings();
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (id: string) => {
    haptic();
    scrollToHeading(id);
    setIsOpen(false);
  };

  if (!headings.length) return null;

  return (
    <>
      {/* Floating TOC Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={() => {
          haptic();
          setIsOpen(true);
        }}
        className="xl:hidden fixed bottom-20 right-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full border border-border bg-background/95 backdrop-blur-sm shadow-sm"
      >
        <List className="size-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Contents
        </span>
      </motion.button>

      {/* Sheet Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="xl:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            />

            {/* Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
              className="xl:hidden fixed bottom-0 left-0 right-0 z-50 max-h-[70vh] rounded-t-2xl border-t border-border bg-background shadow-lg"
            >
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-3 border-b border-border">
                <h4 className="text-sm font-semibold text-foreground">
                  On this page
                </h4>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md hover:bg-accent transition-colors"
                >
                  <X className="size-4 text-muted-foreground" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(70vh-80px)] p-4">
                <div className="flex flex-col gap-1">
                  {headings.map((heading) => (
                    <button
                      key={heading.id}
                      onClick={() => handleNavigate(heading.id)}
                      className={cn(
                        "text-left text-sm transition-colors duration-150 rounded-lg py-2.5 px-3 relative",
                        "active:scale-[0.98]",
                        activeId === heading.id
                          ? "font-medium text-foreground bg-accent"
                          : "text-muted-foreground hover:bg-accent/30",
                        heading.level === 3 && "ml-4",
                      )}
                    >
                      {activeId === heading.id && (
                        <motion.span
                          layoutId="mobile-toc-indicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-foreground rounded-full"
                          transition={{
                            duration: 0.15,
                            ease: [0.25, 0.1, 0.25, 1],
                          }}
                        />
                      )}
                      <span className="line-clamp-2">{heading.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
