import cosmoLogo from "@/assets/cosmo-logo.png";
import hroneLogo from "@/assets/hrone-logo.webp";
import { StaticImageData } from "next/image";

interface ExperienceItem {
  period: string;
  title: string;
  company: string;
  companyUrl?: string;
  skills: string[];
  description?: string;
  logo: StaticImageData;
}

export const experiences: ExperienceItem[] = [
  {
    period: "Since June 2025",
    title: "Software Engineer (Platform)",
    company: "HROne",
    companyUrl: "https://www.hrone.cloud",
    skills: [
      "React",
      "TypeScript",
      "FastAPI",
      "AWS",
      "Python",
      "MongoDB",
      "Redis",
    ],
    description:
      "Working with the platform team to provide solutions for internal teams. Building reusable components and libraries to be used across various teams in the organization.",
    logo: hroneLogo,
  },
  {
    period: "2023 — 2025",
    title: "Founding Engineer",
    company: "Cosmocloud",
    companyUrl: "https://www.cosmocloud.io",
    skills: [
      "React",
      "TypeScript",
      "FastAPI",
      "AWS",
      "Python",
      "MongoDB",
      "Redis",
    ],
    description:
      "Involved in the development of core features for the product and worked on the development of the Storage accounts and CQL(cosmocloud query language) feature.",
    logo: cosmoLogo,
  },
  {
    period: "2019 — 2021",
    title: "Software Engineer Intern",
    company: "Cosmocloud",
    companyUrl: "https://www.cosmocloud.io",
    skills: ["React", "TypeScript", "FastAPI", "AWS", "Python"],

    description:
      "Worked on development of Environments and Secrets feature for the product to streamline API development and testing easier for end user.",
    logo: cosmoLogo,
  },
];
