import Link from "next/link";
import { ArrowRight } from "lucide-react";
import * as Fade from "@/components/motion/fade";

export const HeroSection = () => {
  return (
    <header className="mb-20 mt-8">
      <div className="mb-6">
        <Fade.Item>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground text-pretty mb-4">
            Hello, I&apos;m Abhay Bhardwaj
          </h1>
        </Fade.Item>
      </div>
      <Fade.Item>
        <p className="text-sm lg:text-base text-muted-foreground leading-relaxed max-w-xl mb-8">
          Software Engineer based in India, building user interfaces &amp;
          enhancing experiences. Currently at HROne in Platform Team.
        </p>
      </Fade.Item>
      <Fade.Item>
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
      </Fade.Item>
    </header>
  );
};
