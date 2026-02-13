import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const HeroSection = () => {
  return (
    <header className="mb-20 mt-8">
      <div className="mb-8">
        <p className="text-base font-medium text-muted-foreground mb-2">
          Hello 👋
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight text-pretty">
          I&apos;m Abhay Bhardwaj
        </h1>
      </div>

      <p className="text-sm lg:text-base text-muted-foreground leading-relaxed max-w-xl mb-8">
        Software Engineer based in India, building user interfaces &amp;
        enhancing experiences. Currently at HROne in Platform Team.
      </p>

      <div className="flex flex-wrap gap-3">
        <Link
          href="https://github.com/iamabhay17"
          className="group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-xs lg:text-sm font-medium transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          View GitHub
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
        <Link
          href="mailto:hello@abhaybhardwaj.in?subject=Let's%20Connect"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-foreground text-xs lg:text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          Get in Touch
        </Link>
      </div>
    </header>
  );
};
