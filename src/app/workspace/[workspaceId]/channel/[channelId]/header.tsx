import { format } from "date-fns";
import { InfoIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Hint } from "@/components/hint";
import { ConversationHeader } from "@/components/conversation-header";
import { useCommandPalette } from "@/features/workspaces/store/use-shell-state";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { useWorkspaceId } from "@/hooks/use-workspace-id";
import { usePanel } from "@/hooks/use-panel";
import { cn } from "@/lib/utils";

interface Props {
    title: string;
    createdAt?: number;
}

// Channel rename and delete now live in the channel details panel (Info).
export const Header = ({ title, createdAt }: Props) => {
    const workspaceId = useWorkspaceId();
    const { data: workspace } = useGetWorkspace({ id: workspaceId });
    const [, setPalette] = useCommandPalette();
    const { channelInfoOpen, onOpenChannelInfo, onClose } = usePanel();

    return (
        <ConversationHeader
            context={workspace?.name}
            actions={
                <>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPalette({ open: true, scope: "all" })}
                        className="hidden border-line text-ink-3 hover:text-ink md:inline-flex"
                    >
                        <SearchIcon />
                        Search
                        <Kbd>Ctrl K</Kbd>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setPalette({ open: true, scope: "all" })}
                        aria-label="Search"
                        className="md:hidden"
                    >
                        <SearchIcon className="size-5" />
                    </Button>
                    <Hint label="Channel details">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => (channelInfoOpen ? onClose() : onOpenChannelInfo())}
                            aria-label="Channel details"
                            aria-pressed={channelInfoOpen}
                            className={cn(channelInfoOpen && "bg-wash text-cobalt-ink")}
                        >
                            <InfoIcon className="size-[18px]" />
                        </Button>
                    </Hint>
                </>
            }
        >
            <button
                onClick={onOpenChannelInfo}
                className="flex min-w-0 items-center gap-1 text-left font-display text-base font-semibold text-ink hover:underline md:text-lg"
            >
                <span className="text-ink-3">#</span>
                <span className="truncate">{title}</span>
            </button>
            {createdAt && (
                <span className="hidden shrink-0 text-[12.5px] text-ink-3 lg:inline">
                    Created {format(createdAt, "MMMM d, yyyy")}
                </span>
            )}
        </ConversationHeader>
    )
}
