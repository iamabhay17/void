"use client";

import { use, useState, useEffect } from "react";
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

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <ContributionGraph
      data={data}
      blockSize={isMobile ? 11 : 13}
      blockMargin={isMobile ? 3 : 4}
      blockRadius={3}
    >
      <ContributionGraphCalendar
        className="no-scrollbar"
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
                  "transition-all duration-150 hover:ring-2 hover:ring-foreground/20 hover:ring-offset-1",
                  'data-[level="0"]:fill-[#ebedf0] dark:data-[level="0"]:fill-[#161b22]',
                  'data-[level="1"]:fill-[#9be9a8] dark:data-[level="1"]:fill-[#0e4429]',
                  'data-[level="2"]:fill-[#40c463] dark:data-[level="2"]:fill-[#006d32]',
                  'data-[level="3"]:fill-[#30a14e] dark:data-[level="3"]:fill-[#26a641]',
                  'data-[level="4"]:fill-[#216e39] dark:data-[level="4"]:fill-[#39d353]',
                )}
              />
            </TooltipTrigger>

            <TooltipContent className="font-sans">
              <p className="font-medium">
                {activity.count === 0 ? (
                  <span className="text-muted-foreground">
                    No contributions
                  </span>
                ) : (
                  <>
                    <span className="text-emerald-500">{activity.count}</span>{" "}
                    contribution{activity.count > 1 ? "s" : ""}
                  </>
                )}{" "}
                on {formatDate(new Date(activity.date))}
              </p>
            </TooltipContent>
          </Tooltip>
        )}
      </ContributionGraphCalendar>

      <ContributionGraphFooter className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <ContributionGraphTotalCount>
          {({ totalCount, year }) => (
            <div className="flex items-center gap-2 text-xs text-muted-foreground sm:text-sm">
              <span className="font-semibold text-foreground">
                {totalCount.toLocaleString("en")}
              </span>
              <span>contributions in {year}</span>
            </div>
          )}
        </ContributionGraphTotalCount>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  "size-3 rounded-sm",
                  level === 0 && "bg-[#ebedf0] dark:bg-[#161b22]",
                  level === 1 && "bg-[#9be9a8] dark:bg-[#0e4429]",
                  level === 2 && "bg-[#40c463] dark:bg-[#006d32]",
                  level === 3 && "bg-[#30a14e] dark:bg-[#26a641]",
                  level === 4 && "bg-[#216e39] dark:bg-[#39d353]",
                )}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </ContributionGraphFooter>
    </ContributionGraph>
  );
}
