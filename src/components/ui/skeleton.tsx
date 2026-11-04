import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "rounded-sm bg-[linear-gradient(100deg,var(--hover)_30%,var(--line)_50%,var(--hover)_70%)] bg-[length:300%_100%] animate-shimmer",
        className
      )}
      {...props}
    />
  )
}

// Placeholder rows shown while a conversation's first page of messages loads.
function MessageSkeleton({ rows = 4 }: { rows?: number }) {
  const widths = ["62%", "80%", "45%", "70%", "55%"];
  return (
    <div className="flex flex-col gap-5 px-5 py-4" aria-label="Loading messages" role="status">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="cut size-9 shrink-0 rounded-none [--cut:8px]" />
          <div className="flex flex-1 flex-col gap-2 pt-1">
            <Skeleton className="h-2.5 w-28" />
            <Skeleton className="h-2.5" style={{ width: widths[i % widths.length] }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export { Skeleton, MessageSkeleton }
