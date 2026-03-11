"use client";

import { Activity } from "@/components/ui/contribution-graph";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

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
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const STATS = [
    { label: "Followers", value: stats.followers, color: "text-primary" },
    { label: "Repos", value: stats.respositories, color: "text-emerald-500" },
    {
      label: "Contributions",
      value: stats.contributions,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="grid grid-cols-3">
      {STATS.map((stat, index) => (
        <div
          key={stat.label}
          className={cn(
            "group relative flex flex-col items-center gap-1 py-5 transition-colors hover:bg-muted/30",
            index !== STATS.length - 1 && "border-r border-border",
          )}
        >
          <span
            className={cn(
              "text-xl font-bold sm:text-2xl md:text-3xl tabular-nums transition-transform group-hover:scale-105",
              isLoading ? "animate-pulse text-muted-foreground" : stat.color,
            )}
          >
            {stat.value}
          </span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
};
