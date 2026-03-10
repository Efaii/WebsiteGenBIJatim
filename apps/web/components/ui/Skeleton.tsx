import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

/**
 * @component Skeleton
 * @description Provides a shimmer animation to represent loading state of UI elements.
 */
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-slate-200/60 dark:bg-slate-800/20",
        className,
      )}
      {...props}
    />
  );
}
