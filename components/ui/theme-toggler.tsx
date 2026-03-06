"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptic";
import { IconMoon, IconSun } from "@tabler/icons-react";

interface ThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  iconSize?: number;
}

export const ThemeToggler = ({
  className,
  iconSize = 18,
  ...props
}: ThemeTogglerProps) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    haptic();
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme ? "dark" : "light");
  };

  return (
    <button onClick={toggleTheme} className={cn(className)} {...props}>
      {isDark ? (
        <IconSun size={iconSize} stroke={1.5} />
      ) : (
        <IconMoon size={iconSize} stroke={1.5} />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
