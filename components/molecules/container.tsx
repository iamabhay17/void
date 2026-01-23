import { cn } from "@/lib/utils";

export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className="bg-background w-full">
      <div
        data-slot="container-wrapper"
        className={cn(
          "mx-auto w-full max-w-5xl min-w-0 gap-8 p-6 pt-4 sm:gap-12 sm:p-6 md:gap-8 lg:p-12 2xl:max-w-6xl",

          className,
        )}
        {...props}
      />
    </div>
  );
}
