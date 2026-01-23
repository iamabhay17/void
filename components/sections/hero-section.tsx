import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";

export const HeroSection = () => {
  return (
    <header className="mb-15">
      <div className="flex flex-col gap-2 mb-6 lg:mb-8">
        <div className="space-y-4 font-geist-sans">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl lg:text-3xl text-muted-foreground tracking-tight">
              Hello 👋
            </h1>
            <h1 className="text-2xl md:text-3xl lg:text-4xl mt-3 font-bold text-foreground tracking-tight">
              I&apos;m Abhay Bhardwaj
            </h1>
          </div>
        </div>
      </div>
      {/* Bio */}
      <p className="text-base text-muted-foreground leading-relaxed max-w-lg text-pretty mb-6 lg:mb-8">
        Software Engineer based in India, building user interfaces and enhancing
        experiences. Currently at HROne in Platform Team.
      </p>

      {/* Quick links */}
      <div className="flex flex-wrap gap-3">
        <Link
          href="https://github.com/iamabhay17"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-xs lg:text-sm font-medium hover:opacity-90 transition-opacity"
        >
          View Github
          <ArrowRight className="size-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <Link
          href="mailto:hello@abhaybhardwaj.in?subject=Let's%20Connect"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground text-xs lg:text-sm font-medium hover:bg-accent transition-colors"
        >
          Get in touch
        </Link>
      </div>
    </header>
  );
};
