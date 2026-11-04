"use client";

import Link from "next/link";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useRouter } from "next/navigation";
import { useCreateChannelModal } from "@/features/channels/store/use-create-channel-modal";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useGetChannels } from "@/features/channels/api/use-get-channels";
import { useMemo, useEffect } from "react";
import { HashIcon, PlusIcon, TriangleAlertIcon } from "lucide-react";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { ConversationHeader } from "@/components/conversation-header";
import { EmptyState } from "@/components/empty-state";
import { MessageSkeleton, Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

const WorkspaceIdPage = () => {
    const router = useRouter();
    const workspaceId = useWorkspaceId();
    const [open, setOpen] = useCreateChannelModal();

    const { data: member, isLoading: memberLoading } = useCurrentMember({ workspaceId });
    const { data: workspace, isLoading: workspaceLoading } = useGetWorkspace({ id: workspaceId });
    const { data: channels, isLoading: channelsLoading } = useGetChannels({ workspaceId });

    //Find the 1st available channel ID
    const channelId = useMemo(() => channels?.[0]?._id, [channels]);
    const isAdmin = useMemo(() => member?.role === "admin", [member?.role]);

    useEffect(() => {
        if (workspaceLoading || channelsLoading || memberLoading || !member || !workspace) return;

        //redirect the user to the 1st available channel ID
        if (channelId) {
            router.push(`/workspace/${workspaceId}/channel/${channelId}`);
        } else if (!open && isAdmin) {
            setOpen(true)
        }
    }, [
        member,
        memberLoading,
        isAdmin,
        channelId,
        workspaceLoading,
        channelsLoading,
        workspace,
        open,
        setOpen,
        router,
        workspaceId
    ]);

    if (workspaceLoading || channelsLoading || memberLoading || channelId) {
        return (
            <div className="flex h-full flex-col">
                <ConversationHeader>
                    <Skeleton className="h-4 w-40" />
                </ConversationHeader>
                <div className="flex flex-1 flex-col justify-end">
                    <MessageSkeleton />
                </div>
            </div>
        )
    }

    if (!workspace || !member) {
        return (
            <EmptyState
                icon={<TriangleAlertIcon />}
                title="Workspace not found"
                description="It may have been deleted, or you're no longer a member."
            >
                <Button asChild variant="outline">
                    <Link href="/">Go to my workspaces</Link>
                </Button>
            </EmptyState>
        );
    }

    return (
        <div className="flex h-full flex-col">
            <ConversationHeader context={workspace.name}>
                <span className="font-display text-base font-semibold md:text-lg">{workspace.name}</span>
            </ConversationHeader>
            <EmptyState
                icon={<HashIcon />}
                title="No channels yet"
                description={isAdmin
                    ? "Channels hold conversations about one topic. Create the first one to get your team talking."
                    : "An admin needs to create the first channel. In the meantime, you can message people directly."}
            >
                {isAdmin ? (
                    <Button onClick={() => setOpen(true)}>
                        <PlusIcon />
                        Create a channel
                    </Button>
                ) : (
                    <Button asChild variant="outline">
                        <Link href={`/workspace/${workspaceId}/people`}>Find people to message</Link>
                    </Button>
                )}
            </EmptyState>
        </div>
    );
};

export default WorkspaceIdPage;
