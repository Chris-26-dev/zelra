import { Doc, Id } from "../../convex/_generated/dataModel";
import dynamic from "next/dynamic";
import { format, isToday, isYesterday } from "date-fns"
import { Hint } from "./hint";
import { Thumbnail } from "./thumbnail";
import { Toolbar } from "./toolbar";
import { useUpdateMessage } from "@/features/messages/api/use-update-message";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useRemoveMessage } from "@/features/messages/api/use-remove-message";
import { useConfirm } from "@/hooks/use-confirm";
import { useToggleReaction } from "@/features/reactions/api/use-toggle-reaction";
import { Reactions } from "./reactions";
import { usePanel } from "@/hooks/use-panel";
import { ThreadBar } from "./thread-bar";
import { MemberAvatar } from "./member-avatar";

const Renderer = dynamic(() => import("@/components/renderer"), { ssr: false });
const Editor = dynamic(() => import("@/components/editor"), { ssr: false });

interface Props {
    id: Id<"messages">;
    memberId: Id<"members">;
    authorImage?: string;
    authorName?: string;
    isAuthor: boolean;
    reactions: Array<
        Omit<Doc<"reactions">, "memberId"> & {
            count: number;
            memberIds: Id<"members">[];
        }
    >;
    body: Doc<"messages">["body"];
    image: string | null | undefined;
    createdAt: Doc<"messages">["_creationTime"];
    updatedAt: Doc<"messages">["updatedAt"];
    isEditing: boolean;
    isCompact?: boolean;
    // Arrived while the conversation was open: highlighted once with the spark edge.
    isFresh?: boolean;
    // "feed" for channels and threads, "bubble" for direct messages.
    layout?: "feed" | "bubble";
    setEditingId: (id: Id<"messages"> | null) => void;
    hideThreadButton?: boolean;
    threadCount?: number;
    threadImage?: string;
    threadName?: string;
    threadTimestamp?: number;
};

const formatFullTime = (date: Date) => {
    return `${isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "MMM d, yyyy")} at ${format(date, "h:mm:ss a")}`;
}

export const Message = ({
    id,
    isAuthor,
    memberId,
    authorImage,
    authorName = "Member",
    reactions,
    body,
    image,
    createdAt,
    updatedAt,
    isEditing,
    isCompact,
    isFresh,
    layout = "feed",
    setEditingId,
    hideThreadButton,
    threadCount,
    threadImage,
    threadName,
    threadTimestamp,
}: Props) => {
    const { parentMessageId, onOpenMessage, onOpenProfile, onClose } = usePanel();

    const [ConfirmDialog, confirm] = useConfirm(
        "Delete this message?",
        "It will be removed for everyone in the conversation. You can't undo this.",
        { confirmLabel: "Delete message", tone: "danger" },
    );

    const { mutate: updateMessage, isPending: isUpdatingMessage } = useUpdateMessage();
    const { mutate: removeMessage, isPending: isRemovingMessage } = useRemoveMessage();
    const { mutate: toggleReaction, isPending: isTogglingReaction } = useToggleReaction();

    const isPending = isUpdatingMessage || isTogglingReaction;

    const handleReaction = (value: string) => {
        toggleReaction({ messageId: id, value }, {
            onError: () => {
                toast.error("Failed to toggle reaction");
            },
        });
    };

    const handleRemove = async () => {
        const ok = await confirm();

        if (!ok) return;

        removeMessage({ id }, {
            onSuccess: () => {
                toast.success("Message deleted");

                if (parentMessageId === id) {
                    onClose();
                }
            },
            onError: () => {
                toast.error("Failed to delete message")
            },
        });
    };

    const handleUpdate = ({ body }: { body: string }) => {
        updateMessage({ id, body }, {
            onSuccess: () => {
                toast.success("Message updated");
                setEditingId(null);
            },
            onError: () => {
                toast.error("Failed to update message")
            }
        })
    };

    const editor = (
        <div className="w-full">
            <Editor
                onSubmit={handleUpdate}
                disabled={isPending}
                defaultValue={JSON.parse(body)}
                onCancel={() => setEditingId(null)}
                variant="update"
            />
        </div>
    );

    const toolbar = !isEditing && (
        <Toolbar
            isAuthor={isAuthor}
            isPending={isPending}
            handleEdit={() => setEditingId(id)}
            handleThread={() => onOpenMessage(id)}
            handleDelete={handleRemove}
            handleReaction={handleReaction}
            hideThreadButton={hideThreadButton}
            align={layout === "bubble" && isAuthor ? "start" : "end"}
        />
    );

    const edited = updatedAt ? <span className="text-[11.5px] text-ink-3">(edited)</span> : null;
    const extras = (
        <>
            <Reactions data={reactions} onChange={handleReaction} />
            <ThreadBar
                count={threadCount}
                image={threadImage}
                name={threadName}
                timestamp={threadTimestamp}
                onClick={() => onOpenMessage(id)}
            />
        </>
    );

    const rowState = cn(
        "group relative transition-colors duration-150",
        isEditing && "bg-wash",
        isFresh && !isEditing && "motion-safe:animate-fresh",
        isRemovingMessage && "pointer-events-none opacity-0 scale-[.99] transition-all duration-300",
    );

    if (layout === "bubble") {
        const firstName = authorName.split(" ")[0];
        return (
            <>
                <ConfirmDialog />
                <div className={cn(rowState, "flex gap-2.5 px-5 py-[3px]", isAuthor && "flex-row-reverse", !isCompact && "mt-2.5")}>
                    {!isAuthor && (
                        isCompact ? <span className="w-8 shrink-0" aria-hidden="true" /> : (
                            <button onClick={() => onOpenProfile(memberId)} aria-label={`Open ${authorName}'s profile`} className="self-start">
                                <MemberAvatar name={authorName} image={authorImage} size="md" />
                            </button>
                        )
                    )}
                    <div className={cn("flex min-w-0 max-w-[78%] flex-col gap-1", isAuthor ? "items-end" : "items-start", isEditing && "max-w-full flex-1")}>
                        {!isCompact && (
                            <Hint label={formatFullTime(new Date(createdAt))}>
                                <span className="px-0.5 text-[11.5px] text-ink-3 tabular-nums">
                                    {isAuthor ? "You" : firstName} · {format(new Date(createdAt), "h:mm a")}
                                </span>
                            </Hint>
                        )}
                        {isEditing ? editor : (
                            <div
                                className={cn(
                                    "min-w-0 max-w-full px-3 py-2 [--cut:9px] motion-safe:data-[fresh=true]:animate-rise",
                                    isAuthor ? "bubble-mine cut-br bg-cobalt text-on-cobalt" : "cut-tl bg-bubble text-ink",
                                )}
                                data-fresh={isFresh ? "true" : undefined}
                            >
                                <Renderer value={body} />
                                <Thumbnail url={image} />
                            </div>
                        )}
                        {!isEditing && (
                            <div className={cn("flex flex-col gap-1", isAuthor ? "items-end" : "items-start")}>
                                {edited}
                                {extras}
                            </div>
                        )}
                    </div>
                    {toolbar}
                </div>
            </>
        );
    }

    if (isCompact) {
        return (
            <>
                <ConfirmDialog />
                <div className={cn(rowState, "flex gap-3 px-5 py-[3px] hover:bg-hover focus-within:bg-hover")}>
                    <Hint label={formatFullTime(new Date(createdAt))}>
                        <button className="w-9 shrink-0 text-right text-[11px] leading-[22px] text-transparent tabular-nums group-hover:text-ink-3 group-focus-within:text-ink-3 hover:underline focus-visible:text-ink-3">
                            {format(new Date(createdAt), "h:mm")}
                        </button>
                    </Hint>
                    {isEditing ? editor : (
                        <div className="flex min-w-0 flex-1 flex-col">
                            <Renderer value={body} />
                            <Thumbnail url={image} />
                            {edited}
                            {extras}
                        </div>
                    )}
                    {toolbar}
                </div>
            </>
        );
    }

    return (
        <>
            <ConfirmDialog />
            <div className={cn(rowState, "mt-1 flex gap-3 px-5 py-1.5 hover:bg-hover focus-within:bg-hover")}>
                <button onClick={() => onOpenProfile(memberId)} aria-label={`Open ${authorName}'s profile`} className="self-start">
                    <MemberAvatar name={authorName} image={authorImage} size="lg" />
                </button>
                {isEditing ? editor : (
                    <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
                        <div className="flex items-baseline gap-2">
                            <button onClick={() => onOpenProfile(memberId)} className="truncate font-display text-[14.5px] font-semibold text-ink hover:underline">
                                {authorName}
                            </button>
                            <Hint label={formatFullTime(new Date(createdAt))}>
                                <button className="shrink-0 text-xs text-ink-3 tabular-nums hover:underline">
                                    {format(new Date(createdAt), "h:mm a")}
                                </button>
                            </Hint>
                        </div>
                        <Renderer value={body} />
                        <Thumbnail url={image} />
                        {edited}
                        {extras}
                    </div>
                )}
                {toolbar}
            </div>
        </>
    );
};
