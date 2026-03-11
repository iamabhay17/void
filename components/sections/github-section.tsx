import { Suspense } from "react";
import { getGitHubContributions } from "@/data/github";
import { Github, LoaderIcon, ExternalLink } from "lucide-react";
import { GitHubContributionGraph } from "../molecules/contributions";
import * as Fade from "@/components/motion/fade";
import Link from "next/link";

const GITHUB_URL = "https://github.com/iamabhay17";

export function GithubSection() {
  const contributions = getGitHubContributions();
  return (
    <section>
      <Fade.Item>
        <div className="w-full overflow-hidden rounded-lg border border-border bg-card">
          {/* Header */}
          <div className="flex flex-col gap-6 px-4 sm:px-6 py-4 border-b border-border bg-muted/30 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-foreground/5 ring-1 ring-foreground/10">
                <Github className="size-4 text-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Contribution Activity
                </h3>
                <p className="text-xs text-muted-foreground">Last 12 months</p>
              </div>
            </div>
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex w-fit items-center gap-1.5 rounded-full bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <span>@iamabhay17</span>
              <ExternalLink className="size-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
          {/* Graph */}
          <div className="p-4 sm:p-6 overflow-x-auto">
            <Suspense fallback={<GitHubContributionFallback />}>
              <GitHubContributionGraph contributions={contributions} />
            </Suspense>
          </div>
        </div>
      </Fade.Item>
    </section>
  );
}

export function GitHubContributionFallback() {
  return (
    <div className="flex h-40 w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <LoaderIcon className="size-5 animate-spin text-muted-foreground" />
        <span className="text-xs text-muted-foreground">
          Loading contributions...
        </span>
      </div>
    </div>
  );
}
