import { MessageSquareTextIcon, PencilIcon, SmilePlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "./ui/button";
import { Hint } from "./hint";
import { EmojiPopover } from "./emoji-popover";
import { cn } from "@/lib/utils";

const QUICK_REACTIONS = ["👍", "✅", "👀"];

interface Props {
    isAuthor: boolean;
    isPending: boolean;
    handleEdit: () => void;
    handleThread: () => void;
    handleDelete: () => void;
    handleReaction: (value: string) => void;
    hideThreadButton?: boolean;
    align?: "start" | "end";
}

// Message actions, shown on hover and whenever focus is inside the message.
export const Toolbar = ({
    isAuthor,
    isPending,
    handleEdit,
    handleThread,
    handleDelete,
    handleReaction,
    hideThreadButton,
    align = "end",
}: Props) => {
    return (
        <div className={cn("absolute -top-4 z-10", align === "end" ? "right-4" : "left-4")}>
            <div
                role="toolbar"
                aria-label="Message actions"
                className="flex items-center rounded-lg border border-line bg-card p-0.5 opacity-0 shadow-pop transition-[opacity,transform] duration-150 translate-y-1 pointer-events-none group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100"
            >
                {QUICK_REACTIONS.map((emoji) => (
                    <Hint key={emoji} label={`React with ${emoji}`}>
                        <button
                            disabled={isPending}
                            onClick={() => handleReaction(emoji)}
                            aria-label={`React with ${emoji}`}
                            className="grid size-[30px] place-items-center rounded-md text-[15px] transition-colors hover:bg-hover disabled:opacity-50"
                        >
                            {emoji}
                        </button>
                    </Hint>
                ))}
                <span className="mx-1 h-[18px] w-px bg-line" aria-hidden="true" />
                <EmojiPopover
                    hint="Add reaction"
                    onEmojiSelect={(emoji) => handleReaction(emoji)}
                >
                    <Button variant="ghost" size="iconSm" className="size-[30px]" disabled={isPending} aria-label="Add reaction">
                        <SmilePlusIcon className="size-4" />
                    </Button>
                </EmojiPopover>
                {!hideThreadButton && (
                    <Hint label="Reply in thread">
                        <Button variant="ghost" size="iconSm" className="size-[30px]" disabled={isPending} onClick={handleThread} aria-label="Reply in thread">
                            <MessageSquareTextIcon className="size-4" />
                        </Button>
                    </Hint>
                )}
                {isAuthor && (
                    <Hint label="Edit message">
                        <Button variant="ghost" size="iconSm" className="size-[30px]" disabled={isPending} onClick={handleEdit} aria-label="Edit message">
                            <PencilIcon className="size-4" />
                        </Button>
                    </Hint>
                )}
                {isAuthor && (
                    <Hint label="Delete message">
                        <Button variant="ghost" size="iconSm" className="size-[30px] hover:bg-danger-wash hover:text-danger" disabled={isPending} onClick={handleDelete} aria-label="Delete message">
                            <Trash2Icon className="size-4" />
                        </Button>
                    </Hint>
                )}
            </div>
        </div>
    )
}
