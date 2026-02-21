"use client";

import { motion, useReducedMotion } from "motion/react";
import { Container } from "./container";
import {
  IconBookmark,
  IconBrandGithub,
  IconHome,
  IconPhoto,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ThemeToggler } from "../ui/theme-toggler";
import { Link } from "next-view-transitions";
import { usePathname, useRouter } from "next/navigation";
import { memo, useCallback, useMemo } from "react";

export const Navigation = () => {
  return (
    <Container className="py-6">
      <div className="flex justify-between items-center">
        <SiteHeading />
        <span className="hidden md:inline-block">
          <NavDock isMobile={false} />
        </span>
      </div>
    </Container>
  );
};

const SiteHeading = () => {
  return (
    <Link href="/">
      <h3 className="text-xs lg:text-sm text-muted-foreground">
        <span className="font-medium text-primary">Abhay Bhardwaj </span>
        <span className="">— Design Engineer</span>
      </h3>
    </Link>
  );
};

const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    icon: IconHome,
  },
  {
    href: "/blog",
    label: "Blogs",
    icon: IconBookmark,
  },
  {
    href: "/playground",
    label: "Playground",
    icon: IconPhoto,
  },
  {
    href: "https://www.github.com/iamabhay17",
    label: "Github",
    icon: IconBrandGithub,
  },
];

export const NavDock = memo(function NavDock({
  isMobile = false,
}: {
  isMobile?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();

  const handleActiveTab = useCallback(
    (to: string) => {
      router.push(to);
    },
    [router],
  );

  const springTransition = useMemo(
    () =>
      prefersReducedMotion
        ? { duration: 0 }
        : { type: "spring" as const, stiffness: 500, damping: 35 },
    [prefersReducedMotion],
  );

  if (isMobile) {
    return (
      <nav className="flex items-center gap-1 px-1.5 py-1.5 rounded-full border border-border/50 bg-background/95 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20 will-change-transform">
        {NAV_ITEMS.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <button
              key={tab.href}
              onClick={() => handleActiveTab(tab.href)}
              className="relative p-2.5 rounded-full active:scale-95 transition-transform"
              style={{ WebkitTapHighlightColor: "transparent" }}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 bg-foreground/10 rounded-full"
                  transition={springTransition}
                />
              )}
              <Icon
                className={cn(
                  "relative z-10 transition-colors duration-150",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
                stroke={isActive ? 2 : 1.5}
                size={18}
              />
            </button>
          );
        })}
        <span className="w-px h-4 bg-border mx-0.5" aria-hidden="true" />
        <ThemeToggler
          className="p-2.5 rounded-full text-muted-foreground hover:text-foreground active:scale-95 transition-all duration-150"
          iconSize={18}
        />
      </nav>
    );
  }

  return (
    <nav className="flex space-x-1">
      {NAV_ITEMS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <button
            key={tab.href}
            onClick={() => handleActiveTab(tab.href)}
            className="relative rounded-full text-xs font-medium transition-colors duration-150 focus-visible:outline-2 px-3 py-1.5"
            style={{ WebkitTapHighlightColor: "transparent" }}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive && (
              <motion.span
                layoutId="bubble-desktop"
                layout
                className="absolute inset-0 z-10 bg-primary mix-blend-difference"
                style={{ borderRadius: 9999 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", bounce: 0.2, duration: 0.3 }
                }
              />
            )}
            {tab.label}
          </button>
        );
      })}
      <ThemeToggler className="px-3 py-1.5" />
    </nav>
  );
});
