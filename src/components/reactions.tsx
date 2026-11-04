import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { cn } from "@/lib/utils";
import { Hint } from "./hint";
import { EmojiPopover } from "./emoji-popover";
import { SmilePlusIcon } from "lucide-react";
import { useGetMembers } from "@/features/members/api/use-get-members";
import { useState } from "react";

interface Props {
    data: Array<
        Omit<Doc<"reactions">, "memberId"> & {
            count: number;
            memberIds: Id<"members">[]
        }
    >;
    onChange: (value: string) => void;
};

export const Reactions = ({
    data,
    onChange
}: Props) => {
    const workspaceId = useWorkspaceId();
    const { data: currentMember } = useCurrentMember({ workspaceId });
    const { data: allMembers } = useGetMembers({ workspaceId });
    const [popped, setPopped] = useState<string | null>(null);

    const currentMemberId = currentMember?._id;

    if (data.length === 0 || !currentMemberId || !allMembers) {
        return null;
    }

    const getNames = (ids: Id<"members">[]) => {
        const names = ids.map((id) => {
            if (id === currentMemberId) return "You";
            const member = allMembers.find((m) => m._id === id);
            return member?.user?.name ?? "Unknown";
        });

        const max = 3;
        const displayed = names.slice(0, max);
        const remaining = names.length - displayed.length;

        return remaining > 0
            ? `${displayed.join(", ")}, +${remaining} more`
            : displayed.join(", ");
    };

    const toggle = (value: string) => {
        setPopped(value);
        onChange(value);
    };

    return (
        <div className="mt-1.5 mb-0.5 flex flex-wrap items-center gap-1.5">
            {data.map((reaction) => {
                const isMine = reaction.memberIds.includes(currentMemberId);
                return (
                    <Hint
                        key={reaction._id}
                        side="bottom"
                        label={`${getNames(reaction.memberIds)} reacted with ${reaction.value}`}
                    >
                        <button
                            onClick={() => toggle(reaction.value)}
                            onAnimationEnd={() => setPopped(null)}
                            aria-pressed={isMine}
                            aria-label={`${reaction.value} ${reaction.count}. ${getNames(reaction.memberIds)} reacted.`}
                            className={cn(
                                "flex h-[26px] items-center gap-1.5 rounded-md border px-2 text-xs font-semibold transition-colors",
                                isMine
                                    ? "border-cobalt bg-wash text-cobalt-ink"
                                    : "border-line bg-card text-ink-2 hover:border-line-2",
                                popped === reaction.value && "motion-safe:animate-pop",
                            )}
                        >
                            <span className="text-sm leading-none">{reaction.value}</span>
                            {reaction.count}
                        </button>
                    </Hint>
                );
            })}
            <EmojiPopover
                hint="Add reaction"
                onEmojiSelect={(emoji) => toggle(emoji)}
            >
                <button
                    aria-label="Add reaction"
                    className="grid h-[26px] w-[30px] place-items-center rounded-md border border-line bg-card text-ink-3 opacity-0 transition-opacity hover:border-line-2 hover:text-ink group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100"
                >
                    <SmilePlusIcon className="size-3.5" />
                </button>
            </EmojiPopover>
        </div>
    )
}
