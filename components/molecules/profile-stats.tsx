"use client";

import { Activity } from "@/components/ui/contribution-graph";
import { useEffect, useState } from "react";

interface GitHubUser {
  followers: number;
  respositories: number;
  public_repos: number;
}

interface StatsData {
  followers: string;
  respositories: string;
  contributions: string;
}

export const ProfileStats = () => {
  const [stats, setStats] = useState<StatsData>({
    followers: "—",
    respositories: "—",
    contributions: "—",
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch GitHub user data
        const userRes = await fetch("https://api.github.com/users/iamabhay17");
        const userData: GitHubUser = await userRes.json();

        // Fetch contributions data
        const contribRes = await fetch(
          "https://github-contributions-api.jogruber.de/v4/iamabhay17?y=last",
        );
        const contribData = await contribRes.json();

        const totalContributions =
          contribData.contributions?.reduce(
            (sum: number, day: Activity) => sum + day.count,
            0,
          ) ?? 0;

        setStats({
          followers: userData.followers.toLocaleString(),
          respositories: userData.public_repos.toLocaleString(),
          contributions: totalContributions.toLocaleString(),
        });
      } catch (error) {
        console.error("Failed to fetch GitHub stats:", error);
      }
    };

    fetchStats();
  }, []);

  const STATS = [
    { label: "Followers", value: stats.followers },
    { label: "Repositories", value: stats.respositories },
    { label: "Contributions", value: stats.contributions },
  ];

  return (
    <div className="grid grid-cols-3 divide-x divide-border">
      {STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-0.5 py-4"
        >
          <span className="text-lg md:text-xl font-bold text-foreground sm:text-2xl">
            {stat.value}
          </span>
          <span className="text-xs font-medium text-muted-foreground sm:text-sm">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
};
