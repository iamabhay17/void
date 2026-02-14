import React from "react";
import { Github, Linkedin, Twitter, Mail } from "lucide-react";

interface SocialLink {
  name: string;
  url: string;
  icon: React.ReactNode;
  handle: string;
}

export const socialLinks: SocialLink[] = [
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
