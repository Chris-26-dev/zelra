import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,border-color,color,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-spark aria-invalid:border-danger",
  {
    variants: {
      variant: {
        default:
          "bg-cobalt text-on-cobalt hover:bg-cobalt-ink dark:hover:bg-[#7b9bff]",
        destructive:
          "bg-danger text-white hover:bg-danger/90 dark:text-[#2a0710]",
        "destructive-outline":
          "border border-danger text-danger bg-transparent hover:bg-danger-wash",
        outline:
          "border border-line-2 bg-card text-ink hover:bg-hover",
        secondary:
          "bg-hover text-ink hover:bg-line",
        ghost:
          "text-ink-2 hover:bg-hover hover:text-ink",
        link: "text-cobalt-ink underline-offset-4 hover:underline",
        // Controls that sit on the night navigation layer.
        night: "text-n-ink-2 hover:bg-n-hover hover:text-n-ink",
      },
      size: {
        default: "h-9 px-4 has-[>svg]:px-3",
        xs: "h-7 rounded-md gap-1.5 px-2.5 text-xs",
        sm: "h-8 gap-1.5 px-3 text-[13px] has-[>svg]:px-2.5",
        lg: "h-10 px-5 has-[>svg]:px-4",
        icon: "size-9",
        iconSm: "size-8",
        iconXs: "size-6 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
