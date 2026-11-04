import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Doc } from "../../../../convex/_generated/dataModel";
import { ChevronDown, HashIcon, PlusIcon, SlidersHorizontalIcon, UserPlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { WorkspaceTile } from "@/components/workspace-tile";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useCreateWorkspaceModal } from "@/features/workspaces/store/use-create-workspace-modal";

interface Props {
    workspace: Doc<"workspaces">;
    isAdmin: boolean;
    memberCount?: number;
    onNavigate?: () => void;
}

// The workspace menu. Invite and Preferences now live in Workspace settings.
export const WorkspaceHeader = ({ workspace, isAdmin, memberCount, onNavigate }: Props) => {
    const router = useRouter();
    const [, setChannelOpen] = useCreateChannelModal();
    const [, setWorkspaceOpen] = useCreateWorkspaceModal();

    const go = (tab: string) => {
        onNavigate?.();
        router.push(`/workspace/${workspace._id}/settings?tab=${tab}`);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex min-w-0 items-center gap-1.5 rounded-lg px-2 py-1.5 text-left font-display text-[17px] font-semibold text-n-ink transition-colors hover:bg-n-hover data-[state=open]:bg-n-hover">
                <span className="truncate">{workspace.name}</span>
                <ChevronDown className="size-4 shrink-0 text-n-ink-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="start" className="w-64">
                <div className="flex items-center gap-3 px-2.5 py-2">
                    <WorkspaceTile name={workspace.name} size="lg" />
                    <div className="min-w-0">
                        <p className="truncate font-display font-semibold text-ink">{workspace.name}</p>
                        <p className="text-xs text-ink-3">
                            {memberCount !== undefined ? `${memberCount} ${memberCount === 1 ? "member" : "members"} · ` : ""}
                            {isAdmin ? "You're an admin" : "Member"}
                        </p>
                    </div>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                    <>
                        <DropdownMenuItem onClick={() => go("invitations")}>
                            <UserPlusIcon />
                            Invite people to {workspace.name}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setChannelOpen(true)}>
                            <HashIcon />
                            Create a channel
                        </DropdownMenuItem>
                    </>
                )}
                <DropdownMenuItem onClick={() => go(isAdmin ? "general" : "members")}>
                    <SlidersHorizontalIcon />
                    {isAdmin ? "Preferences" : "Workspace settings"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setWorkspaceOpen(true)}>
                    <PlusIcon />
                    Create a new workspace
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
