"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "!bg-ink !text-paper !border-0 !rounded-none cut [--cut:8px] !shadow-pop !font-sans !text-[13px] !font-medium !gap-2.5 !pl-4 before:content-[''] before:h-4 before:w-2 before:shrink-0 before:bg-spark before:[clip-path:polygon(5px_0,8px_0,3px_100%,0_100%)]",
          error: "before:!bg-danger",
          icon: "!hidden",
          description: "!text-paper/80",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
