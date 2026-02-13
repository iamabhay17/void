import { Activity } from "@/components/ui/contribution-graph";
import { unstable_cache } from "next/cache";

type GitHubContributionsResponse = {
  contributions: Activity[];
};

export const getGitHubContributions = unstable_cache(
  async () => {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/iamabhay17?y=last`,
    );
    const data = (await res.json()) as GitHubContributionsResponse;
    return data.contributions;
  },
  ["github-contributions"],
  { revalidate: 86400 }, // Cache for 1 day (86400 seconds)
);
