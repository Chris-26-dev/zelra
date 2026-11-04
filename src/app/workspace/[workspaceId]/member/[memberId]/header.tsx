import { SearchIcon, UserIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hint } from "@/components/hint";
import { MemberAvatar } from "@/components/member-avatar";
import { ConversationHeader } from "@/components/conversation-header";
import { useCommandPalette } from "@/features/workspaces/store/use-shell-state";

interface Props {
    memberName?: string;
    memberImage?: string;
    role?: "admin" | "member";
    isProfileOpen?: boolean;
    onClick?: () => void;
}

export const Header = ({
    memberName = "Member",
    memberImage,
    role,
    isProfileOpen,
    onClick,
 }: Props) => {
    const [, setPalette] = useCommandPalette();

    return (
        <ConversationHeader
            actions={
                <>
                    <Button variant="ghost" size="icon" aria-label="Search" onClick={() => setPalette({ open: true, scope: "all" })}>
                        <SearchIcon className="size-[18px]" />
                    </Button>
                    <Hint label="Profile">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClick}
                            aria-label={`${memberName}'s profile`}
                            aria-pressed={isProfileOpen}
                            className={isProfileOpen ? "bg-wash text-cobalt-ink" : undefined}
                        >
                            <UserIcon className="size-[18px]" />
                        </Button>
                    </Hint>
                </>
            }
        >
            <button onClick={onClick} className="flex min-w-0 items-center gap-2.5 text-left">
                <MemberAvatar name={memberName} image={memberImage} size="md" />
                <span className="truncate font-display text-base font-semibold text-ink md:text-lg">{memberName}</span>
                {role && <Badge variant={role === "admin" ? "default" : "muted"}>{role === "admin" ? "Admin" : "Member"}</Badge>}
            </button>
        </ConversationHeader>
    )
}
