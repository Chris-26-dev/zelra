import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-1.5 py-px text-[11px] font-semibold leading-4 whitespace-nowrap",
  {
    variants: {
      variant: {
        default: "bg-wash text-cobalt-ink",
        muted: "bg-hover text-ink-2",
        night: "bg-n-hover text-n-ink-3",
        spark: "bg-spark text-[#06103a]",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
