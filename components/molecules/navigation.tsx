"use client";

import { motion } from "motion/react";
import { Container } from "./container";
import {
  IconBookmark,
  IconBrandGithub,
  IconHome,
  IconPhoto,
  IconUserCircle,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { ThemeToggler } from "../ui/theme-toggler";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export const Navigation = () => {
  return (
    <Container>
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
    href: "/about",
    label: "About",
    icon: IconUserCircle,
  },
  {
    href: "/blog",
    label: "Reads",
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

  const setActiveTab = (to: string) => {
    router.push(to);
  };
  return (
    <div
      className={cn(
        "flex space-x-1",
        isMobile && "space-x-2 border rounded-full p-1 bg-card",
      )}
    >
      {NAV_ITEMS.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <button
            key={tab.href}
            onClick={() => setActiveTab(tab.href)}
            className={cn(
              `relative rounded-full text-xs font-medium transition focus-visible:outline-2`,
              isMobile ? "px-2.5 py-2" : "px-3 py-1.5",
            )}
            style={{
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {isActive && (
              <motion.span
                layoutId={isMobile ? "bubble-mobile" : "bubble-desktop"}
                layout
                className={cn(
                  "absolute inset-0 z-10",
                  isMobile ? "bg-primary" : "bg-primary mix-blend-difference",
                )}
                style={{ borderRadius: 9999 }}
                transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
              />
            )}
            {isMobile ? (
              <tab.icon
                className={cn(
                  "relative z-20 text-primary",
                  isActive && "text-primary-foreground",
                )}
                stroke={1.5}
                size={20}
              />
            ) : (
              tab.label
            )}
          </button>
        );
      })}
      <ThemeToggler className={cn(isMobile ? "px-2.5 py-2" : "px-3 py-1.5")} />
    </div>
  );
}
