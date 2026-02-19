import {
  siFastapi,
  siFramer,
  siMongodb,
  siPython,
  siReact,
  siReactquery,
  siRedis,
  siShadcnui,
  siTailwindcss,
  siXyflow,
} from "simple-icons";

export const skills = [
  {
    name: "FastAPI",
    icon: siFastapi,
  },
  {
    name: "React",
    icon: siReact,
  },
  {
    name: "TypeScript",
    icon: siTailwindcss,
  },
  {
    name: "React Query",
    icon: siReactquery,
  },
  {
    name: "React Flow",
    icon: siXyflow,
  },
  {
    name: "Shadcn UI",
    icon: siShadcnui,
  },
  {
    name: "Python",
    icon: siPython,
  },
  {
    name: "MongoDB",
    icon: siMongodb,
  },
  {
    name: "Redis",
    icon: siRedis,
  },
  {
    name: "Framer Motion",
    icon: siFramer,
  },
];

export const SkillIcon = ({ name, icon }: { name: string; icon: any }) => {
  return (
    <svg
      viewBox="0 0 40 40"
      className="w-10 h-10 text-neutral-700 dark:text-neutral-100"
      fill="currentColor"
      dangerouslySetInnerHTML={{
        __html: icon.svg.replace(/fill="[^"]*"/g, 'fill="currentColor"'),
      }}
    />
  );
};
