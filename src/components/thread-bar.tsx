import { formatDistanceToNow } from "date-fns";
import { ChevronRight } from "lucide-react";

import { MemberAvatar } from "./member-avatar";

interface Props {
    count?: number;
    image?: string;
    timestamp?: number;
    name?: string;
    onClick?: () => void;
};

export const ThreadBar = ({
    count,
    image,
    timestamp,
    name = "Member",
    onClick,
}: Props) => {
    if (!count || !timestamp) return null;

    return (
        <div>
            <button
                onClick={onClick}
                className="group/thread-bar mt-1.5 flex max-w-[600px] items-center gap-2 rounded-lg border border-transparent py-1 pl-1 pr-2.5 text-[12.5px] transition-colors hover:border-line hover:bg-card"
            >
                <MemberAvatar name={name} image={image} size="xs" />
                <span className="font-semibold text-cobalt-ink">
                    {count} {count > 1 ? "replies" : "reply"}
                </span>
                <span className="truncate text-ink-3">
                    Last reply {formatDistanceToNow(timestamp, { addSuffix: true })}
                </span>
                <ChevronRight className="size-4 shrink-0 text-ink-3 opacity-0 transition-opacity group-hover/thread-bar:opacity-100 group-focus-visible/thread-bar:opacity-100" />
            </button>
        </div>
    )
}
