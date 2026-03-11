import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const alertVariants = cva(
  "relative grid w-full gap-1 rounded-xl border px-4 py-3 text-sm has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-3 [&>svg]:translate-y-0.5 [&>svg]:text-current [&>svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-muted/50 text-foreground",
        info: "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/50 dark:text-blue-100",
        success:
          "border-green-200 bg-green-50 text-green-900 dark:border-green-900/50 dark:bg-green-950/50 dark:text-green-100",
        warning:
          "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/50 dark:text-amber-100",
        destructive:
          "border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-semibold leading-tight tracking-tight [&_a]:underline [&_a]:underline-offset-4",
        className,
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm opacity-90 [&_a]:underline [&_a]:underline-offset-4 [&_p:not(:last-child)]:mb-2",
        className,
      )}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle, alertVariants };
