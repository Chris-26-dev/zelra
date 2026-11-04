import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id"
import { AlertTriangle, ArrowLeftIcon, BellIcon, FileTextIcon, HashIcon, MessagesSquareIcon, SearchIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { WorkspaceHeader } from "./workspace-header";
import { SidebarItem, navRowVariants } from "./sidebar-item";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { WorkspaceSection } from "./workspace-section";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { UserItem } from "./user-item";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useCommandPalette } from "@/features/workspaces/store/use-shell-state";
import { useChannelId } from "@/hooks/use-channel-id";
import { useMemberId } from "@/hooks/use-member-id";
import { useDraftCount } from "@/hooks/use-drafts";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { Hint } from "@/components/hint";
import { WorkspaceTile } from "@/components/workspace-tile";
import { ZelraLoader } from "@/components/zelra-loader";
import { cn } from "@/lib/utils";
import { resolveTab, settingsTabs } from "./settings/settings-tabs";

interface Props {
    // Called after a navigation link is followed (closes the phone navigation sheet).
    onNavigate?: () => void;
}

export const WorkspaceSidebar = ({ onNavigate }: Props) => {
    const memberId = useMemberId();
    const channelId = useChannelId();
    const workspaceId = useWorkspaceId();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [, setOpen] = useCreateChannelModal();
    const [, setPalette] = useCommandPalette();
    const draftCount = useDraftCount(workspaceId);

    const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
    const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ id: workspaceId });
    const { data: channels } = useGetChannels({ workspaceId });
    const { data: members } = useGetMembers({ workspaceId });

    if (workspaceLoading || memberLoading) {
        return (
            <div className="flex h-full flex-col items-center justify-center">
                <ZelraLoader className="text-n-ink-3" label="Loading workspace" />
            </div>
        );
    }

    if (!member || !workspace) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-y-2 px-4 text-center">
                <AlertTriangle className="size-5 text-n-ink-3" />
                <p className="text-sm text-n-ink-2">
                    Workspace not found
                </p>
            </div>
        );
    }

    const isAdmin = member.role === "admin";

    if (pathname.endsWith("/settings")) {
        const active = resolveTab(searchParams.get("tab"), isAdmin);
        return (
            <aside aria-label="Workspace settings" className="flex h-full flex-col gap-1 overflow-y-auto px-2 py-3 text-n-ink">
                <Link
                    href={channels?.[0] ? `/workspace/${workspaceId}/channel/${channels[0]._id}` : `/workspace/${workspaceId}`}
                    onClick={onNavigate}
                    className="flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] text-n-ink-2 transition-colors hover:bg-n-hover hover:text-n-ink"
                >
                    <ArrowLeftIcon className="size-4" />
                    Back to {workspace.name}
                </Link>
                <div className="flex items-center gap-2.5 px-2 pb-2 pt-1.5">
                    <WorkspaceTile name={workspace.name} size="md" />
                    <span className="font-display text-[17px] font-semibold">Workspace settings</span>
                </div>
                <nav aria-label="Settings sections" className="flex flex-col gap-px">
                    {settingsTabs(isAdmin).map((tab) => (
                        <Link
                            key={tab.key}
                            href={`/workspace/${workspaceId}/settings?tab=${tab.key}`}
                            onClick={onNavigate}
                            aria-current={active === tab.key ? "page" : undefined}
                            className={cn(navRowVariants({ variant: active === tab.key ? "active" : "default" }), "h-[34px]")}
                        >
                            <tab.icon className="size-4 shrink-0 opacity-75" />
                            <span className="truncate">{tab.label}</span>
                            {tab.key === "members" && members && (
                                <span className="ml-auto text-xs opacity-70">{members.length}</span>
                            )}
                        </Link>
                    ))}
                </nav>
            </aside>
        );
    }

    return (
        <aside aria-label={workspace.name} className="flex h-full flex-col overflow-y-auto px-2 pb-4 pt-3 text-n-ink [scrollbar-width:thin] [scrollbar-color:var(--n-line)_transparent]">
            <div className="flex items-center">
                <WorkspaceHeader workspace={workspace} isAdmin={isAdmin} memberCount={members?.length} onNavigate={onNavigate} />
            </div>
            <button
                onClick={() => setPalette({ open: true, scope: "all" })}
                className="mx-0.5 mb-2 mt-2 flex h-[34px] items-center gap-2 rounded-lg border border-n-line bg-n-hover px-2.5 text-[13px] text-n-ink-2 transition-colors hover:bg-white/10 hover:text-n-ink"
            >
                <SearchIcon className="size-[15px]" />
                Jump to…
                <Kbd className="ml-auto max-md:hidden">Ctrl K</Kbd>
            </button>
            <nav aria-label="Workspace views" className="flex flex-col gap-px">
                <Link
                    href={`/workspace/${workspaceId}/people`}
                    onClick={onNavigate}
                    aria-current={pathname.endsWith("/people") ? "page" : undefined}
                    className={navRowVariants({ variant: pathname.endsWith("/people") ? "active" : "default" })}
                >
                    <UsersIcon className="size-[15px] shrink-0 opacity-75" />
                    <span>People</span>
                </Link>
                <SoonRow icon={<BellIcon className="size-[15px] shrink-0 opacity-75" />} label="Activity" hint="Replies and reactions to your messages. Coming soon." />
                <SoonRow icon={<MessagesSquareIcon className="size-[15px] shrink-0 opacity-75" />} label="Threads" hint="Threads you started or replied to. Coming soon." />
                <Hint label="Unsent messages saved on this device" side="right">
                    <div tabIndex={0} className={cn(navRowVariants(), "cursor-default hover:bg-transparent hover:text-n-ink-2")}>
                        <FileTextIcon className="size-[15px] shrink-0 opacity-75" />
                        <span>Drafts</span>
                        {draftCount > 0 ? (
                            <Badge variant="spark" className="ml-auto" aria-label={`${draftCount} unsent ${draftCount === 1 ? "draft" : "drafts"}`}>{draftCount}</Badge>
                        ) : (
                            <span className="ml-auto text-xs text-n-ink-3">0</span>
                        )}
                    </div>
                </Hint>
            </nav>
            <WorkspaceSection
                label="Channels"
                hint="Create a channel"
                onNew={isAdmin ? () => setOpen(true) : undefined}
            >
                {channels?.map((item) => (
                    <SidebarItem
                        key={item._id}
                        icon={HashIcon}
                        label={item.name}
                        id={item._id}
                        variant={channelId === item._id ? "active" : "default"}
                        onNavigate={onNavigate}
                    />
                ))}
            </WorkspaceSection>
            <WorkspaceSection
                label="Direct messages"
                hint="Message someone"
                onNew={() => setPalette({ open: true, scope: "people" })}
            >
                {members?.map((item) => (
                    <UserItem
                        key={item._id}
                        id={item._id}
                        label={item.user.name}
                        image={item.user.image}
                        isYou={item._id === member._id}
                        variant={item._id === memberId ? "active" : "default"}
                        onNavigate={onNavigate}
                    />
                ))}
            </WorkspaceSection>
        </aside>
    )
}

// A planned view that keeps its place in navigation until its backend query exists.
const SoonRow = ({ icon, label, hint }: { icon: React.ReactNode; label: string; hint: string }) => (
    <Hint label={hint} side="right">
        <div
            tabIndex={0}
            aria-disabled="true"
            className={cn(navRowVariants(), "cursor-default text-n-ink-3 hover:bg-transparent hover:text-n-ink-3")}
        >
            {icon}
            <span>{label}</span>
            <Badge variant="night" className="ml-auto">Soon</Badge>
        </div>
    </Hint>
);
