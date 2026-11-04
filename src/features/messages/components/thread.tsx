"use client";

import { Id } from "../../../../convex/_generated/dataModel";
import { MessageSquareDashedIcon } from "lucide-react";
import { useGetMessage } from "../api/use-get-message";
import { Message } from "@/components/message";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Quill from "quill";
import { useGenerateUploadUrl } from "@/features/upload/api/use-generate-upload-url";
import { useCreateMessage } from "../api/use-create-message";
import { useChannelId } from "@/hooks/use-channel-id";
import { toast } from "sonner";
import { useGetMessages } from "@/features/messages/api/use-get-messages";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { differenceInMinutes, format, isToday, isYesterday } from "date-fns";
import { PanelHeader } from "@/components/panel-header";
import { EmptyState } from "@/components/empty-state";
import { MessageSkeleton } from "@/components/ui/skeleton";
import { ZelraLoader } from "@/components/zelra-loader";
import { DayDivider } from "@/components/message-list";
import { useDraftKey } from "@/hooks/use-drafts";
import { writeDraft } from "@/lib/drafts";

const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

const TIME_THRESHOLD = 5;

interface Props {
    messageId: Id<"messages">;
    onClose: () => void;
};

type CreateMessageValues = {
    channelId: Id<"channels">;
    workspaceId: Id<"workspaces">;
    parentMessageId: Id<"messages">;
    body: string;
    image: Id<"_storage"> | undefined;
};

const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMMM d");
};


export const Thread = ({ messageId, onClose }: Props) => {
    const workspaceId = useWorkspaceId();
    const channelId = useChannelId();

    const [editingId, setEditingId] = useState<Id<"messages"> | null>(null);
    const [editorKey, setEditorKey] = useState(0);
    const [isPending, setIsPending] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [openedAt] = useState(() => Date.now());

    const editorRef = useRef<Quill | null>(null);

    const { data: currentMember } = useCurrentMember({ workspaceId });
    const { data: message, isLoading: loadingMessage } = useGetMessage({ id: messageId });
    // Threads also open inside DMs, where there is no channel to name.
    const channel = useQuery(api.channels.getById, channelId ? { id: channelId } : "skip");
    const draftKey = useDraftKey({ workspaceId, kind: "thread", id: messageId });

    const { mutate: generateUploadUrl } = useGenerateUploadUrl();
    const { mutate: createMessage } = useCreateMessage();

    const { results, status, loadMore } = useGetMessages({
        channelId,
        parentMessageId: messageId,
    });

    const canLoadMore = status === "CanLoadMore";
    const isLoadingMore = status === "LoadingMore";
    const subtitle = channel ? `in #${channel.name}` : undefined;

    const handleSubmit = async ({
        body,
        image
    }: {
        body: string;
        image: File | null;
    }) => {
        try {
            //console.log({ body, image });
            setIsPending(true);
            editorRef?.current?.enable(false);

            const values: CreateMessageValues = {
                channelId,
                workspaceId,
                parentMessageId: messageId,
                body,
                image: undefined,
            };

            if (image) {
                const url = await generateUploadUrl({ workspaceId }, { throwError: true });

                if (!url) {
                    throw new Error("Url not found");
                }

                const result = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": image.type },
                    body: image,
                });

                if (!result.ok) {
                    throw new Error("Failed to upload image")
                }

                const { storageId } = await result.json();

                values.image = storageId;
            };

            await createMessage(values, { throwError: true });

            if (draftKey) writeDraft(draftKey, null);

            setEditorKey((prevKey) => prevKey + 1);
        } catch (error) {
            console.log(error);
            toast.error("Failed to send message");
        } finally {
            setIsPending(false);
            editorRef?.current?.enable(true);
        }
    };

    const groupedMessages = results?.reduce(
        (groups, message) => {
            const date = new Date(message._creationTime);
            const dateKey = format(date, "yyyy-MM-dd");

            if (!groups[dateKey]) {
                groups[dateKey] = [];
            }
            groups[dateKey].unshift(message);
            return groups;
        },
        {} as Record<string, typeof results>
    );


    useEffect(() => {
        setIsMounted(true);
    }, []);


    if (loadingMessage || status === "LoadingFirstPage") {
        return (
            <div className="h-full flex flex-col">
                <PanelHeader title="Thread" subtitle={subtitle} onClose={onClose} />
                <div className="flex flex-1 flex-col justify-start">
                    <MessageSkeleton rows={3} />
                </div>
            </div>
        );
    }

    if (!message) {
        return (
            <div className="h-full flex flex-col">
                <PanelHeader title="Thread" subtitle={subtitle} onClose={onClose} />
                <EmptyState
                    icon={<MessageSquareDashedIcon />}
                    title="Message not found"
                    description="The message that started this thread may have been deleted."
                />
            </div>
        );
    }

    const replyCount = results?.length ?? 0;

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <PanelHeader title="Thread" subtitle={subtitle} onClose={onClose} />
            <div className="flex-1 flex flex-col-reverse pb-4 overflow-y-auto messages-scrollbar">
                <div className="relative">
                    {replyCount > 0 && (
                        <span aria-hidden="true" className="absolute bottom-4 left-[38px] top-12 w-0.5 bg-line" />
                    )}
                    {Object.entries(groupedMessages || {}).map(([dateKey, messages]) => (
                        <div key={dateKey}>
                            <DayDivider label={formatDateLabel(dateKey)} />
                            {messages.map((message, index) => {
                                const prevMessage = messages[index - 1];
                                const isCompact =
                                    prevMessage &&
                                    prevMessage.user?._id === message.user?._id &&
                                    differenceInMinutes(
                                        new Date(message._creationTime),
                                        new Date(prevMessage._creationTime)
                                    ) < TIME_THRESHOLD;

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
                                        hideThreadButton
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
                            const observer = new IntersectionObserver(
                                ([entry]) => {
                                    if (entry.isIntersecting && canLoadMore) {
                                        loadMore();
                                    }
                                },
                                { threshold: 1.0 }
                            );

                            observer.observe(el);
                            return () => observer.disconnect();
                        }
                    }}
                />
                {isLoadingMore && (
                    <div className="flex justify-center py-3 text-ink-3">
                        <ZelraLoader label="Loading earlier replies" />
                    </div>
                )}
                <div className="flex items-center gap-3 px-5 pt-3 text-xs font-semibold text-ink-3">
                    {replyCount === 0 ? "No replies yet. Start the thread below." : canLoadMore ? "Replies" : `${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
                    <span aria-hidden="true" className="h-px flex-1 bg-line" />
                </div>
                <div className="border-b border-line bg-paper pb-2 pt-2">
                    <Message
                        hideThreadButton
                        memberId={message.memberId}
                        authorImage={message.user.image}
                        authorName={message.user.name}
                        isAuthor={message.memberId === currentMember?._id}
                        body={message.body}
                        image={message.image}
                        createdAt={message._creationTime}
                        updatedAt={message.updatedAt}
                        id={message._id}
                        reactions={message.reactions}
                        isEditing={editingId === message._id}
                        setEditingId={setEditingId}
                    />
                </div>
            </div>
            {isMounted && (
                <div className="px-2.5 pb-3 md:px-4">
                    <Editor
                        key={editorKey}
                        onSubmit={handleSubmit}
                        innerRef={editorRef}
                        disabled={isPending}
                        placeholder="Reply…"
                        draftKey={draftKey}
                    />
                </div>
            )}
        </div>
    )
}
