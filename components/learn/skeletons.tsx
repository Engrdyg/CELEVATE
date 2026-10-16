import { Skeleton } from "@/components/ui/skeleton";

export function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-page px-4 py-8 sm:px-6 lg:px-8" role="status" aria-label="Loading">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="mt-4 h-44 rounded-2xl" />
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_18rem]">
        <Skeleton className="h-96 rounded-xl" />
        <Skeleton className="h-60 rounded-xl" />
      </div>
    </div>
  );
}

export function ReaderSkeleton() {
  return (
    <div role="status" aria-label="Loading lesson">
      <div className="h-12 border-b border-line" />
      <div className="mx-auto max-w-prose px-4 py-10">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="mt-4 h-9 w-3/4" />
        <Skeleton className="mt-4 h-4 w-full" />
        <Skeleton className="mt-2 h-4 w-5/6" />
        <div className="mt-10 space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-4" style={{ width: `${95 - (i % 3) * 12}%` }} />
          ))}
        </div>
        <Skeleton className="mt-8 h-28 rounded-xl" />
      </div>
    </div>
  );
}
