import { Suspense } from "react";
import { getGitHubContributions } from "@/data/github";
import { LoaderIcon } from "lucide-react";
import { GitHubContributionGraph } from "../molecules/contributions";
import * as Fade from "@/components/motion/fade";
import Link from "next/link";

const GITHUB_URL = "https://github.com/iamabhay17";

export function GithubSection() {
  const contributions = getGitHubContributions();
  return (
    <section>
      <Fade.Item>
        <div className="w-full overflow-hidden rounded-md border border-border bg-card">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground">
              Contribution Graph
            </h3>
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              @iamabhay17
            </Link>
          </div>
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
      <LoaderIcon className="animate-spin text-muted-foreground" />
    </div>
  );
}
