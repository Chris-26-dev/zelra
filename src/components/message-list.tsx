import { GetMessagesReturnType } from "@/features/messages/api/use-get-messages";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { Message } from "./message";
import { ChannelHero } from "./channel-hero";
import { useRef, useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { ConversationHero } from "./conversation-hero";
import { ZelraLoader } from "./zelra-loader";
import { cn } from "@/lib/utils";

const TIME_THRESHOLD = 5;

interface Props {
    memberName?: string;
    memberImage?: string;
    channelName?: string;
    channelCreationTime?: number;
    variant?: "channel" | "thread" | "conversation";
    data: GetMessagesReturnType | undefined;
    loadMore: () => void;
    isLoadingMore: boolean;
    canLoadMore: boolean;
}

const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d");
};

// A date divider. The small leaning tick echoes the logo stroke.
export const DayDivider = ({ label }: { label: React.ReactNode }) => (
    <div className="flex items-center gap-2.5 px-5 pb-1.5 pt-4 font-display text-xs font-semibold text-ink-3" role="separator">
        <span aria-hidden="true" className="h-3 w-[9px] shrink-0 bg-line-2 [clip-path:polygon(6px_0,9px_0,3px_100%,0_100%)]" />
        {label}
        <span aria-hidden="true" className="h-px flex-1 bg-line" />
    </div>
);

export const MessageList = ({
    memberName,
    memberImage,
    channelName,
    channelCreationTime,
    variant = "channel",
    data,
    loadMore,
    isLoadingMore,
    canLoadMore,
}: Props) => {
    const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
    // Messages created after this view opened arrived live; they get the spark highlight once.
    const [openedAt] = useState(() => Date.now());

    const workspaceId = useWorkspaceId();
    const { data: currentMember } = useCurrentMember({ workspaceId });
    const observerRef = useRef<IntersectionObserver | null>(null);

    const groupedMessages = data?.reduce(
        (groups, message) => {
            const date = new Date(message._creationTime);
            const dateKey = format(date, "yyyy-MM-dd");

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].unshift(message);
            return groups;
        },
        {} as Record<string, typeof data>
    );

    const isBubble = variant === "conversation";

    return (
        <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
            <div className={cn(isBubble && "mx-auto w-full max-w-3xl")}>
                {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
                    <div key={dateKey}>
                        <DayDivider label={formatDateLabel(dateKey)} />
                        {messages.map((message, index) => {
                            const prevMessage = messages[index - 1];
                            const sameAuthor = (a?: typeof message, b?: typeof message) =>
                                !!a && !!b && a.user?._id === b.user?._id &&
                                Math.abs(differenceInMinutes(new Date(a._creationTime), new Date(b._creationTime))) < TIME_THRESHOLD;
                            const isCompact = sameAuthor(message, prevMessage);

                            return (
                                <Message
                                    key={message._id}
                                    id={message._id}
                                    memberId={message.memberId}
                                    authorImage={message.user.image}
                                    authorName={message.user.name}
                                    isAuthor={message.memberId === currentMember?._id}
                                    reactions={message.reactions}
                                    body={message.body}
                                    image={message.image}
                                    updatedAt={message.updatedAt}
                                    createdAt={message._creationTime}
                                    isEditing={editingId === message._id}
                                    setEditingId={setEditingId}
                                    isCompact={isCompact}
                                    isFresh={message._creationTime > openedAt}
                                    layout={isBubble ? "bubble" : "feed"}
                                    hideThreadButton={variant === "thread"}
                                    threadCount={message.threadCount}
                                    threadImage={message.threadImage}
                                    threadName={message.threadName}
                                    threadTimestamp={message.threadTimestamp}
                                />
                            )
                        })}
                    </div>
                ))}
            </div>
            <div
                className="h-1"
                ref={(el) => {
                    if (el) {
                        observerRef.current?.disconnect();
                        const observer = new IntersectionObserver(
                            ([entry]) => {
                                if (entry.isIntersecting && canLoadMore) {
                                    loadMore();
                                }
                            },
                            { threshold: 1.0 }
                        );

                        observer.observe(el);
                        observerRef.current = observer;
                        return () => observer.disconnect();
                    }
                }}
            />
            {isLoadingMore && (
                <div className="flex justify-center py-3 text-ink-3">
                    <ZelraLoader label="Loading earlier messages" />
                </div>
            )}
            {variant === "channel" && channelName && channelCreationTime && (
                <ChannelHero
                    name={channelName}
                    creationTime={channelCreationTime}
                    isEmpty={!data || data.length === 0}
                />
            )}
            {variant === "conversation" && memberName && (
                <ConversationHero
                    name={memberName}
                    image={memberImage}
                    joinedAt={
                        data && data.length > 0
                            ? new Date(data[data.length - 1]._creationTime)
                            : undefined
                    }
                />
            )}
        </div>
    )
}
