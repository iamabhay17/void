"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

interface CommandBlockProps {
  npm: string;
  yarn?: string;
  pnpm?: string;
  bun?: string;
  className?: string;
}

const packageManagerIcons: Record<PackageManager, React.ReactNode> = {
  npm: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z" />
    </svg>
  ),
  yarn: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.375 0 0 5.375 0 12s5.375 12 12 12 12-5.375 12-12S18.625 0 12 0zm.768 4.105c.183 0 .363.053.525.157.125.083.287.185.755 1.154.31-.088.468-.042.551-.019.204.056.366.19.463.375.477.917.542 2.553.334 3.605-.241 1.232-.755 2.029-1.131 2.576.324.329.778.899 1.117 1.825.278.774.31 1.478.273 2.015a5.51 5.51 0 0 0 .602-.329c.593-.366 1.487-.917 2.553-.931.714-.009 1.269.445 1.353 1.103a1.23 1.23 0 0 1-.945 1.362c-.649.158-.95.278-1.821.843-1.232.799-2.539 1.242-3.012 1.39a1.686 1.686 0 0 1-.704.343c-.737.181-3.266.315-3.466.315h-.046c-.783 0-1.214-.241-1.45-.491-.658.329-1.51.19-2.122-.134a1.078 1.078 0 0 1-.58-1.153 1.243 1.243 0 0 1-.153-.195c-.162-.25-.528-.936-.454-1.946.056-.723.556-1.367.88-1.71a5.522 5.522 0 0 1 .408-2.256c.306-.727.885-1.348 1.32-1.737-.32-.537-.644-1.367-.329-2.21.227-.602.412-.936.82-1.08h-.005c.199-.074.389-.153.486-.259a3.418 3.418 0 0 1 2.298-1.103c.037-.093.079-.185.125-.283.31-.658.639-1.029 1.024-1.168a.94.94 0 0 1 .328-.06z" />
    </svg>
  ),
  pnpm: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M0 0v7.5h7.5V0zm8.25 0v7.5h7.498V0zm8.25 0v7.5H24V0zM8.25 8.25v7.5h7.498v-7.5zm8.25 0v7.5H24v-7.5zM0 16.5V24h7.5v-7.5zm8.25 0V24h7.498v-7.5zm8.25 0V24H24v-7.5z" />
    </svg>
  ),
  bun: (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22.596c6.628 0 12-4.338 12-9.688 0-3.318-2.057-6.248-5.219-7.986-.424 2.239-1.377 3.237-2.859 4.063-.273.15-.554.292-.846.428l-.005.003c-1.49.692-3.292 1.212-3.292 2.895 0 .947.607 1.81 1.548 2.126-1.108-.285-1.972-1.018-2.37-1.988-.47 1.232.097 2.353.728 3.072-.95-.78-1.63-1.755-1.63-3.008 0-.407.078-.782.227-1.145-.683.649-1.103 1.59-1.103 2.654 0 2.02 1.55 3.66 3.45 3.66 1.9 0 3.45-1.64 3.45-3.66 0-.95-.357-1.82-.937-2.454.34.138.589.37.589.74 0 .49-.472.846-1.187.923.715-.077 1.385-.42 1.385-1.114 0-.74-.67-1.143-1.595-1.143-.925 0-1.595.404-1.595 1.143 0 .694.67 1.037 1.385 1.114-.715-.077-1.188-.433-1.188-.923 0-.37.25-.602.589-.74z" />
    </svg>
  ),
};

export function CommandBlock({
  npm,
  yarn,
  pnpm,
  bun,
  className,
}: CommandBlockProps) {
  const [activeTab, setActiveTab] = useState<PackageManager>("pnpm");
  const [copied, setCopied] = useState(false);

  const commands: Record<PackageManager, string> = {
    npm: npm,
    yarn:
      yarn ??
      npm.replace(/^npm (install|i)/, "yarn add").replace(/^npm run/, "yarn"),
    pnpm:
      pnpm ??
      npm.replace(/^npm (install|i)/, "pnpm add").replace(/^npm run/, "pnpm"),
    bun:
      bun ??
      npm.replace(/^npm (install|i)/, "bun add").replace(/^npm run/, "bun"),
  };

  const currentCommand = commands[activeTab];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentCommand);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Failed to copy");
    }
  };

  return (
    <div
      className={cn(
        "group relative my-6 overflow-hidden rounded-xl border border-border bg-muted/30",
        className,
      )}
    >
      {/* Tab Header */}
      <div className="flex items-center gap-1 border-b border-border bg-muted/50 px-4">
        <span className="flex size-8 items-center justify-center text-muted-foreground">
          {packageManagerIcons[activeTab]}
        </span>
        <div className="flex">
          {(Object.keys(commands) as PackageManager[]).map((pm) => (
            <button
              key={pm}
              onClick={() => setActiveTab(pm)}
              className={cn(
                "relative px-3 py-2.5 font-mono text-xs transition-colors",
                activeTab === pm
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {pm}
              {activeTab === pm && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Command Content */}
      <div className="relative">
        <pre className="overflow-x-auto p-4">
          <code className="font-mono text-sm text-muted-foreground">
            <span className="select-none text-muted-foreground/60">$ </span>
            {currentCommand}
          </code>
        </pre>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={cn(
            "absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-md border border-border bg-background/80 text-muted-foreground backdrop-blur-sm transition-all",
            "opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground",
            copied && "text-green-500",
          )}
          aria-label={copied ? "Copied!" : "Copy command"}
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </button>
      </div>
    </div>
  );
}
