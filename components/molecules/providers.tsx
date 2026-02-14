"use client";

import { LayoutGroup } from "motion/react";
import { ThemeProvider } from "./theme-provider";
import { ViewTransitions } from "next-view-transitions";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LayoutGroup>
      <ViewTransitions>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </ViewTransitions>
    </LayoutGroup>
  );
}
