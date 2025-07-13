import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { Doc, Id } from "../../convex/_generated/dataModel";
import { useCurrentMember } from "@/features/members/api/use-current-member";
import { cn } from "@/lib/utils";
import { Hint } from "./hint";
import { EmojiPopover } from "./emoji-popover";
import { MdOutlineAddReaction } from "react-icons/md";
import { useGetMembers } from "@/features/members/api/use-get-members";

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

    const currentMemberId = currentMember?._id;

    if (data.length === 0 || !currentMemberId || !currentMemberId || !allMembers) {
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
    return (
        <div className="flex items-center gap-1 mt-1 mb-1">
            {data.map((reaction) => (
                <Hint
                    key={reaction._id}
                    side="bottom"
                    label={`${getNames(reaction.memberIds)} reacted with ${reaction.value}`}
                //{`${reaction.count} ${reaction.count === 1 ? "person" : "people"} reacted with ${reaction.value}`}
                >
                    <button
                        onClick={() => onChange(reaction.value)}
                        className={cn(
                            "h-6 px-2 rounded-full bg-slate-200/70 border border-transparent text-slate-800 flex items-center gap-x-1",
                            reaction.memberIds.includes(currentMemberId) && "bg-blue-100/70 border-blue-500 text-white"
                        )}>
                        {reaction.value}
                        <span className={cn(
                            "text-xs font-semibold text-muted-foreground",
                            reaction.memberIds.includes(currentMemberId) && "text-blue-500",
                        )}
                        >
                            {reaction.count}
                        </span>
                    </button>
                </Hint>
            ))}
            <EmojiPopover
                hint="Add reaction"
                onEmojiSelect={(emoji) => onChange(emoji)}
            >
                <button className="h-7 px-3 rounded-full bg-slate-200/70 border border-transparent hover:border-slate-500 text-slate-800 flex items-center gap-x-1">
                    <MdOutlineAddReaction className="size-4" />
                </button>
            </EmojiPopover>
        </div>
    )
}