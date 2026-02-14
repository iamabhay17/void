import { Suspense } from "react";
import { getGitHubContributions } from "@/data/github";
import { LoaderIcon } from "lucide-react";
import { GitHubContributionGraph } from "../molecules/contributions";
import * as Fade from "@/components/motion/fade";

export function GithubSection() {
  const contributions = getGitHubContributions();

  return (
    <section className="mt-20">
      <Fade.Item>
        <div className="flex items-center gap-4 mb-10">
          <h2 className="text-xs lg:text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Contribution Graph
          </h2>
          <div className="flex-1 h-px bg-border" />
        </div>
      </Fade.Item>
      <Fade.Item>
        <div className="w-full overflow-x-auto">
          <Suspense fallback={<GitHubContributionFallback />}>
            <GitHubContributionGraph contributions={contributions} />
          </Suspense>
        </div>
      </Fade.Item>
    </section>
  );
}

export function GitHubContributionFallback() {
  return (
    <div className="flex h-40.5 w-full items-center justify-center">
      <LoaderIcon className="animate-spin text-muted-foreground" />
    </div>
  );
}
