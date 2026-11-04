import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { BellIcon, HomeIcon, PlusIcon, UsersIcon } from "lucide-react";

import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { WorkspaceTile } from "@/components/workspace-tile";
import { UserButton } from "@/features/auth/components/user-button";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";
import { useMobileNav } from "@/features/workspaces/store/use-shell-state";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";
import { WorkspaceSidebar } from "./workspace-sidebar";

// Phone home: workspaces, channels and people on the night layer, with a bottom tab bar.
export const MobileNav = () => {
    const [open, setOpen] = useMobileNav();
    const pathname = usePathname();
    const workspaceId = useWorkspaceId();
    const { data: workspaces } = useGetWorkspaces();
    const [, setCreateOpen] = useCreateWorkspaceModal();

    // Close after any navigation.
    useEffect(() => {
        setOpen(false);
    }, [pathname, setOpen]);

    const close = () => setOpen(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent
                side="left"
                className="w-full max-w-none gap-0 border-0 bg-night p-0 text-n-ink hatch sm:max-w-none [&>button]:text-n-ink-3 [&>button:hover]:bg-n-hover [&>button:hover]:text-n-ink"
            >
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <SheetDescription className="sr-only">Workspaces, channels and direct messages</SheetDescription>
                <nav aria-label="Workspaces" className="flex shrink-0 gap-3 overflow-x-auto px-4 pb-1.5 pt-4 pr-14 [scrollbar-width:none]">
                    {workspaces?.map((w) => {
                        const active = w._id === workspaceId;
                        return (
                            <Link
                                key={w._id}
                                href={`/workspace/${w._id}`}
                                onClick={close}
                                aria-label={w.name}
                                aria-current={active ? "page" : undefined}
                                className={cn(
                                    "relative shrink-0 pb-2.5 after:absolute after:inset-x-2.5 after:bottom-0 after:h-1 after:lean-both after:[--lean:4px]",
                                    active && "after:bg-n-ink"
                                )}
                            >
                                <WorkspaceTile name={w.name} size="xl" className={cn("size-11 [--cut:10px]", !active && "saturate-[.55] brightness-90")} />
                            </Link>
                        );
                    })}
                    <button
                        onClick={() => setCreateOpen(true)}
                        aria-label="Create a workspace"
                        className="cut mb-2.5 grid size-11 shrink-0 place-items-center bg-n-hover text-n-ink-2 [--cut:10px]"
                    >
                        <PlusIcon className="size-5" />
                    </button>
                </nav>
                <div className="min-h-0 flex-1">
                    <WorkspaceSidebar onNavigate={close} />
                </div>
                <MobileTabBar active="home" onHome={close} />
            </SheetContent>
        </Sheet>
    );
};

interface TabBarProps {
    active: "home" | "people";
    onHome: () => void;
}

export const MobileTabBar = ({ active, onHome }: TabBarProps) => {
    const workspaceId = useWorkspaceId();
    const tab = "relative flex flex-col items-center gap-1 pb-1 pt-2.5 text-[11px] font-medium";
    const marker = "before:absolute before:inset-x-[30%] before:top-0 before:h-[3px] before:bg-spark before:lean-both before:[--lean:3px]";

    return (
        <nav aria-label="Main" className="grid shrink-0 grid-cols-4 border-t border-n-line bg-night pb-[max(6px,env(safe-area-inset-bottom))]">
            <button onClick={onHome} aria-current={active === "home" ? "page" : undefined} className={cn(tab, active === "home" ? cn("text-n-ink", marker) : "text-n-ink-3")}>
                <HomeIcon className="size-5" />
                Home
            </button>
            <Link href={`/workspace/${workspaceId}/people`} aria-current={active === "people" ? "page" : undefined} className={cn(tab, active === "people" ? cn("text-n-ink", marker) : "text-n-ink-3")}>
                <UsersIcon className="size-5" />
                People
            </Link>
            <span aria-disabled="true" title="Replies and reactions to your messages. Coming soon." className={cn(tab, "text-n-ink-3/70")}>
                <BellIcon className="size-5" />
                Activity
                <span className="absolute left-[56%] top-1 rounded-sm bg-n-hover px-1 text-[9px] font-bold text-n-ink-3">SOON</span>
            </span>
            <div className={cn(tab, "text-n-ink-3")}>
                <UserButton side="top" />
                <span className="sr-only">You</span>
            </div>
        </nav>
    );
};
