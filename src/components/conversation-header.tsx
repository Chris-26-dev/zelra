"use client";

import { ArrowLeftIcon } from "lucide-react";

import { useMobileNav } from "@/features/workspaces/store/use-shell-state";
import { cn } from "@/lib/utils";

interface Props {
    children: React.ReactNode;
    actions?: React.ReactNode;
    // Small line above the title on phones (usually the workspace name).
    context?: string;
    className?: string;
}

// The 58px bar at the top of every conversation and workspace page.
// On phones it leads with a button back to the navigation home.
export const ConversationHeader = ({ children, actions, context, className }: Props) => {
    const [, setNavOpen] = useMobileNav();

    return (
        <header className={cn("flex h-14 shrink-0 items-center gap-2 border-b border-line pl-2 pr-2.5 md:h-[58px] md:gap-3 md:pl-5 md:pr-3.5", className)}>
            <button
                onClick={() => setNavOpen(true)}
                aria-label="Open navigation"
                className="grid size-10 shrink-0 place-items-center rounded-lg text-ink-2 transition-colors hover:bg-hover hover:text-ink md:hidden"
            >
                <ArrowLeftIcon className="size-5" />
            </button>
            <div className="flex min-w-0 flex-1 flex-col justify-center md:flex-row md:items-center md:justify-start md:gap-3">
                {context && <span className="truncate text-[11.5px] leading-tight text-ink-3 md:hidden">{context}</span>}
                {children}
            </div>
            {actions && <div className="flex shrink-0 items-center gap-1">{actions}</div>}
        </header>
    );
};
