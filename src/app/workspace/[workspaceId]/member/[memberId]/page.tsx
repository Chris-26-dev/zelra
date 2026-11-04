"use client";

import { useCreateOrGetConversation } from "@/features/conversations/api/use-create-or-get-conversation";
import { useMemberId } from "@/hooks/use-member-id";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { MessageCircleOffIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import { Conversation } from "./conversation";
import { ConversationHeader } from "@/components/conversation-header";
import { EmptyState } from "@/components/empty-state";
import { MessageSkeleton, Skeleton } from "@/components/ui/skeleton";

const MemberIdPage = () => {
    const memberId = useMemberId();
    const workspaceId = useWorkspaceId();

    const [conversationId, setConversationId] = useState<Id<"conversations"> | null>(null);

    const { mutate, isPending } = useCreateOrGetConversation();

    useEffect(() => {
        mutate({ workspaceId, memberId } , {
            onSuccess(data) {
                setConversationId(data);
            },
            onError() {
                toast.error("Failed to create or get conversation")
            },
        })
    }, [memberId, workspaceId, mutate]);

    if (isPending) {
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

    if (!conversationId) {
        return (
            <div className="flex h-full flex-col">
                <ConversationHeader>
                    <span className="font-display font-semibold text-ink-3">Direct message</span>
                </ConversationHeader>
                <EmptyState
                    icon={<MessageCircleOffIcon />}
                    title="Conversation not found"
                    description="This person may have left the workspace. Pick someone else from Direct messages."
                />
            </div>
        )
    }

    return <Conversation id={conversationId}/>
};

export default MemberIdPage;
