"use client";

import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  type LucideIcon,
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  type alertVariants,
} from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { VariantProps } from "class-variance-authority";

type CalloutType = "note" | "tip" | "info" | "warning" | "danger" | "success";

interface CalloutProps extends React.ComponentProps<typeof Alert> {
  type?: CalloutType;
  title?: string;
  icon?: React.ReactNode;
}

const calloutConfig: Record<
  CalloutType,
  {
    icon: LucideIcon;
    variant: VariantProps<typeof alertVariants>["variant"];
    defaultTitle: string;
  }
> = {
  note: { icon: Info, variant: "default", defaultTitle: "Note" },
  tip: { icon: Lightbulb, variant: "info", defaultTitle: "Tip" },
  info: { icon: Info, variant: "info", defaultTitle: "Info" },
  warning: { icon: AlertTriangle, variant: "warning", defaultTitle: "Warning" },
  danger: { icon: AlertCircle, variant: "destructive", defaultTitle: "Danger" },
  success: { icon: CheckCircle2, variant: "success", defaultTitle: "Success" },
};

export function Callout({
  type = "note",
  title,
  icon,
  className,
  children,
  ...props
}: CalloutProps) {
  const config = calloutConfig[type];
  const Icon = config.icon;
  const displayTitle = title ?? config.defaultTitle;

  return (
    <Alert
      variant={config.variant}
      className={cn("my-6", className)}
      {...props}
    >
      {icon ?? <Icon className="size-4" />}
      {displayTitle && <AlertTitle>{displayTitle}</AlertTitle>}
      <AlertDescription className="[&>p]:mt-0">{children}</AlertDescription>
    </Alert>
  );
}
