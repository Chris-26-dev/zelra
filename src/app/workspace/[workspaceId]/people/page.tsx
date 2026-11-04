"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { SearchIcon, UserPlusIcon, UsersIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MemberAvatar } from "@/components/member-avatar";
import { EmptyState } from "@/components/empty-state";
import { ZelraLoader } from "@/components/zelra-loader";
import { ConversationHeader } from "@/components/conversation-header";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useMobileNav } from "@/features/workspaces/store/use-shell-state";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePanel } from "@/hooks/use-panel";
import { MobileTabBar } from "../mobile-nav";

// Everyone in the workspace, with a direct way to message them.
// A recent-conversations inbox will join this view once its read-only query exists.
const PeoplePage = () => {
    const workspaceId = useWorkspaceId();
    const isMobile = useIsMobile();
    const [, setNavOpen] = useMobileNav();
    const { onOpenProfile } = usePanel();
    const [query, setQuery] = useState("");

    const { data: workspace } = useGetWorkspace({ id: workspaceId });
    const { data: members, isLoading } = useGetMembers({ workspaceId });
    const { data: currentMember } = useCurrentMember({ workspaceId });

    const isAdmin = currentMember?.role === "admin";
    const rows = (members ?? []).filter((m) => (m.user.name ?? "").toLowerCase().includes(query.trim().toLowerCase()));

    return (
        <div className="flex h-full flex-col">
            <ConversationHeader
                context={workspace?.name}
                actions={isAdmin ? (
                    <Button asChild size="sm">
                        <Link href={`/workspace/${workspaceId}/settings?tab=invitations`}>
                            <UserPlusIcon />
                            <span className="max-sm:sr-only">Invite people</span>
                        </Link>
                    </Button>
                ) : undefined}
            >
                <span className="flex items-center gap-2 font-display text-base font-semibold md:text-lg">
                    <UsersIcon className="size-[18px] text-ink-3 max-md:hidden" />
                    People
                </span>
                {members && (
                    <span className="hidden text-[12.5px] text-ink-3 lg:inline">
                        {members.length} {members.length === 1 ? "member" : "members"} of {workspace?.name}
                    </span>
                )}
            </ConversationHeader>
            <div className="min-h-0 flex-1 overflow-y-auto messages-scrollbar">
                <div className="grid gap-5 px-4 py-5 md:px-8 md:py-7">
                    <div className="relative max-w-sm">
                        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search people"
                            aria-label="Search people"
                            className="pl-9"
                        />
                    </div>
                    {isLoading ? (
                        <div className="grid place-items-center py-16 text-ink-3"><ZelraLoader label="Loading people" /></div>
                    ) : rows.length === 0 ? (
                        <EmptyState icon={<UsersIcon />} title="No one matches that name" description="Check the spelling, or clear the search to see everyone." />
                    ) : (
                        <ul role="list" className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
                            {rows.map((m) => {
                                const isSelf = m._id === currentMember?._id;
                                const name = m.user.name ?? "Member";
                                return (
                                    <li key={m._id} className="flex items-center gap-3 rounded-xl border border-line bg-card p-4 transition-[border-color,transform] duration-150 hover:-translate-y-px hover:border-line-2 sm:flex-col sm:items-start">
                                        <MemberAvatar name={name} image={m.user.image} size="xl" />
                                        <div className="min-w-0 flex-1">
                                            <p className="flex items-center gap-2 font-display text-[15px] font-semibold">
                                                <span className="truncate">{name}</span>
                                                {isSelf && <Badge variant="muted">You</Badge>}
                                            </p>
                                            <p className="text-[12.5px] text-ink-3">
                                                {m.role === "admin" ? "Admin" : "Member"} · joined {format(m._creationTime, "MMM d, yyyy")}
                                            </p>
                                        </div>
                                        <div className="flex gap-1.5 sm:w-full">
                                            <Button asChild size="sm">
                                                <Link href={`/workspace/${workspaceId}/member/${m._id}`}>{isSelf ? "Notes" : "Message"}</Link>
                                            </Button>
                                            <Button size="sm" variant="outline" onClick={() => onOpenProfile(m._id)} className="max-sm:hidden">
                                                Profile
                                            </Button>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                    <p className="text-[12.5px] text-ink-3">A list of your recent conversations, with message previews, is coming later.</p>
                </div>
            </div>
            {isMobile && <MobileTabBar active="people" onHome={() => setNavOpen(true)} />}
        </div>
    );
};

export default PeoplePage;
