import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-ink placeholder:text-ink-3 selection:bg-cobalt selection:text-on-cobalt border-line-2 bg-card text-ink flex h-10 w-full min-w-0 rounded-lg border px-3 py-1 text-base transition-[border-color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-cobalt focus-visible:ring-wash focus-visible:ring-[3px] focus-visible:outline-none",
        "aria-invalid:border-danger aria-invalid:ring-danger-wash",
        className
      )}
      {...props}
    />
  )
}

export { Input }
