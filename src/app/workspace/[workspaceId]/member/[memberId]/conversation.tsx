import { useMemberId } from "@/hooks/use-member-id";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useGetMember } from "@/features/members/api/use-get-member";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { Header } from "./header";
import { ChatInput } from "./chat-input";
import { MessageList } from "@/components/message-list";
import { usePanel } from "@/hooks/use-panel";
import { MessageSkeleton, Skeleton } from "@/components/ui/skeleton";
import { ConversationHeader } from "@/components/conversation-header";
import { PersonCard } from "./person-card";

interface Props {
    id: Id<"conversations">;
};

export const Conversation = ({ id }: Props) => {
    const memberId = useMemberId();

    const { onOpenProfile, profileMemberId, parentMessageId, onClose } = usePanel();

    const { data: member, isLoading: memberLoading } = useGetMember({ id: memberId });
    const { results, status, loadMore } = useGetMessages({ conversationId: id });

    if (memberLoading || status === "LoadingFirstPage") {
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

    const isProfileOpen = profileMemberId === memberId;

    return (
        <div className="flex h-full min-h-0">
            <div className="flex min-w-0 flex-1 flex-col">
                <Header
                    memberName={member?.user.name}
                    memberImage={member?.user.image}
                    role={member?.role}
                    isProfileOpen={isProfileOpen}
                    onClick={() => (isProfileOpen ? onClose() : onOpenProfile(memberId))}
                />
                <MessageList
                    data={results}
                    variant="conversation"
                    memberImage={member?.user.image}
                    memberName={member?.user.name}
                    loadMore={loadMore}
                    isLoadingMore={status === "LoadingMore"}
                    canLoadMore={status === "CanLoadMore"}
                />
                <ChatInput
                    placeholder={`Message ${member?.user.name}`}
                    conversationId={id}
                />
            </div>
            {/* The person you're talking to stays in view on wide screens, unless another panel is open. */}
            {member && !profileMemberId && !parentMessageId && (
                <PersonCard member={member} onViewProfile={() => onOpenProfile(memberId)} />
            )}
        </div>
    )
}
