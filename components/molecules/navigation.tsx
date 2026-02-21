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

export const Navigation = memo(function Navigation() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <Container className="py-6">
        <div className="flex justify-between items-center">
          <SiteHeading />
          <nav className="hidden md:block">
            <NavDock isMobile={false} />
          </nav>
        </div>
      </Container>
    </motion.header>
  );
});

const SiteHeading = memo(function SiteHeading() {
  return (
    <Link href="/" className="group">
      <h3 className="text-xs lg:text-sm text-muted-foreground transition-colors duration-200">
        <span className="font-medium text-primary group-hover:text-primary/80 transition-colors duration-200">
          Abhay Bhardwaj{" "}
        </span>
        <span className="group-hover:text-foreground transition-colors duration-200">
          — Design Engineer
        </span>
      </h3>
    </Link>
  );
});

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
    <nav className="flex items-center gap-0.5 p-1 rounded-full border border-border/30 bg-card/50 backdrop-blur-sm">
      {NAV_ITEMS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <button
            key={tab.href}
            onClick={() => handleActiveTab(tab.href)}
            className={cn(
              "relative rounded-full text-xs font-medium px-3 py-1.5 transition-colors duration-200",
              "focus-visible:outline-2 focus-visible:outline-primary",
              isActive ? "text-primary-foreground" : "text-muted-foreground",
            )}
            style={{ WebkitTapHighlightColor: "transparent" }}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive && (
              <motion.span
                layoutId="desktop-nav-pill"
                className="absolute inset-0 bg-primary rounded-full"
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 400, damping: 30 }
                }
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        );
      })}
      <span className="w-px h-4 bg-border/50 mx-1" aria-hidden="true" />
      <ThemeToggler
        className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
        iconSize={16}
      />
    </nav>
  );
});
