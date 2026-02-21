"use client";

import { motion } from "motion/react";
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
import { useState } from "react";

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

export function NavDock({ isMobile = false }: { isMobile?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState(pathname || "/home");

  const handleActiveTab = (to: string) => {
    router.push(to);
    setActiveTab(to);
  };

  if (isMobile) {
    return (
      <div className="flex items-center gap-1 px-1.5 py-1.5 rounded-full border border-border/50 bg-background/90 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20">
        {NAV_ITEMS.map((tab) => {
          const isActive = activeTab === tab.href;
          return (
            <button
              key={tab.href}
              onClick={() => handleActiveTab(tab.href)}
              className="relative p-2.5 rounded-full transition-colors"
              style={{ WebkitTapHighlightColor: "transparent" }}
            >
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-pill"
                  className="absolute inset-0 bg-foreground/10 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
              <tab.icon
                className={cn(
                  "relative z-10 transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )}
                stroke={isActive ? 2 : 1.5}
                size={18}
              />
            </button>
          );
        })}
        <span className="w-px h-4 bg-border mx-0.5" />
        <ThemeToggler className="p-2.5 rounded-full text-muted-foreground hover:text-foreground transition-colors" />
      </div>
    );
  }

  return (
    <div className="flex space-x-1">
      {NAV_ITEMS.map((tab) => {
        const isActive = activeTab === tab.href;
        return (
          <button
            key={tab.href}
            onClick={() => handleActiveTab(tab.href)}
            className="relative rounded-full text-xs font-medium transition focus-visible:outline-2 px-3 py-1.5"
            style={{ WebkitTapHighlightColor: "transparent" }}
          >
            {isActive && (
              <motion.span
                layoutId="bubble-desktop"
                layout
                className="absolute inset-0 z-10 bg-primary mix-blend-difference"
                style={{ borderRadius: 9999 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.3 }}
              />
            )}
            {tab.label}
          </button>
        );
      })}
      <ThemeToggler className="px-3 py-1.5" />
    </div>
  );
}
