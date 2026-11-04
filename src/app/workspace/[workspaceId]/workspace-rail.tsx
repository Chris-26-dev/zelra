import Link from "next/link";
import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";

import { Hint } from "@/components/hint";
import { WorkspaceTile } from "@/components/workspace-tile";
import { UserButton } from "@/features/auth/components/user-button";
import { useGetWorkspaces } from "@/features/workspaces/api/use-get-workspaces";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";
import { useRailIndex } from "@/features/workspaces/store/use-shell-state";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { cn } from "@/lib/utils";

const SLOT = 52;

// Every workspace you belong to, one click away. The leaning stroke marks the active one.
export const WorkspaceRail = () => {
    const workspaceId = useWorkspaceId();
    const [, setCreateOpen] = useCreateWorkspaceModal();
    const { data: workspaces } = useGetWorkspaces();
    const [railIndex, setRailIndex] = useRailIndex();

    const activeIndex = workspaces?.findIndex((w) => w._id === workspaceId) ?? -1;
    // Start the indicator where it was before this workspace opened, then slide it into place.
    const [indicator, setIndicator] = useState(railIndex ?? activeIndex);

    useEffect(() => {
        if (activeIndex < 0) return;
        const frame = requestAnimationFrame(() => setIndicator(activeIndex));
        setRailIndex(activeIndex);
        return () => cancelAnimationFrame(frame);
    }, [activeIndex, setRailIndex]);

    return (
        <nav aria-label="Workspaces" className="relative flex h-full w-[68px] shrink-0 flex-col items-center py-3">
            {indicator >= 0 && (
                <span
                    aria-hidden="true"
                    className="stroke-mark absolute left-0.5 top-[25px] h-[26px] w-3 bg-n-ink transition-transform duration-[240ms] ease-[cubic-bezier(.3,.7,.2,1)]"
                    style={{ transform: `translateY(${indicator * SLOT}px)` }}
                />
            )}
            <ul className="flex flex-col items-center">
                {workspaces?.map((workspace) => {
                    const isActive = workspace._id === workspaceId;
                    return (
                        <li key={workspace._id} className="grid h-[52px] w-[68px] place-items-center">
                            <Hint label={workspace.name} side="right">
                                <Link
                                    href={`/workspace/${workspace._id}`}
                                    aria-label={workspace.name}
                                    aria-current={isActive ? "page" : undefined}
                                    className="group outline-offset-4"
                                >
                                    <WorkspaceTile
                                        name={workspace.name}
                                        className={cn(
                                            "transition-[filter,transform] duration-150 group-hover:-translate-y-px",
                                            !isActive && "saturate-[.55] brightness-90 group-hover:saturate-100 group-hover:brightness-110"
                                        )}
                                    />
                                </Link>
                            </Hint>
                        </li>
                    );
                })}
            </ul>
            <div className="grid h-[52px] place-items-center">
                <Hint label="Create a workspace" side="right">
                    <button
                        onClick={() => setCreateOpen(true)}
                        aria-label="Create a workspace"
                        className="cut grid size-10 place-items-center bg-n-hover text-n-ink-2 transition-colors [--cut:9px] hover:bg-white/12 hover:text-n-ink"
                    >
                        <PlusIcon className="size-[18px]" />
                    </button>
                </Hint>
            </div>
            <div className="mt-auto">
                <UserButton />
            </div>
        </nav>
    );
};
