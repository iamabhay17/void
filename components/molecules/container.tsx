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
          "mx-auto w-full max-w-5xl min-w-0 px-6 lg:px-12 2xl:max-w-6xl",
          className,
        )}
        {...props}
      />
    </div>
  );
}
