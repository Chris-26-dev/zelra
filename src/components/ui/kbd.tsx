import * as React from "react"

import { cn } from "@/lib/utils"

function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn("rounded-sm border border-current px-1 font-mono text-[10.5px] leading-4 font-medium opacity-70", className)}
      {...props}
    />
  )
}

export { Kbd }
