import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
import { IconType } from "react-icons/lib";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Navigation rows on the night layer. The active row takes the logo's 18° lean on its leading edge.
export const navRowVariants = cva(
    "lean flex h-[30px] w-full items-center gap-2.5 pl-3 pr-2.5 text-sm whitespace-nowrap overflow-hidden transition-colors duration-150 outline-none focus-visible:bg-n-hover focus-visible:text-n-ink focus-visible:shadow-[inset_0_0_0_2px_var(--spark)]",
    {
        variants: {
            variant: {
                default: "text-n-ink-2 hover:bg-n-hover hover:text-n-ink",
                active: "bg-cobalt text-white font-medium dark:text-[#06103a]",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    },
);

interface Props {
    label: string;
    id: string;
    icon: LucideIcon | IconType;
    variant?: VariantProps<typeof navRowVariants>["variant"];
    onNavigate?: () => void;
};

export const SidebarItem = ({
    label,
    id,
    icon: Icon,
    variant,
    onNavigate,
}: Props) => {
    const workspaceId = useWorkspaceId();

    return (
        <Link
            href={`/workspace/${workspaceId}/channel/${id}`}
            onClick={onNavigate}
            aria-current={variant === "active" ? "page" : undefined}
            className={cn(navRowVariants({ variant }))}
        >
            <Icon className="size-3.5 shrink-0 opacity-75" />
            <span className="truncate">{label}</span>
        </Link>
    )
}
