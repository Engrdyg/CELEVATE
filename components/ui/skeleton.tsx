import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden className={cn("skeleton rounded-md", className)} {...props} />;
}

export function CardSkeleton({ className, lines = 3 }: { className?: string; lines?: number }) {
  return (
    <div className={cn("surface-card rounded-xl p-5", className)} role="status" aria-label="Loading">
      <Skeleton className="h-4 w-1/3" />
      <div className="mt-4 space-y-2.5">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className="h-3" style={{ width: `${90 - i * 14}%` }} />
        ))}
      </div>
    </div>
  );
}
