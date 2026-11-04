"use client";

import Link from "next/link";
import { useGetChannel } from "@/features/channels/api/use-get-channel";
import { useChannelId } from "@/hooks/use-channel-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { HashIcon } from "lucide-react";
import { Header } from "./header";
import { ChatInput } from "./chat-input";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { MessageList } from "@/components/message-list";
import { MessageSkeleton, Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ConversationHeader } from "@/components/conversation-header";
import { Button } from "@/components/ui/button";

const ChannelIdPage = () => {
    const channelId = useChannelId();
    const workspaceId = useWorkspaceId();

    const { results, status, loadMore } = useGetMessages({ channelId });
    const { data: channel, isLoading: channelLoading } = useGetChannel({ id: channelId });

    if (channelLoading || status === "LoadingFirstPage") {
        return (
            <div className="flex h-full flex-col">
                <ConversationHeader>
                    <Skeleton className="h-4 w-40" />
                </ConversationHeader>
                <div className="flex flex-1 flex-col justify-end">
                    <MessageSkeleton />
                </div>
            </div>
        );
    }

    if (!channel) {
        return (
            <div className="flex h-full flex-col">
                <ConversationHeader>
                    <span className="font-display font-semibold text-ink-3">Channel</span>
                </ConversationHeader>
                <EmptyState
                    icon={<HashIcon />}
                    title="Channel not found"
                    description="It may have been deleted, or you followed an old link."
                >
                    <Button asChild variant="outline">
                        <Link href={`/workspace/${workspaceId}`}>Back to the workspace</Link>
                    </Button>
                </EmptyState>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <Header title={channel.name} createdAt={channel._creationTime} />
                <MessageList
                    channelName={channel.name}
                    channelCreationTime={channel._creationTime}
                    data={results}
                    loadMore={loadMore}
                    isLoadingMore={status === "LoadingMore"}
                    canLoadMore={status === "CanLoadMore"}
                />
            <ChatInput placeholder={`Message #${channel.name}`}/>
        </div>
    );
};

export default ChannelIdPage;
