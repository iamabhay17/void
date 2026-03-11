import { cn } from "@/lib/utils";

interface StepsProps extends React.ComponentProps<"div"> {}

export function Steps({ className, children, ...props }: StepsProps) {
  return (
    <div
      className={cn(
        "md:ml-4 md:border-l md:border-border md:pl-8",
        "[counter-reset:step]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface StepProps extends React.ComponentProps<"h3"> {}

export function Step({ className, children, ...props }: StepProps) {
  return (
    <h3
      className={cn(
        "step relative mt-8 scroll-m-20 text-base font-semibold tracking-tight first:mt-0",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}
