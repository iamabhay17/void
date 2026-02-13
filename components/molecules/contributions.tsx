"use client";

import { use } from "react";
import {
  Activity,
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from "../ui/contribution-graph";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { formatDate } from "@/lib/date";
import { cn } from "@/lib/utils";

export function GitHubContributionGraph({
  contributions,
}: {
  contributions: Promise<Activity[]>;
}) {
  const data = use(contributions);

  const isMobile = window.innerWidth < 640; // Example breakpoint for mobile

  return (
    <ContributionGraph
      className="py-2"
      data={data}
      blockSize={isMobile ? 12 : 16}
      blockMargin={isMobile ? 4 : 3}
      blockRadius={2}
    >
      <ContributionGraphCalendar
        className="no-scrollbar px-2"
        title="GitHub Contributions"
      >
        {({ activity, dayIndex, weekIndex }) => (
          <Tooltip>
            <TooltipTrigger render={<g />}>
              <ContributionGraphBlock
                activity={activity}
                dayIndex={dayIndex}
                weekIndex={weekIndex}
                className={cn(
                  'data-[level="0"]:fill-[#ebedf0] dark:data-[level="0"]:fill-[#161b22]',
                  'data-[level="1"]:fill-[#9be9a8] dark:data-[level="1"]:fill-[#0e4429]',
                  'data-[level="2"]:fill-[#40c463] dark:data-[level="2"]:fill-[#006d32]',
                  'data-[level="3"]:fill-[#30a14e] dark:data-[level="3"]:fill-[#26a641]',
                  'data-[level="4"]:fill-[#216e39] dark:data-[level="4"]:fill-[#39d353]',
                )}
              />
            </TooltipTrigger>

            <TooltipContent className="font-sans">
              <p>
                {activity.count} contribution{activity.count > 1 ? "s" : null}{" "}
                on {formatDate(new Date(activity.date))}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </ContributionGraphCalendar>

      <ContributionGraphFooter className="px-2">
        <ContributionGraphTotalCount>
          {({ totalCount, year }) => (
            <div
              className={cn(
                "text-muted-foreground",
                isMobile ? "text-xs" : "text-sm",
              )}
            >
              {totalCount.toLocaleString("en")} contributions in {year} on{" "}
              <a
                className="font-medium underline underline-offset-4"
                href={`https://github.com/iamabhay17`}
                target="_blank"
                rel="noopener"
              >
                GitHub
              </a>
              .
            </div>
          )}
        </ContributionGraphTotalCount>
      </ContributionGraphFooter>
    </ContributionGraph>
  );
}
