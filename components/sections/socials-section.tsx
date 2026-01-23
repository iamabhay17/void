import React from "react";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";
import Link from "next/link";

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  handle: string;
}

const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    url: "https://github.com/iamabhay17",
    icon: <Github className="size-4.5" />,
    handle: "@iamabhay17",
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/iamabhay17",
    icon: <Linkedin className="size-4.5" />,
    handle: "in/iamabhay17",
  },
  {
    name: "Twitter",
    url: "https://twitter.com/iamabhay2001",
    icon: <Twitter className="size-4.5" />,
    handle: "@iamabhay2001",
  },
  {
    name: "Email",
    url: "mailto:hello@abhaybhardwaj.in",
    icon: <Mail className="size-4.5" />,
    handle: "hello@abhaybhardwaj.in",
  },
];

export function SocialsSection() {
  return (
    <section className="mt-20">
      <div className="flex items-center gap-4 mb-10">
        <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Connect
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {socialLinks.map((social) => (
          <Link
            key={social.name}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-6 py-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-accent transition-all"
            aria-label={social.name}
          >
            <span className="text-muted-foreground group-hover:text-foreground transition-colors">
              {social.icon}
            </span>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-foreground truncate">
                {social.name}
              </span>
              <span className="text-[11px] text-muted-foreground truncate hidden sm:block">
                {social.handle}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
